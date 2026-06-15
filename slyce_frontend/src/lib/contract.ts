import { Transaction } from "@mysten/sui/transactions";
import type { SplitFormData } from "../types";

const DEFAULT_PACKAGE_ID =
  "0xdeafaf18285bc7ab6182c3995c4a4029dbcede21598f693778ee8f97853cc0b9";
const PROTOCOL_CONFIG_ID =
  "0x46340c61325241d3b4f49813c25d4b0515fa6c3c29c645f73f755936b799e6c0";

export function getPackageId(): string {
  return import.meta.env.VITE_PACKAGE_ID || DEFAULT_PACKAGE_ID;
}

export function getProtocolConfigId(): string {
  return PROTOCOL_CONFIG_ID;
}

/**
 * Build a PTB for creating a new split.
 * Calls `slyce::slyce::create_split`.
 */
/**
 * Build a PTB for creating a new split with passcode hashes.
 * @param data - split form data (name, recipients with contact/address/share)
 * @param passcodeHashes - pre-hashed passcodes for each recipient (empty for address/self)
 * @param packageId - deployed package ID
 */
export function buildCreateSplitTx(
  data: SplitFormData,
  passcodeHashes: number[][],
  packageId: string,
): Transaction {
  const tx = new Transaction();

  const distributionType =
    (
      {
        Manual: 0,
        Threshold: 1,
        Scheduled: 2,
        Incoming: 3,
      } as const
    )[data.distributionType] ?? 0;

  const shares = data.recipients.map((r) => BigInt(Math.round(r.share * 100)));

  tx.moveCall({
    target: `${packageId}::slyce::create_split`,
    arguments: [
      tx.pure.string(data.name),
      tx.pure.vector(
        "string",
        data.recipients.map((r) => r.contact),
      ),
      tx.pure.vector(
        "address",
        data.recipients.map((r) => r.address || "0x0"),
      ),
      tx.pure.vector("u64", shares),
      tx.pure.vector("vector<u8>", passcodeHashes),
      tx.pure.u8(distributionType),
      tx.pure.u64(data.threshold),
      tx.pure.u64(data.interval),
      tx.pure.option("string", null),
    ],
  });

  return tx;
}

/**
 * Build a PTB for confirming a split.
 * Calls `slyce::slyce::confirm_split`.
 */
export function buildConfirmSplitTx(
  splitId: string,
  recipientIndex: number,
  passcode: number[],
  packageId: string,
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::slyce::confirm_split`,
    arguments: [
      tx.object(splitId),
      tx.pure.u64(recipientIndex),
      tx.pure.vector("u8", passcode),
    ],
  });

  return tx;
}

/**
 * Build a PTB for distributing a payment to a locked split.
 * Calls `slyce::slyce::split_payment`.
 */
export function buildDistributeTx(
  splitId: string,
  coinType: string,
  coinId: string,
  packageId: string,
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::slyce::split_payment`,
    typeArguments: [coinType],
    arguments: [
      tx.object(getProtocolConfigId()),
      tx.object(splitId),
      tx.object(coinId),
    ],
  });

  return tx;
}

/**
 * Build a PTB for depositing to a split's vault.
 * Calls `slyce::slyce::deposit_to_vault`.
 */
export function buildDepositToVaultTx(
  splitId: string,
  coinType: string,
  coinId: string,
  packageId: string,
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::slyce::deposit_to_vault`,
    typeArguments: [coinType],
    arguments: [tx.object(splitId), tx.object(coinId)],
  });

  return tx;
}

/**
 * Build a PTB for distributing from a split's vault.
 * Calls `slyce::slyce::distribute_vault`.
 */
export function buildDistributeVaultTx(
  splitId: string,
  coinType: string,
  packageId: string,
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::slyce::distribute_vault`,
    typeArguments: [coinType],
    arguments: [tx.object(getProtocolConfigId()), tx.object(splitId)],
  });

  return tx;
}
