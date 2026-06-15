// ── Split Types ────────────────────────────────────────────────

export type DistributionType =
  | "Manual"
  | "Threshold"
  | "Scheduled"
  | "Incoming";

export type RecipientType = "address" | "email" | "contact";

export interface SplitRecipient {
  contact: string;
  address?: string;
  share: number; // basis points (e.g. 5000 = 50%)
  confirmed: boolean;
}

export interface TokenOption {
  id: string;
  symbol: string;
  name: string;
  iconUrl: string;
}

export interface Split {
  id: string;
  name: string;
  creator: string;
  recipients: SplitRecipient[];
  confirmedCount: number;
  isLocked: boolean;
  isCancelled: boolean;
  distributionType: DistributionType;
  threshold: number;
  interval: number;
  targetCurrency?: string;
}

export interface SplitFormData {
  name: string;
  recipients: {
    contact: string;
    address: string;
    share: number;
  }[];
  distributionType: DistributionType;
  threshold: number;
  interval: number;
}

// ── Asset / Balance Types ──────────────────────────────────────

export interface AssetMetadata {
  symbol: string;
  name: string;
  decimals: number;
  iconUrl: string;
}

export interface Asset extends AssetMetadata {
  balance: number;
  usdValue?: string;
  priceChangePercent?: number | null;
}

export interface RecipientForm {
  address: string;
  share: string;
  type: RecipientType;
}
// ── Activity Types ─────────────────────────────────────────────

export type ActivityType = "receive" | "split" | "confirm" | "deposit";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  amount: string;
  date: string;
  time: string;
  status: "Completed" | "Failed" | "Pending";
}

// ── Network / Config ───────────────────────────────────────────

export type SuiNetwork = "testnet" | "mainnet" | "devnet";

export interface NetworkConfig {
  packageId: string;
  network: SuiNetwork;
}
