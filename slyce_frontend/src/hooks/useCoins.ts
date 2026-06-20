import { useState, useEffect } from "react";
import { useCurrentClient } from "@mysten/dapp-kit-react";

export interface CoinObject {
  coinType: string;
  coinObjectId: string;
  balance: string;
  symbol: string;
  decimals: number;
}

export function useCoins(address: string) {
  const client = useCurrentClient();
  const [coins, setCoins] = useState<CoinObject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;

    let cancelled = false;

    const fetchCoins = async () => {
      setLoading(true);
      try {
        const { balances } = await client.core.listBalances({
          owner: address,
        });

        const allCoins: CoinObject[] = [];

        for (const balance of balances) {
          if (Number(balance.balance) === 0) continue;

          const meta = await client.core.getCoinMetadata({
            coinType: balance.coinType,
          });
          const metadata = meta.coinMetadata;

          const coinObjects = await client.core.listCoins({
            owner: address,
            coinType: balance.coinType,
          });

          for (const coin of coinObjects.objects) {
            if (Number(coin.balance) === 0) continue;

            allCoins.push({
              coinType: balance.coinType,
              coinObjectId: coin.objectId,
              balance: coin.balance,
              symbol: metadata?.symbol ?? "",
              decimals: metadata?.decimals ?? 0,
            });
          }
        }

        if (!cancelled) setCoins(allCoins);
      } catch (err) {
        console.error("Error fetching coins:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCoins();
    return () => {
      cancelled = true;
    };
  }, [address, client]);

  return { coins, loading, hasCoins: coins.length > 0 };
}
