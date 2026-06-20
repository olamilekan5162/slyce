/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";
import { graphqlClient } from "../lib/suiClient";
import {
  buildConfirmSplitTx,
  buildDistributeVaultTx,
  buildUpdateSplitTx,
  getPackageId,
  getProtocolConfigId,
} from "../lib/contract";
import { buildCreateSplitTx } from "../lib/contract";
import { hashPasscode } from "../lib/helpers";
import type { RecipientType, SplitFormData } from "../types";

export interface CreateSplitInput {
  name: string;
  recipients: {
    identifier: string; // email, address, or name
    type: RecipientType;
    share: number; // percentage (e.g. 50 = 50%)
    passcodeHash?: string;
  }[];
  distributionType: "Manual" | "Threshold" | "Scheduled" | "Incoming";
  threshold: number;
  interval?: number;
  currency: string;
}

export interface CreatedSplitResult {
  digest: string;
  splitId: string;
  passcodes: string[];
}

export function useSplits() {
  const currentAccount = useCurrentAccount();
  const dAppKit = useDAppKit();
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const createSplit = async (
    input: CreateSplitInput,
  ): Promise<CreatedSplitResult> => {
    if (!currentAccount) throw new Error("Wallet not connected");
    setCreating(true);

    try {
      const packageId = getPackageId();
      if (!packageId) throw new Error("Contract not deployed");

      const passcodes = input.recipients.map((_, i) =>
        i === 0 ? "" : Math.random().toString(36).substring(2, 8).toUpperCase(),
      );

      const hashedPasscodes = await Promise.all(
        passcodes.map((p) => hashPasscode(p)),
      );

      const splitData: SplitFormData = {
        name: input.name,
        recipients: input.recipients.map((r) => ({
          contact: r.identifier,
          address: r.type === "address" ? r.identifier : "0x0",
          share: r.share,
        })),
        distributionType: input.distributionType,
        threshold: input.threshold,
        interval: input.interval ?? 0,
        targetCurrency: input.currency,
      };

      const tx = buildCreateSplitTx(splitData, hashedPasscodes, packageId);

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      if (result.$kind === "FailedTransaction") {
        throw new Error("Transaction failed");
      }

      // Extract created split ID from effects
      const changedObjects = result.Transaction.effects?.changedObjects || [];
      const splitObject = changedObjects.find(
        (obj: any) =>
          obj.idOperation === "Created" && obj.outputOwner?.$kind === "Shared",
      );
      if (!splitObject) throw new Error("Split object not found");

      return {
        digest: result.Transaction.digest,
        splitId: splitObject.objectId,
        passcodes,
      };
    } finally {
      setCreating(false);
    }
  };

  const updateSplit = async (
    input: CreateSplitInput,
    splitId: string,
  ): Promise<CreatedSplitResult> => {
    if (!currentAccount) throw new Error("Wallet not connected");
    setUpdating(true);

    try {
      const packageId = getPackageId();
      if (!packageId) throw new Error("Contract not deployed");

      const passcodes = input.recipients.map((r, i) =>
        r.passcodeHash
          ? ""
          : i === 0
            ? ""
            : Math.random().toString(36).substring(2, 8).toUpperCase(),
      );

      const hashedPasscodes = await Promise.all(
        input.recipients.map(async (r, i) => {
          if (r.passcodeHash) {
            const binaryString = atob(r.passcodeHash);
            return Array.from(binaryString).map((char) => char.charCodeAt(0));
          }
          return hashPasscode(passcodes[i]);
        }),
      );

      const splitData: SplitFormData = {
        name: input.name,
        recipients: input.recipients.map((r) => ({
          contact: r.identifier,
          address: r.type === "address" ? r.identifier : "0x0",
          share: r.share,
        })),
        distributionType: input.distributionType,
        threshold: input.threshold,
        interval: input.interval ?? 0,
        targetCurrency: input.currency,
      };

      const tx = buildUpdateSplitTx(
        splitData,
        hashedPasscodes,
        packageId,
        splitId,
      );

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      if (result.$kind === "FailedTransaction") {
        throw new Error("Transaction failed");
      }

      return {
        digest: result.Transaction.digest,
        splitId,
        passcodes,
      };
    } finally {
      setUpdating(false);
    }
  };

  const confirmSplit = async (
    splitId: string,
    recipientIndex: number,
    passcode: number[],
  ): Promise<string> => {
    if (!currentAccount) throw new Error("Wallet not connected");
    const packageId = getPackageId();
    if (!packageId) throw new Error("Contract not deployed");

    const tx = buildConfirmSplitTx(
      splitId,
      recipientIndex,
      passcode,
      packageId,
    );

    const result = await dAppKit.signAndExecuteTransaction({
      transaction: tx,
    });
    if (result.$kind === "FailedTransaction")
      throw new Error("Transaction failed");
    return result.Transaction.digest;
  };

  const distributeVault = async (splitId: string): Promise<string> => {
    if (!currentAccount) throw new Error("Wallet not connected");
    const packageId = getPackageId();
    const protocolConfigId = getProtocolConfigId();
    if (!packageId) throw new Error("Contract not deployed");

    // Query FundsDepositedEvent to find what coin types are in the vault
    const result = await graphqlClient.query({
      query: `
        query GetSplitDeposits($type: String) {
          events(filter: { type: $type }, first: 50) {
            nodes {
              contents { json }
            }
          }
        }
      `,
      variables: {
        type: `${packageId}::slyce::FundsDepositedEvent`,
      },
    });

    const nodes = (result.data as any)?.events?.nodes ?? [];

    // Collect unique coin types deposited to this split
    const coinTypes = new Set<string>();
    for (const node of nodes) {
      const json = node.contents?.json;
      if (json?.split_id === splitId && json?.coin_type) {
        coinTypes.add(json.coin_type as string);
      }
    }

    if (coinTypes.size === 0) {
      throw new Error("No funds found in this split to distribute");
    }

    const tx = new Transaction();

    for (const coinType of coinTypes) {
      buildDistributeVaultTx(
        tx,
        coinType,
        splitId,
        packageId,
        protocolConfigId,
      );
    }

    const result2 = await dAppKit.signAndExecuteTransaction({
      transaction: tx,
    });
    if (result2.$kind === "FailedTransaction")
      throw new Error("Transaction failed");
    return result2.Transaction.digest;
  };

  return {
    distributeVault,
    createSplit,
    confirmSplit,
    updateSplit,
    updating,
    creating,
    isConnected: !!currentAccount,
    address: currentAccount?.address ?? null,
  };
}
