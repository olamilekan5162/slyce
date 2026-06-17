/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCurrentClient } from "@mysten/dapp-kit-react";
import { useCallback, useEffect, useState } from "react";
import type { Split } from "../types";

export const useFetchSplitById = (splitId: string) => {
  const [split, setSplit] = useState<Split | null>(null);
  const [loading, setLoading] = useState(false);
  const client = useCurrentClient();

  const fetchSplit = useCallback(async () => {
    if (!splitId) return;
    try {
      const { object } = await client.core.getObject({
        objectId: splitId,
        include: { content: true, json: true },
      });

      const splitData = object.json as any;

      const data = {
        id: splitData?.id ?? "",
        name: splitData?.name ?? "-",
        creator: splitData?.creator ?? "",
        recipients: splitData?.recipients ?? [],
        isLocked: splitData?.is_locked ?? false,
        isCancelled: splitData?.is_cancelled ?? false,
        distributionType: splitData?.distribution_type ?? "",
        confirmedCount: splitData?.confirmed_count ?? 0,
        threshold: splitData?.threshold ?? 0,
        interval: splitData?.interval ?? 0,
        targetCurrency: splitData?.target_currency ?? "",
      };
      setSplit(data);
    } catch (err) {
      console.error("Error fetching split:", err);
    } finally {
      setLoading(false);
    }
  }, [splitId, client]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchSplit();
    };
    fetchData();
  }, [fetchSplit]);

  return { split, loading };
};

//   const fields = Split.parse(object?.content);
//   if (!fields) throw new Error("Not a Split object");

//   const totalBps = fields.recipients.reduce(
//     (s, r) => s + Number(r.share),
//     0,
//   );

//   const uiRecipients: UiRecipient[] = fields.recipients.map((r, i) => {
//     const rawContact = decodeBytes(r.contact);
//     const isAddress = /^0x[0-9a-fA-F]{10,}$/.test(rawContact);
//     let name = isAddress
//       ? `${rawContact.slice(0, 6)}...${rawContact.slice(-4)}`
//       : rawContact;
//     if (!name) name = `Recipient ${i + 1}`;

//     // Add "(You)" if it matches current user
//     if (r.confirmed_address === currentAccount?.address) {
//       name += " (You)";
//     }

//     const pct =
//       totalBps > 0
//         ? Number(((Number(r.share) / totalBps) * 100).toFixed(0))
//         : 0;

//     return {
//       name,
//       share: pct,
//       status: r.confirmed ? "Confirmed" : "Pending",
//     };
//   });

//   let status = "Pending";
//   if (fields.is_cancelled) status = "Cancelled";
//   else if (fields.is_locked) status = "Locked";

//   const balancesResult = await client.core.listBalances({ owner: splitId });
//   const vaultAssets: { symbol: string; amount: string }[] = [];
//   let totalUsd = 0;

//   for (const balance of balancesResult.balances) {
//     const metadata = await getCoinsMetadata(balance as any, client as any);
//     const formattedBalance =
//       Number(balance.balance) / Math.pow(10, metadata.decimals || 0);

//     const { price: priceUsd } = await getTokenPrice(balance.coinType);
//     totalUsd += formattedBalance * priceUsd;

//     vaultAssets.push({
//       symbol: metadata.symbol || "UNKNOWN",
//       amount: formattedBalance.toLocaleString("en-US", {
//         maximumFractionDigits: 4,
//       }),
//     });

//   setSplit({
//     id: splitId,
//     name: decodeBytes((fields.name as number[]) ?? []) || "Unnamed Split",
//     address: splitId, // Full ID, we'll truncate in the UI
//     status,
//     totalValueUsd: `$${totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
//     assets:
//       vaultAssets.length > 0
//         ? vaultAssets
//         : [{ symbol: "SUI", amount: "0.00" }],
//     recipients: uiRecipients,
//     isCreator: fields.creator === currentAccount?.address,
//   });
// } catch (err) {
//   console.error(err);
//   toast.error("Failed to load split details");
// } finally {
//   setLoading(false);
