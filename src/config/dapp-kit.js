import {
  createDAppKit,
  useCurrentClient,
  useDAppKit,
} from "@mysten/dapp-kit-react";
import { isEnokiNetwork, registerEnokiWallets } from "@mysten/enoki";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { useEffect } from "react";

const GRPC_URLS = {
  testnet: "https://fullnode.testnet.sui.io:443",
};

export const dAppKit = createDAppKit({
  networks: ["testnet"],
  createClient: (network) =>
    new SuiGrpcClient({ network, baseUrl: GRPC_URLS[network] }),
  autoConnect: true,
});

export const RegisterEnokiWallets = () => {
  const client = useCurrentClient();
  const network = client.network;
  useEffect(() => {
    if (!isEnokiNetwork(network)) return;
    const { unregister } = registerEnokiWallets({
      apiKey: import.meta.env.VITE_ENOKI_API_KEY,
      providers: {
        google: {
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          redirectUrl: window.location.origin,
        },
      },
      client,
      network,
    });
    return unregister;
  }, [client, network]);
  return null;
};

// Register types for hook type inference
// declare module '@mysten/dapp-kit-react' {
// 	interface Register {
// 		dAppKit: typeof dAppKit;
// 	}
// }
