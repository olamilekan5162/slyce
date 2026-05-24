import { useCurrentNetwork } from "@mysten/dapp-kit-react";
import {
  TESTNET_SLYCE_PACKAGE_ID,
  TESTNET_SLYCE_REGISTRY_ID,
} from "./constants";

const networkVariables = {
  testnet: {
    slycePackageId: TESTNET_SLYCE_PACKAGE_ID,
    slyceRegistryId: TESTNET_SLYCE_REGISTRY_ID,
  },
};

export function useNetworkVariable(key) {
  const network = useCurrentNetwork();
  return networkVariables[network][key];
}
