import type { ClientWithCoreApi } from "@mysten/dapp-kit-react";
import type { SuiGrpcClient } from "@mysten/sui/grpc";
import type { Asset } from "../types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const TOKEN_ICONS: Record<string, string> = {
  SUI: "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
};

export const hashPasscode = async (passcode: string): Promise<number[]> => {
  if (!passcode) return [];
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer));
};

export const decodeBytes = (bytes: number[]): string => {
  try {
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return "";
  }
};

export const getTokenPrice = async (
  coinType: string,
): Promise<{ price: number; change24h: number | null }> => {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(coinType)}`,
    );
    const { pairs } = await res.json();

    const suiPairs = (pairs ?? [])
      .filter((p: any) => p.chainId === "sui")
      .sort(
        (a: any, b: any) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0),
      );

    const best = suiPairs[0];
    return {
      price: parseFloat(best?.priceUsd ?? "0"),
      change24h: best?.priceChange?.h24 ?? null,
    };
  } catch {
    return { price: 0, change24h: null };
  }
};

export const getCoinsMetadata = async (
  coinType: string,
  client: SuiGrpcClient,
): Promise<{
  symbol: string;
  name: string;
  decimals: number;
  iconUrl: string;
}> => {
  try {
    const data = await client.getCoinMetadata({ coinType });
    return {
      symbol: data.coinMetadata?.symbol || "",
      name: data.coinMetadata?.name || "",
      decimals: data.coinMetadata?.decimals || 0,
      iconUrl: data.coinMetadata?.iconUrl || "",
    };
  } catch {
    return { symbol: "", name: "", decimals: 0, iconUrl: "" };
  }
};

export const SUI_COIN_TYPE = "0x2::sui::SUI";

export const DISTRIBUTION_TYPE_MAP: Record<string, number> = {
  Manual: 0,
  Threshold: 1,
  Scheduled: 2,
  Incoming: 3,
};

export const DISTRIBUTION_TYPE_LABEL: Record<number, string> = {
  0: "Manual",
  1: "Threshold",
  2: "Scheduled",
  3: "Incoming",
};

export const formatBalance = (
  balance: string | number,
  decimals: number,
  symbol: string,
): string => {
  const value = Number(balance) / Math.pow(10, decimals);
  return `${value.toLocaleString("en-US", { maximumFractionDigits: decimals })} ${symbol}`;
};

export const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatShare = (bps: number): string => {
  return `${(bps / 100).toFixed(1)}%`;
};

export const fetchBalanceInDollars = async (
  client: ClientWithCoreApi,
  address: string,
) => {
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
      const formattedBalance = Number(balance.balance) / Math.pow(10, decimals);

      const { price: priceUsd, change24h } = await getTokenPrice(
        balance.coinType,
      );
      const usdValue = formattedBalance * priceUsd;

      userAssets.push({
        symbol: metadata?.symbol ?? "",
        name: metadata?.name ?? "",
        decimals,
        iconUrl: metadata?.iconUrl ?? "",
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

    const totalUsd = userAssets.reduce((sum, a) => {
      const numeric = parseFloat(a.usdValue?.replace(/[$,]/g, "") || "0") || 0;
      return sum + numeric;
    }, 0);

    return { totalUsd };
  } catch (err) {
    console.error("Error fetching balances:", err);
  }
};
