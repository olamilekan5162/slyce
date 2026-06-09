import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { useNetworkVariable } from "../config/networkConfig";
import { Transaction } from "@mysten/sui/transactions";

export const useCreateSplit = () => {
  const slycePackageId = useNetworkVariable("slycePackageId");
  const slyceRegistryId = useNetworkVariable("slyceRegistryId");
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();

  const createSplit = async ({
    name,
    description,
    recipients,
    distributionRule,
    thresholdAmount,
    feeBps = 150,
    feeRecipient = "0x8fa8b46e07f81481359d62bd5e1f89e10aef8afb87eb514d296a18320ba5ce28",
  }) => {
    if (!account) throw new Error("Wallet not connected");
    if (!feeRecipient) throw new Error("Fee recipient not provided");

    const tx = new Transaction();

    // Process recipients
    const addrs = recipients.map((r) => r.contact);
    const names = recipients.map((r) => r.name);
    const roles = recipients.map((r) => r.role);
    const shares = recipients.map((r) => Math.floor(r.percentage * 100)); // 50% -> 5000 bps

    // Distribution rule mapping
    const rules = {
      manual: 0,
      threshold: 1,
      scheduled: 2,
      incoming: 3,
    };
    const ruleId = rules[distributionRule] ?? 0;

    tx.moveCall({
      target: `${slycePackageId}::slyce::create_split`,
      typeArguments: ["0x2::sui::SUI"],
      arguments: [
        tx.object(slyceRegistryId),
        tx.pure.string(name),
        tx.pure.string(description || ""),
        tx.pure(addrs, "vector<address>"),
        tx.pure(names, "vector<string>"),
        tx.pure(roles, "vector<string>"),
        tx.pure(shares, "vector<u64>"),
        tx.pure.u8(ruleId),
        tx.pure.u64(
          thresholdAmount ? Math.floor(Number(thresholdAmount) * 1e9) : 0,
        ), // Assuming SUI has 9 decimals
        tx.pure.u64(feeBps),
        tx.pure.address(feeRecipient),
      ],
    });

    try {
      const result = await dAppKit.signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("Transaction success:", result);
          },
        },
      );
      return result;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  return { createSplit };
};
