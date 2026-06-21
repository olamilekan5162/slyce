/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCurrentAccount, useCurrentClient } from "@mysten/dapp-kit-react";
import { useEffect, useRef, useState } from "react";
import { graphqlClient } from "../lib/suiClient";
import { getPackageId } from "../lib/contract";
import type { Activity } from "../types";

export function useFetchTransactions() {
  const currentAccount = useCurrentAccount();
  const client = useCurrentClient();
  const [transactions, setTransactions] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!currentAccount?.address) return;
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    const address = currentAccount.address;
    const packageId = getPackageId();
    const eventType = `${packageId}::slyce::PaymentDistributedEvent`;

    setLoading(true);
    setError(null);

    graphqlClient
      .query({
        query: `
          query GetUserPayments($type: String) {
            events(filter: { type: $type }, first: 50) {
              nodes {
                sender { address }
                timestamp
                contents { json }
              }
            }
          }
        `,
        variables: { type: eventType },
      })
      .then(async (result: any) => {
        const nodes = result.data?.events?.nodes ?? [];
        const activities: Activity[] = [];

        // Cache metadata to avoid redundant network requests for the same coinType
        const metadataCache: Record<
          string,
          { decimals: number; symbol: string }
        > = {};

        for (const node of nodes) {
          const json = node.contents?.json;

          if (!json) continue;

          // Only include events where the current user is the recipient
          if (json.recipient !== address) continue;

          const splitId = json.split_id;
          const amount = json.amount;
          let coinType = json.coin_type;

          if (!splitId || !amount) continue;

          if (coinType && !coinType.startsWith("0x")) {
            coinType = "0x" + coinType;
          }

          let decimals = 9;
          let symbol = "TOKEN";

          if (coinType) {
            if (!metadataCache[coinType]) {
              try {
                const meta = await client.core.getCoinMetadata({ coinType });
                metadataCache[coinType] = {
                  decimals: meta?.coinMetadata?.decimals ?? 9,
                  symbol:
                    meta?.coinMetadata?.symbol ??
                    coinType.split("::").pop()?.toUpperCase() ??
                    "TOKEN",
                };
              } catch (e) {
                // Fallback if metadata fails
                metadataCache[coinType] = {
                  decimals: coinType.endsWith("::sui::SUI") ? 9 : 0,
                  symbol: coinType.split("::").pop()?.toUpperCase() || "TOKEN",
                };
              }
            }
            decimals = metadataCache[coinType].decimals;
            symbol = metadataCache[coinType].symbol;
          }

          const formattedSplitId = `${splitId.slice(0, 6)}...${splitId.slice(-4)}`;

          const numAmount = Number(amount);
          const formattedValue = numAmount / Math.pow(10, decimals);
          const formattedAmount = `${formattedValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: Math.min(decimals, 4),
          })} ${symbol}`;

          const timestamp = node.timestamp;
          const date = timestamp
            ? new Date(timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "";

          const time = timestamp
            ? new Date(timestamp).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })
            : "";

          activities.push({
            id: splitId,
            type: "receive",
            title: formattedSplitId,
            sender: splitId,
            amount: formattedAmount,
            date,
            time,
            status: "Completed",
          });
        }

        setTransactions(activities);
        setLoading(false);
        fetchingRef.current = false;
      })
      .catch((err: any) => {
        console.error("Error fetching transactions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load transactions.",
        );
        setLoading(false);
        fetchingRef.current = false;
      });
  }, [currentAccount?.address, client]);

  return { transactions, loading, error };
}
