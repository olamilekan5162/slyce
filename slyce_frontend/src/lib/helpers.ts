import type { ClientWithCoreApi } from "@mysten/dapp-kit-react";
import type { SuiGrpcClient } from "@mysten/sui/grpc";
import type { Asset } from "../types";
import { graphqlClient } from "./suiClient";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const TOKEN_ICONS: Record<string, string> = {
  SUI: "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
  ETH_FAUCET: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
  USDT_FAUCET: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
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
      `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(
        coinType,
      )}`,
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
  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: decimals,
  })} ${symbol}`;
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
        coinType: balance.coinType,
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

export const fetchUserActivity = async (
  address: string,
  limit: number = 10,
) => {
  console.log(
    "Fetching user activity for address:",
    address,
    "with limit:",
    limit,
  );
  if (!address) return [];

  try {
    const result = await graphqlClient.query({
      query: `
        query QueryTransactions($sender: SuiAddress, $first: Int) {
          transactions(
            first: $first
            filter: { sentAddress: $sender }
          ) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              digest
              sender {
                address
              }
              effects {
                status
                timestamp
                balanceChanges {
                  nodes {
                    owner {
                      address
                    }
                    amount
                    coinType {
                      repr
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        sender: address,
        first: limit,
      },
    });

    console.log("GraphQL transaction query result:", result);

    // @ts-expect-error: 'data' is unknown but we know it contains 'nodes' at runtime
    const nodes = result?.data?.transactions?.nodes ?? [];

    return nodes.map((tx: any) => {
      const effects = tx.effects;
      const balanceChanges = effects?.balanceChanges?.nodes ?? [];

      let amount = "0 SUI";
      let type = "split"; // default = sent

      // Find the balance change that belongs to this user
      const userChange = balanceChanges.find(
        (bc: any) => bc.owner?.address === address,
      );

      if (userChange) {
        const diff = Number(userChange.amount);
        const isReceive = diff > 0;
        type = isReceive ? "receive" : "split";

        const coinRepr: string = userChange.coinType?.repr ?? "";
        const isSui =
          coinRepr === "0x2::sui::SUI" || coinRepr.endsWith("::sui::SUI");
        const symbol = isSui ? "SUI" : "Token";
        const decimals = isSui ? 9 : 6;

        const formatted = (
          Math.abs(diff) / Math.pow(10, decimals)
        ).toLocaleString("en-US", { maximumFractionDigits: 4 });

        amount = `${isReceive ? "+" : "-"}${formatted} ${symbol}`;
      }

      const rawTimestamp = effects?.timestamp;
      const timestamp = rawTimestamp ? new Date(rawTimestamp) : new Date();
      const dateStr = timestamp.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      const isSuccess = effects?.status === "SUCCESS";

      return {
        id: tx.digest,
        type,
        title: type === "receive" ? "Received Tokens" : "Sent / Split",
        amount,
        date: dateStr,
        time: dateStr,
        status: isSuccess ? "Completed" : "Failed",
      };
    });
  } catch (err) {
    console.error("Error fetching activity:", err);
    return [];
  }
};

export const getDistType = (type: number) => {
  switch (type) {
    case 0:
      return "Manual";
    case 1:
      return "Threshold";
    case 2:
      return "Scheduled";
    case 3:
      return "Automated";
    default:
      return "Unknown";
  }
};

// export const fetchUserActivity = async (
//   address: string,
//   limit: number = 10
// ) => {
//   console.log(
//     "Fetching user activity for address:",
//     address,
//     "with limit:",
//     limit
//   );
//   if (!address) return [];

//   try {
//     const result = await graphqlClient.query({
//       query: `
//     query QueryTransactions($sender: SuiAddress, $first: Int, $after: String) {
//       transactions(
//         first: $first
//         after: $after
//         filter: { sentAddress: $sender }
//       ) {
//         pageInfo {
//           hasNextPage
//           endCursor
//         }
//         nodes {
//           digest
//           effects {
//             status
//             epoch { epochId }
//           }
//         }
//       }
//     }
//   `,
//       variables: {
//         sender: address,
//         first: 10,
//       },
//     });

//     console.log("GraphQL transaction query result:", result);

//     // const { data } = await client.core.queryTransactionBlocks({
//     //   filter: { FromAddress: address },
//     //   options: { showBalanceChanges: true, showEffects: true },
//     //   limit,
//     //   descendingOrder: true,
//     // });

//     // return data.map((tx: any) => {
//     //   let amount = "0 SUI";
//     //   let type = "split"; // Default to split (send)

//     //   // Find balance change for the user
//     //   if (tx.balanceChanges) {
//     //     const userChange = tx.balanceChanges.find(
//     //       (bc: any) =>
//     //         bc.owner?.AddressOwner === address ||
//     //         bc.owner === address ||
//     //         bc.owner?.ObjectOwner === address
//     //     );

//     //     if (userChange) {
//     //       const diff = Number(userChange.amount);
//     //       const isReceive = diff > 0;
//     //       type = isReceive ? "receive" : "split";

//     //       // Format amount (assuming SUI for simplicity, can be expanded if needed)
//     //       // You could also fetch coin metadata here if you want perfect symbols, but for speed we infer.
//     //       const isSui = userChange.coinType === "0x2::sui::SUI";
//     //       const symbol = isSui ? "SUI" : "Token";
//     //       const decimals = isSui ? 9 : 6; // Rough fallback

//     //       const formatted = (
//     //         Math.abs(diff) / Math.pow(10, decimals)
//     //       ).toLocaleString("en-US", { maximumFractionDigits: 4 });
//     //       amount = `${isReceive ? "+" : "-"}${formatted} ${symbol}`;
//     //     }
//     //   }

//     //   const timestamp = tx.timestampMs
//     //     ? new Date(Number(tx.timestampMs))
//     //     : new Date();
//     //   const dateStr = timestamp.toLocaleDateString("en-US", {
//     //     month: "short",
//     //     day: "numeric",
//     //     hour: "numeric",
//     //     minute: "2-digit",
//     //   });

//     //   return {
//     //     id: tx.digest,
//     //     type,
//     //     title: type === "receive" ? "Received Tokens" : "Sent / Split",
//     //     amount,
//     //     date: dateStr,
//     //     time: dateStr, // For dashboard recent activity format
//     //     status:
//     //       tx.effects?.status?.status === "success" ? "Completed" : "Failed",
//     //   };
//     // });
//   } catch (err) {
//     console.error("Error fetching activity:", err);
//     return [];
//   }
// };
