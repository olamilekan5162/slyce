import { Transaction } from "@mysten/sui/transactions";
import type { TransactionObjectArgument } from "@mysten/sui/transactions";
import type { SplitFormData } from "../types";

const DEFAULT_PACKAGE_ID =
  "0x829200da6102925e460ede524f8cca03c0b76d8009a89222935bc4661bd3abec";
const PROTOCOL_CONFIG_ID =
  "0x0c682f43e79609b653af304163cada3b284c08abec1928361fb9edc5d90ddfa2";

export function getPackageId(): string {
  return import.meta.env.VITE_PACKAGE_ID || DEFAULT_PACKAGE_ID;
}

export function getProtocolConfigId(): string {
  return PROTOCOL_CONFIG_ID;
}

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
      tx.pure.option("string", data.targetCurrency),
    ],
  });

  return tx;
}

export function buildUpdateSplitTx(
  data: SplitFormData,
  passcodeHashes: number[][],
  packageId: string,
  splitId: string,
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
    target: `${packageId}::slyce::update_split`,
    arguments: [
      tx.object(splitId),
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
      tx.pure.option("string", data.targetCurrency),
    ],
  });

  return tx;
}

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

export function buildDistributeVaultTx(
  tx: Transaction,
  coinType: string,
  splitId: string,
  packageId: string,
  protocolConfigId: string,
): void {
  tx.moveCall({
    target: `${packageId}::slyce::distribute_vault`,
    typeArguments: [coinType],
    arguments: [tx.object(protocolConfigId), tx.object(splitId)],
  });
}

export function buildWithdrawTx(
  tx: Transaction,
  coinType: string,
  coin: TransactionObjectArgument,
  destinationAddress: string,
  packageId: string,
): void {
  tx.moveCall({
    target: `${packageId}::slyce::withdraw`,
    typeArguments: [coinType],
    arguments: [coin, tx.pure.address(destinationAddress)],
  });
}
