import { useState } from "react";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";

export function useWithdraw() {
  const currentAccount = useCurrentAccount();
  const dAppKit = useDAppKit();
  const [pending, setPending] = useState(false);

  const withdraw = async (
    withdrawals: { coinType: string; amount: string }[],
    destinationAddress: string,
  ): Promise<string> => {
    if (!currentAccount) throw new Error("Wallet not connected");
    setPending(true);

    try {
      const tx = new Transaction();

      for (const w of withdrawals) {
        tx.moveCall({
          target: "0x2::balance::send_funds",
          typeArguments: [w.coinType],
          arguments: [
            tx.balance({ type: w.coinType, balance: BigInt(w.amount) }),
            tx.pure.address(destinationAddress),
          ],
        });
      }

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      if (result.$kind === "FailedTransaction") {
        throw new Error("Transaction failed");
      }

      return result.Transaction.digest;
    } finally {
      setPending(false);
    }
  };

  return {
    withdraw,
    pending,
    isConnected: !!currentAccount,
    address: currentAccount?.address ?? null,
  };
}
