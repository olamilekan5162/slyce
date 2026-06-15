import { useState, useEffect } from "react";
import { useCurrentClient } from "@mysten/dapp-kit-react";
import { getTokenPrice, TOKEN_ICONS } from "../lib/helpers";
import type { Asset } from "../types";

export function useBalances(address?: string) {
  const client = useCurrentClient();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState<{
    amount: number;
    percent: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    const fetchBalances = async () => {
      setLoading(true);
      try {
        const { balances } = await client.core.listBalances({
          owner: address,
        });

        const userAssets: Asset[] = [];

        for (const balance of balances) {
          const meta = await client.core.getCoinMetadata({
            coinType: balance.coinType,
          });
          const metadata = meta.coinMetadata;
          const decimals = metadata?.decimals ?? 0;
          const formattedBalance =
            Number(balance.balance) / Math.pow(10, decimals);

          const { price: priceUsd, change24h } = await getTokenPrice(
            balance.coinType,
          );
          const usdValue = formattedBalance * priceUsd;

          userAssets.push({
            symbol: metadata?.symbol ?? "",
            name: metadata?.name ?? "",
            decimals,
            iconUrl:
              metadata?.iconUrl || TOKEN_ICONS[metadata?.symbol ?? ""] || "",
            balance: formattedBalance,
            usdValue:
              usdValue > 0
                ? `$${usdValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "$0.00",
            priceChangePercent: change24h,
          });
        }

        if (cancelled) return;

        const totalUsd = userAssets.reduce((sum, a) => {
          const numeric =
            parseFloat(a.usdValue?.replace(/[$,]/g, "") || "0") || 0;
          return sum + numeric;
        }, 0);

        const totalChange24h = userAssets.reduce((sum, a) => {
          if (a.priceChangePercent === null) return sum;
          const usdNumeric =
            parseFloat(a.usdValue?.replace(/[$,]/g, "") || "0") || 0;
          const previousValue =
            usdNumeric / (1 + (a.priceChangePercent || 0) / 100);
          return sum + (usdNumeric - previousValue);
        }, 0);

        const changePercent =
          totalUsd > 0
            ? (totalChange24h / (totalUsd - totalChange24h)) * 100
            : 0;

        setAssets(userAssets);
        setTotalBalance(totalUsd);
        setPortfolioChange({
          amount: totalChange24h,
          percent: changePercent,
        });
      } catch (err) {
        console.error("Error fetching balances:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBalances();
    return () => {
      cancelled = true;
    };
  }, [address, client]);

  return {
    assets,
    totalBalance,
    portfolioChange,
    loading,
    isConnected: !!address,
  };
}
