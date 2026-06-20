/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useEffect, useRef, useState } from "react";
import { graphqlClient } from "../lib/suiClient";
import { getPackageId } from "../lib/contract";
import type { Activity } from "../types";

const SUI_DECIMALS = 9;

function formatAmount(amount: string, coinType: string): string {
  const num = Number(amount);
  // Default to SUI decimals (9) for SUI coin, otherwise show raw
  const isSui = coinType === "0x2::sui::SUI" || coinType.endsWith("::sui::SUI");
  const decimals = isSui ? SUI_DECIMALS : 0;
  const formatted = num / Math.pow(10, decimals);

  // Extract symbol from coin type
  const parts = coinType.split("::");
  const symbol = parts[parts.length - 1]?.toUpperCase() || "TOKEN";

  return `${formatted.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })} ${symbol}`;
}

export function useFetchTransactions() {
  const currentAccount = useCurrentAccount();
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
      .then((result: any) => {
        const nodes = result.data?.events?.nodes ?? [];
        const activities: Activity[] = [];

        for (const node of nodes) {
          const json = node.contents?.json;
          if (!json) continue;

          // Only include events where the current user is the recipient
          if (json.recipient !== address) continue;

          const splitId = json.split_id;
          const amount = json.amount;
          const coinType = json.coin_type;

          if (!splitId || !amount) continue;

          const formattedSplitId = `${splitId.slice(0, 6)}...${splitId.slice(-4)}`;
          const formattedAmount = formatAmount(amount, coinType || "");

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
  }, [currentAccount?.address]);

  return { transactions, loading, error };
}
