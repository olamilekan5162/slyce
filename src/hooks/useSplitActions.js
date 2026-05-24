import { useSignAndExecuteTransaction } from "@mysten/dapp-kit-react";
import { useNetworkVariable } from "../config/networkConfig";
import { Transaction } from "@mysten/sui/transactions";

export const useSplitActions = () => {
  const slycePackageId = useNetworkVariable("slycePackageId");
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const distribute = async (splitId, initiatorCapId) => {
    if (!splitId || !initiatorCapId) throw new Error("Missing parameters");

    const tx = new Transaction();
    
    tx.moveCall({
      target: `${slycePackageId}::slyce::distribute`,
      typeArguments: ['0x2::sui::SUI'],
      arguments: [
        tx.object(splitId),
        tx.object(initiatorCapId)
      ],
    });

    return await signAndExecuteTransaction({
      transaction: tx,
      options: { showEvents: true, showEffects: true }
    });
  };

  const confirmShare = async (splitId, recipientCapId) => {
    if (!splitId || !recipientCapId) throw new Error("Missing parameters");

    const tx = new Transaction();

    tx.moveCall({
      target: `${slycePackageId}::slyce::confirm_share`,
      typeArguments: ['0x2::sui::SUI'],
      arguments: [
        tx.object(splitId),
        tx.object(recipientCapId)
      ],
    });

    return await signAndExecuteTransaction({
      transaction: tx,
      options: { showEvents: true, showEffects: true }
    });
  };

  return { distribute, confirmShare };
};
