import { useState, useEffect } from "react";
import type { Asset } from "../types";
import { TOKEN_ICONS } from "../lib/helpers";
import { useCurrentClient } from "@mysten/dapp-kit-react";

export function useTokens(address: string) {
  const client = useCurrentClient()
  const [tokens, setTokens] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;

    let cancelled = false;

    const fetchTokens = async () => {
      setLoading(true);
      try {
        const { balances } = await client.core.listBalances({
          owner: address,
        });

        const userTokens: Asset[] = [];

        for (const balance of balances) {
          const meta = await client.core.getCoinMetadata({
            coinType: balance.coinType,
          });
          const metadata = meta.coinMetadata;

          userTokens.push({
            symbol: metadata?.symbol ?? "",
            name: metadata?.name ?? "",
            decimals: metadata?.decimals ?? 0,
            iconUrl:
              metadata?.iconUrl || TOKEN_ICONS[metadata?.symbol ?? ""] || "",
            balance: Number(balance.balance),
          });
        }

        if (!cancelled) setTokens(userTokens);
      } catch (err) {
        console.error("Error fetching tokens:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTokens();
    return () => {
      cancelled = true;
    };
  }, [address, client]);

  return { tokens, loading, hasTokens: tokens.length > 0 };
}
