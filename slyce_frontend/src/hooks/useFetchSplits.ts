/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Split } from "../types";
import { graphqlClient } from "../lib/suiClient";
import { getPackageId } from "../lib/contract";
import {
  useCurrentAccount,
  useCurrentClient,
  type ClientWithCoreApi,
} from "@mysten/dapp-kit-react";
import { useCallback, useEffect, useState } from "react";
import { fetchBalanceInDollars } from "../lib/helpers";

async function fetchCreatedSplits(
  address: string,
  client: ClientWithCoreApi,
): Promise<Split[]> {
  const packageId = getPackageId();
  const result = await graphqlClient.query({
    query: `
      query GetCreatedSplits($type: String) {
        events(filter: { type: $type }, first: 50) {
          nodes {
            sender { address }
            contents { json }
          }
        }
      }
    `,
    variables: {
      type: `${packageId}::slyce::SplitCreatedEvent`,
    },
  });

  const nodes = result.data?.events?.nodes ?? [];

  const ids = nodes
    .filter((n: any) => n.sender?.address === address)
    .map((n: any) => n.contents?.json?.split_id)
    .filter(Boolean) as string[];

  if (ids.length === 0) return [];

  const { objects } = await client.core.getObjects({
    objectIds: ids,
    include: { content: true, json: true },
  });

  const rawSplits = objects.map((obj: any) => {
    const splitData = obj.json;
    return {
      id: splitData.id,
      name: splitData.name,
      creator: splitData.creator,
      recipients: splitData.recipients,
      isLocked: splitData.is_locked,
      isCancelled: splitData.is_cancelled,
      distributionType: splitData.distribution_type,
      confirmedCount: splitData.confirmed_count,
      threshold: splitData.threshold,
      interval: splitData.interval,
      totalUsdPromise: fetchBalanceInDollars(client, splitData.id),
    };
  });

  const splits = await Promise.all(
    rawSplits.map(async ({ totalUsdPromise, ...split }) => {
      const result = await totalUsdPromise.catch(() => ({ totalUsd: 0 }));
      return {
        ...split,
        totalUsd: result?.totalUsd ?? 0,
      };
    }),
  );

  return splits;
}

async function fetchJoinedSplits(
  address: string,
  client: ClientWithCoreApi,
): Promise<Split[]> {
  const packageId = getPackageId();
  const result = await graphqlClient.query({
    query: `
      query GetJoinedSplits($type: String) {
        events(filter: { type: $type }, first: 50) {
          nodes {
            sender { address }
            contents { json }
          }
        }
      }
    `,
    variables: {
      type: `${packageId}::slyce::RecipientConfirmedEvent`,
    },
  });

  const nodes = result.data?.events?.nodes ?? [];

  const ids = nodes
    .filter((n: any) => n.sender?.address === address)
    .map((n: any) => n.contents?.json?.split_id)
    .filter(Boolean) as string[];

  if (ids.length === 0) return [];

  const { objects } = await client.core.getObjects({
    objectIds: ids,
    include: { content: true, json: true },
  });

  const rawSplits = objects.map((obj: any) => {
    const splitData = obj.json;
    return {
      id: splitData.id,
      name: splitData.name,
      creator: splitData.creator,
      recipients: splitData.recipients,
      isLocked: splitData.is_locked,
      isCancelled: splitData.is_cancelled,
      distributionType: splitData.distribution_type,
      confirmedCount: splitData.confirmed_count,
      threshold: splitData.threshold,
      interval: splitData.interval,
      totalUsdPromise: fetchBalanceInDollars(client, splitData.id),
    };
  });

  const splits = await Promise.all(
    rawSplits.map(async ({ totalUsdPromise, ...split }) => {
      const result = await totalUsdPromise.catch(() => ({ totalUsd: 0 }));
      return {
        ...split,
        totalUsd: result?.totalUsd ?? 0,
      };
    }),
  );

  return splits;
}

export function useFetchSplits(isUserSplits: boolean) {
  const currentAccount = useCurrentAccount();
  const client = useCurrentClient();

  const [splits, setSplits] = useState<Split[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSplits = useCallback(async () => {
    if (!currentAccount?.address) return;
    const address = currentAccount.address;

    setLoading(true);
    setError(null);

    try {
      let result: Split[];

      if (isUserSplits) {
        result = await fetchCreatedSplits(address, client);
      } else {
        result = await fetchJoinedSplits(address, client);
      }
      setSplits(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load splits.");
    } finally {
      setLoading(false);
    }
  }, [client, currentAccount, isUserSplits]);

  useEffect(() => {
    if (!currentAccount?.address) return;
    const fetchData = async () => {
      await fetchSplits();
    };
    fetchData();
  }, [currentAccount, isUserSplits, fetchSplits]);

  return { splits, loading, error, refetch: fetchSplits };
}
