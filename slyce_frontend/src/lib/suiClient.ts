import { createDAppKit } from "@mysten/dapp-kit-core";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { enokiWalletsInitializer } from "@mysten/enoki";

const NETWORKS = ["testnet", "mainnet"];

/**
 * Creates a SuiJsonRpcClient for the given network.
 * If no network is provided, defaults to testnet.
 */
const createClient = (network?: string) => {
  const networkName = (network || "testnet").split(":")[0] as
    | "testnet"
    | "mainnet";
  return new SuiJsonRpcClient({
    url: getJsonRpcFullnodeUrl(networkName),
    network: networkName,
  });
};

/**
 * The Slyce DAppKit instance.
 * Provides wallet connection, transaction signing, and network management.
 */
export const dAppKit = createDAppKit({
  networks: NETWORKS,
  createClient,
  defaultNetwork: "testnet",
  autoConnect: true,
  slushWalletConfig: {
    appName: "Slyce",
  },
  walletInitializers: [
    enokiWalletsInitializer({
      apiKey: import.meta.env.VITE_ENOKI_API_KEY,
      providers: {
        google: {
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          redirectUrl: `${window.location.origin}/auth/callback`,
        },
        facebook: {
          clientId: import.meta.env.VITE_FACEBOOK_CLIENT_ID,
          redirectUrl: `${window.location.origin}/auth/callback`,
        },
      },
    }),
  ],
});

/**
 * Convenience type for the Slyce DAppKit.
 */
export type SlyceDAppKit = typeof dAppKit;
