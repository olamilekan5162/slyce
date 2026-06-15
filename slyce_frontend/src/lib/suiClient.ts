import { createDAppKit } from "@mysten/dapp-kit-core";
import { enokiWalletsInitializer } from "@mysten/enoki";
import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { SuiGrpcClient } from "@mysten/sui/grpc";

const NETWORKS = ["testnet", "mainnet"];
const GRPC_URLS = {
  testnet: "https://fullnode.testnet.sui.io:443",
  mainnet: "https://fullnode.mainnet.sui.io:443",
  devnet: "https://fullnode.devnet.sui.io:443",
};

const createClient = (network?: string) => {
  const networkName = (network || "testnet").split(":")[0] as
    | "testnet"
    | "mainnet";
  return new SuiGrpcClient({
    baseUrl: GRPC_URLS[networkName],
    network: networkName,
  });
};

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

export const graphqlClient = new SuiGraphQLClient({
  url: "https://graphql.testnet.sui.io/graphql",
  network: "testnet",
});
