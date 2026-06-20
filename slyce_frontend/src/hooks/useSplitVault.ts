/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { graphqlClient } from "../lib/suiClient";
import { getPackageId } from "../lib/contract";

const SUI_DECIMALS = 9;

export interface VaultBalance {
  coinType: string;
  symbol: string;
  totalAmount: number;
  displayAmount: string;
}

function formatVaultAmount(amount: number, coinType: string): string {
  const isSui = coinType === "0x2::sui::SUI" || coinType.endsWith("::sui::SUI");
  const decimals = isSui ? SUI_DECIMALS : 0;
  const formatted = amount / Math.pow(10, decimals);

  const parts = coinType.split("::");
  const symbol = parts[parts.length - 1]?.toUpperCase() || "TOKEN";

  return `${formatted.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })} ${symbol}`;
}

export function useSplitVault(splitId: string) {
  const [vaultBalances, setVaultBalances] = useState<VaultBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!splitId) return;
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    const packageId = getPackageId();

    graphqlClient
      .query({
        query: `
          query GetSplitDeposits($type: String) {
            events(filter: { type: $type }, first: 100) {
              nodes {
                contents { json }
              }
            }
          }
        `,
        variables: {
          type: `${packageId}::slyce::FundsDepositedEvent`,
        },
      })
      .then((result: any) => {
        const nodes = result.data?.events?.nodes ?? [];
        const totals: Record<string, number> = {};

        for (const node of nodes) {
          const json = node.contents?.json;
          if (json?.split_id === splitId && json?.coin_type && json?.amount) {
            const ct = json.coin_type as string;
            totals[ct] = (totals[ct] || 0) + Number(json.amount);
          }
        }

        const balances: VaultBalance[] = Object.entries(totals).map(
          ([coinType, totalAmount]) => ({
            coinType,
            symbol: coinType.split("::").pop()?.toUpperCase() || "TOKEN",
            totalAmount,
            displayAmount: formatVaultAmount(totalAmount, coinType),
          }),
        );

        setVaultBalances(balances);
        setLoading(false);
        fetchingRef.current = false;
      })
      .catch((err: any) => {
        console.error("Error fetching vault balances:", err);
        setLoading(false);
        fetchingRef.current = false;
      });
  }, [splitId]);

  return { vaultBalances, loading, hasFunds: vaultBalances.length > 0 };
}
