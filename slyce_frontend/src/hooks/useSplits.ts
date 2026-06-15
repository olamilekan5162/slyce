/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { getPackageId } from "../lib/contract";
import { buildCreateSplitTx } from "../lib/contract";
import { hashPasscode } from "../lib/helpers";
import type { RecipientType, SplitFormData } from "../types";

export interface CreateSplitInput {
  name: string;
  recipients: {
    identifier: string; // email, address, or name
    type: RecipientType;
    share: number; // percentage (e.g. 50 = 50%)
  }[];
  distributionType: "Manual" | "Threshold" | "Scheduled" | "Incoming";
  threshold: number;
  interval?: number;
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
          share: r.share, // convert % to decimal (e.g. 50 -> 0.5)
        })),
        distributionType: input.distributionType,
        threshold: input.threshold,
        interval: input.interval ?? 0,
      };

      const tx = buildCreateSplitTx(splitData, hashedPasscodes, packageId);
      // tx.setSender(currentAccount.address);

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

  const confirmSplit = useCallback(
    async (
      splitId: string,
      recipientIndex: number,
      passcode: number[],
    ): Promise<string> => {
      if (!currentAccount) throw new Error("Wallet not connected");
      const packageId = getPackageId();
      if (!packageId) throw new Error("Contract not deployed");

      const { buildConfirmSplitTx } = await import("../lib/contract");
      const tx = buildConfirmSplitTx(
        splitId,
        recipientIndex,
        passcode,
        packageId,
      );
      tx.setSender(currentAccount.address);

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });
      if (result.$kind === "FailedTransaction")
        throw new Error("Transaction failed");
      return result.Transaction.digest;
    },
    [currentAccount, dAppKit],
  );

  const cancelSplit = useCallback(
    async (splitId: string): Promise<string> => {
      if (!currentAccount) throw new Error("Wallet not connected");
      const packageId = getPackageId();
      if (!packageId) throw new Error("Contract not deployed");

      const { Transaction } = await import("@mysten/sui/transactions");
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::slyce::cancel_split`,
        arguments: [tx.object(splitId)],
      });
      tx.setSender(currentAccount.address);

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });
      if (result.$kind === "FailedTransaction")
        throw new Error("Transaction failed");
      return result.Transaction.digest;
    },
    [currentAccount, dAppKit],
  );

  const depositToVault = useCallback(
    async (
      splitId: string,
      coinType: string,
      coinId: string,
    ): Promise<string> => {
      if (!currentAccount) throw new Error("Wallet not connected");
      const packageId = getPackageId();
      if (!packageId) throw new Error("Contract not deployed");

      const { buildDepositToVaultTx } = await import("../lib/contract");
      const tx = buildDepositToVaultTx(splitId, coinType, coinId, packageId);
      tx.setSender(currentAccount.address);

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });
      if (result.$kind === "FailedTransaction")
        throw new Error("Transaction failed");
      return result.Transaction.digest;
    },
    [currentAccount, dAppKit],
  );

  return {
    createSplit,
    confirmSplit,
    cancelSplit,
    depositToVault,
    creating,
    isConnected: !!currentAccount,
    address: currentAccount?.address ?? null,
  };
}
