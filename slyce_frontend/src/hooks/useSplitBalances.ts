/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useCurrentClient } from "@mysten/dapp-kit-react";
import { graphqlClient } from "../lib/suiClient";
import { getTokenPrice, TOKEN_ICONS } from "../lib/helpers";
import type { Asset } from "../types";

export function useSplitBalances(splitId: string) {
  const client = useCurrentClient();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState<{
    amount: number;
    percent: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!splitId) return;
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);

    graphqlClient
      .query({
        query: `
          query GetVaultBalances($id: SuiAddress!) {
            object(address: $id) {
              dynamicFields(first: 20) {
                nodes {
                  value {
                    ... on MoveValue {
                      json
                      type { repr }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { id: splitId },
      })
      .then(async (result: any) => {
        const nodes = result.data?.object?.dynamicFields?.nodes ?? [];

        // Filter only Balance<T> dynamic fields
        const vaultNodes = nodes.filter((node: any) => {
          const repr: string = node.value?.type?.repr ?? "";
          return repr.includes("::balance::Balance<");
        });

        const vaultAssets: Asset[] = [];

        for (const node of vaultNodes) {
          const repr: string = node.value?.type?.repr ?? "";

          // Extract T from Balance<T>
          const match = repr.match(/::balance::Balance<(.+)>$/);
          if (!match) continue;

          const coinType = match[1];
          const rawAmount = Number(node.value?.json ?? 0);
          if (rawAmount === 0) continue;

          const meta = await client.core.getCoinMetadata({ coinType });
          const metadata = meta.coinMetadata;
          const decimals = metadata?.decimals ?? 9;
          const formattedBalance = rawAmount / Math.pow(10, decimals);

          const { price: priceUsd, change24h } = await getTokenPrice(coinType);
          const usdValue = formattedBalance * priceUsd;

          vaultAssets.push({
            coinType,
            symbol: metadata?.symbol ?? coinType.split("::").pop() ?? "",
            name: metadata?.name ?? "",
            decimals,
            iconUrl:
              metadata?.iconUrl ||
              TOKEN_ICONS[
                metadata?.symbol || coinType.split("::").pop() || ""
              ] ||
              "",
            balance: formattedBalance,
            usdValue: `$${usdValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            priceChangePercent: change24h,
          });
        }

        const totalUsd = vaultAssets.reduce((sum, a) => {
          return (
            sum + parseFloat(a.usdValue?.toString().replace(/[$,]/g, "") || "0")
          );
        }, 0);

        const totalChange24h = vaultAssets.reduce((sum, a) => {
          if (!a.priceChangePercent) return sum;
          const usdNumeric = parseFloat(
            a.usdValue?.toString().replace(/[$,]/g, "") || "0",
          );
          const previousValue = usdNumeric / (1 + a.priceChangePercent / 100);
          return sum + (usdNumeric - previousValue);
        }, 0);

        const changePercent =
          totalUsd > 0
            ? (totalChange24h / (totalUsd - totalChange24h)) * 100
            : 0;

        setAssets(vaultAssets);
        setTotalBalance(totalUsd);
        setPortfolioChange({ amount: totalChange24h, percent: changePercent });
      })
      .catch((err: any) => {
        console.error("Error fetching split balances:", err);
      })
      .finally(() => {
        setLoading(false);
        fetchingRef.current = false;
      });
  }, [splitId, client]);

  return {
    assets,
    totalBalance,
    portfolioChange,
    loading,
    hasFunds: assets.length > 0,
  };
}
