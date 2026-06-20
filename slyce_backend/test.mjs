import { SuiGrpcClient } from "@mysten/sui/grpc";
const client = new SuiGrpcClient({ network: "testnet", baseUrl: "https://fullnode.testnet.sui.io:443" });
console.log(client.listCoins);
