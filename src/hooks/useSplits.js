import { useCurrentAccount, useCurrentClient } from "@mysten/dapp-kit-react";
import { useNetworkVariable } from "../config/networkConfig";
import { useQuery } from "@tanstack/react-query";

export const useSplits = () => {
  const client = useCurrentClient();
  const account = useCurrentAccount();
  const slycePackageId = useNetworkVariable("slycePackageId");

  const {
    data: splits = [],
    isPending: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["splits", account?.address, slycePackageId],
    enabled: !!account,
    queryFn: async () => {
      const { objects } = await client.core.listOwnedObjects({
        owner: account.address,
        filter: {
          MatchAny: [
            { StructType: `${slycePackageId}::slyce::InitiatorCap` },
            { StructType: `${slycePackageId}::slyce::RecipientCap` },
          ],
        },
        include: {
          content: true,
        },
      });

      const splitIds = new Set();
      const capMap = {};

      objects.forEach((obj) => {
        const fields = obj.data?.content?.fields;
        const type = obj.data?.content?.type;

        if (fields?.split_id) {
          const splitId = fields.split_id;
          splitIds.add(splitId);
          if (!capMap[splitId]) capMap[splitId] = {};

          if (type.includes("InitiatorCap")) {
            capMap[splitId].initiatorCapId = obj.data.objectId;
          } else if (type.includes("RecipientCap")) {
            capMap[splitId].recipientCapId = obj.data.objectId;
          }
        }
      });

      if (splitIds.size === 0) return [];

      const splitsRes = await client.core.multiGetObjects({
        ids: Array.from(splitIds),
        options: { showContent: true },
      });

      return splitsRes
        .map((res) => {
          const fields = res.data?.content?.fields;
          if (!fields) return null;

          return {
            id: res.data.objectId,
            name: fields.name,
            description: fields.description,
            initiator: fields.initiator,
            recipients: (fields.recipients || []).map((r) => ({
              name: r.fields?.name ?? r.name,
              role: r.fields?.role ?? r.role,
              address: r.fields?.addr ?? r.addr,
              share: Number(r.fields?.share_bps ?? r.share_bps) / 100,
              confirmed: r.fields?.confirmed ?? r.confirmed,
            })),
            pendingConfirmations: Number(fields.pending_confirmations),
            distributionRule: Number(fields.distribution_rule),
            thresholdAmount: Number(fields.threshold_amount) / 1e9,
            status: Number(fields.status),
            balance: Number(fields.balance) || 0,
            totalDistributed: Number(fields.total_distributed) / 1e9,
            ...capMap[res.data.objectId],
          };
        })
        .filter(Boolean);
    },
  });

  return { splits, loading, error, refetch };
};
