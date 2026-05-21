export const currentUser = {
  name: "Tunde Adeyemi",
  initials: "TA",
  email: "tunde@gmail.com",
  wallet: "0x7a1f...2e9b",
};

export const mySplits = [
  {
    id: "split-001",
    name: "Kilometre — Single (2026)",
    recipients: 4,
    totalDistributed: 255.00,
    status: "live",
    distribution: "Threshold $50",
    currency: "USDC",
  },
  {
    id: "split-002",
    name: "Lagos Nights — Collab",
    recipients: 3,
    totalDistributed: 80.00,
    status: "live",
    distribution: "Incoming address",
    currency: "USDC",
  },
  {
    id: "split-003",
    name: "Brand Deal — March 2026",
    recipients: 2,
    totalDistributed: 0,
    status: "pending",
    distribution: "Manual",
    currency: "USDC",
  },
];

export const splitDetail = {
  id: "split-001",
  name: "Kilometre — Single (2026)",
  description: "Streaming royalties split for the Kilometre single.",
  status: "live",
  distribution: "threshold",
  thresholdAmount: 50,
  splitAddress: "0x9c2b...4f7a",
  totalDistributed: 255.00,
  recipients: [
    { name: "Tunde Adeyemi", role: "Vocalist", address: "0x7a1f...2e9b", share: 50, confirmed: true },
    { name: "DJ Spinall", role: "Producer", address: "0x4c3d...8f1a", share: 30, confirmed: true },
    { name: "Sarz", role: "Co-producer", address: "0x2b9e...5c7d", share: 15, confirmed: true },
    { name: "Efe Williams", role: "Songwriter", address: "0x8f4a...1b3c", share: 5, confirmed: true },
  ],
  history: [
    { date: "Mar 1, 2026", amount: 100.00, note: "DistroKid Q1", status: "All 4 paid", tx: "0x3f2a...9c1d" },
    { date: "Mar 15, 2026", amount: 55.00, note: "Threshold auto", status: "All 4 paid", tx: "0x8b1c...4e7f" },
    { date: "Apr 1, 2026", amount: 100.00, note: "DistroKid Q2", status: "All 4 paid", tx: "0x1d9e...2a5b" },
  ],
};

export const recipientSplits = [
  { name: "Kilometre — Single (2026)", myShare: 30, totalReceived: 76.50, initiator: "Tunde Adeyemi" },
  { name: "Lagos Nights", myShare: 25, totalReceived: 20.00, initiator: "Tunde Adeyemi" },
];

export const confirmationData = {
  inviter: "Tunde Adeyemi",
  splitName: "Kilometre — Single (2026)",
  myShare: 30,
  myRole: "Producer",
  myAddress: "0x4c3d...8f1a",
  participants: [
    { name: "Tunde Adeyemi", role: "Vocalist", share: 50, isMe: false },
    { name: "DJ Spinall", role: "Producer", share: 30, isMe: true },
    { name: "Sarz", role: "Co-producer", share: 15, isMe: false },
    { name: "Efe Williams", role: "Songwriter", share: 5, isMe: false },
  ],
};
