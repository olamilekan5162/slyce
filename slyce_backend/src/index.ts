import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import dotenv from "dotenv";
import { loadTrackedSplits, addTrackedSplit } from "./store.js";
import { startEmailServer } from "./server.js";

dotenv.config();

const PACKAGE_ID = process.env.PACKAGE_ID!;
const PROTOCOL_CONFIG_ID = process.env.PROTOCOL_CONFIG_ID!;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY!;
const NETWORK =
  (process.env.NETWORK as "mainnet" | "testnet" | "devnet") || "testnet";

if (!PACKAGE_ID || !PROTOCOL_CONFIG_ID || !ADMIN_SECRET_KEY) {
  console.error(
    "Missing required environment variables. Check your .env file.",
  );
  process.exit(1);
}

// 1. Initialize GraphQL Client (for querying events)
const graphqlClient = new SuiGraphQLClient({
  url: `https://graphql.${NETWORK}.sui.io/graphql`,
  network: NETWORK as "mainnet" | "testnet",
});

// 2. Initialize GRPC Client (for fetching coins and executing transactions)
const grpcClient = new SuiGrpcClient({
  baseUrl: `https://fullnode.${NETWORK}.sui.io:443`,
  network: NETWORK as "mainnet" | "testnet",
});

let keypair: Ed25519Keypair;
try {
  const { secretKey } = decodeSuiPrivateKey(ADMIN_SECRET_KEY);
  keypair = Ed25519Keypair.fromSecretKey(secretKey);
  console.log(`[Init] Admin wallet loaded: ${keypair.toSuiAddress()}`);
} catch (e) {
  console.error(
    "Failed to parse ADMIN_SECRET_KEY. Make sure it starts with 'suiprivkey...'",
    e,
  );
  process.exit(1);
}

// Keep track of the last event cursor to only fetch new events
let lastEventCursor: string | null = null;

async function syncNewSplits() {
  try {
    const result = await graphqlClient.query({
      query: `
        query GetCreatedSplits($type: String, $after: String) {
          events(filter: { type: $type }, first: 50, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              contents { json }
            }
          }
        }
      `,
      variables: {
        type: `${PACKAGE_ID}::slyce::SplitCreatedEvent`,
        after: lastEventCursor,
      },
    });
    console.log("Result", result);

    const eventsData = (result.data as any)?.events;
    if (!eventsData) return;

    for (const node of eventsData.nodes) {
      const splitId = node.contents?.json?.split_id;
      if (splitId) {
        addTrackedSplit(splitId);
      }
    }

    if (eventsData.pageInfo?.hasNextPage && eventsData.pageInfo?.endCursor) {
      lastEventCursor = eventsData.pageInfo.endCursor;
      await syncNewSplits(); // fetch remaining
    } else {
      lastEventCursor = eventsData.pageInfo?.endCursor || lastEventCursor;
    }
  } catch (err) {
    console.error("[Sync] Error syncing events:", err);
  }
}

async function processPendingCoinsForSplit(splitId: string) {
  try {
    // Step 1: Check what coin types the split holds
    const balanceResult = await graphqlClient.query({
      query: `
        query GetSplitBalances($owner: SuiAddress!) {
          address(address: $owner) {
            balances(first: 20) {
              nodes {
                coinType { repr }
                totalBalance
              }
            }
          }
        }
      `,
      variables: { owner: splitId },
    });

    const balanceNodes =
      (balanceResult.data as any)?.address?.balances?.nodes ?? [];
    if (balanceNodes.length === 0) {
      console.log(`[Process] No pending balances for Split ${splitId}`);
      return;
    }

    // Step 2: For each coin type, get the actual coin object IDs
    for (const node of balanceNodes) {
      const coinTypeRepr: string = node.coinType?.repr ?? "";
      if (!coinTypeRepr) continue;

      const innerType = coinTypeRepr; // already the full type e.g. 0x2::sui::SUI

      const objectsResult = await graphqlClient.query({
        query: `
          query GetCoinObjects($owner: SuiAddress!, $type: String!) {
            address(address: $owner) {
              objects(first: 50, filter: { type: $type }) {
                nodes {
                  address
                  version
                  digest
                }
              }
            }
          }
        `,
        variables: {
          owner: splitId,
          type: `0x2::coin::Coin<${innerType}>`,
        },
      });

      const objectsResults = await graphqlClient.query({
        query: `
    query GetCoinObjects($owner: SuiAddress!) {
      address(address: $owner) {
        objects(first: 50) {
          nodes {
            address
            version
            digest
            contents {
              type { repr }
            }
          }
        }
      }
    }
  `,
        variables: {
          owner: splitId,
        },
      });

      console.log(
        "RAW OBJECTS:",
        JSON.stringify(
          (objectsResults.data as any)?.address?.objects?.nodes,
          null,
          2,
        ),
      );

      const coinObjects =
        (objectsResult.data as any)?.address?.objects?.nodes ?? [];
      console.log(
        `[Process] Found ${coinObjects.length} coin objects for type ${innerType}`,
      );

      for (const coin of coinObjects) {
        const tx = new Transaction();
        tx.moveCall({
          target: `${PACKAGE_ID}::slyce::process_received_coin`,
          typeArguments: [innerType],
          arguments: [
            tx.object(PROTOCOL_CONFIG_ID),
            tx.object(splitId),
            tx.receivingRef({
              objectId: coin.address,
              version: coin.version,
              digest: coin.digest,
            }),
          ],
        });

        const txResult = await grpcClient.signAndExecuteTransaction({
          signer: keypair,
          transaction: tx,
        });

        if (txResult.$kind === "FailedTransaction") {
          console.error(`[Process] Failed for coin ${coin.address}`);
          continue;
        }

        console.log(`[Process] Successfully processed coin ${coin.address}`);
      }
    }
  } catch (err) {
    console.error(`[Process] Error processing split ${splitId}:`, err);
  }
}

async function runLoop() {
  console.log(
    `\n--- Starting Automation Cycle at ${new Date().toISOString()} ---`,
  );

  // 1. Discover any new splits
  await syncNewSplits();

  // 2. Process pending coins for all known splits
  const trackedSplits = loadTrackedSplits();
  console.log(`[Info] Tracking ${trackedSplits.size} splits.`);

  for (const splitId of trackedSplits) {
    await processPendingCoinsForSplit(splitId);
  }

  console.log(`--- Cycle Complete ---\n`);
}

// Start polling every 15 seconds
console.log("Starting Slyce Automation Service...");
startEmailServer();
runLoop();
setInterval(runLoop, 15 * 1000);
