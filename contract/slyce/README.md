# Slyce — Smart Contract

Programmable payment splitting on Sui. Move 2024 edition.

---

## Directory structure

```
slyce/
  Move.toml
  sources/
    slyce.move        ← entire protocol
  tests/
    slyce_tests.move  ← full test suite
```

---

## Quick start

### Prerequisites

```bash
# Install Sui CLI (latest)
cargo install --locked --git https://github.com/MystenLabs/sui.git \
  --branch main sui
```

### Build

```bash
cd slyce
sui move build
```

### Test

```bash
sui move test
```

All tests should pass green.

### Deploy to testnet

```bash
# Make sure you have a testnet wallet with SUI for gas
sui client switch --env testnet
sui move publish --gas-budget 200000000
```

Save the published package ID from the output — you need it in the SDK.

---

## Contract design

### Objects

| Object | Ownership | Purpose |
|---|---|---|
| `Registry` | Shared (one global) | Indexes all split IDs |
| `SplitAgreement<T>` | Shared (one per split) | Holds balance, recipients, rules |
| `InitiatorCap` | Owned → split creator | Gate for distribute / amend / close |
| `RecipientCap` | Owned → each recipient | One-time confirmation token |

### Coin type generic

The contract is `SplitAgreement<T>` — it works with any coin type.
Use `SUI` for SUI payments, `USDC` (Circle's Sui USDC address) for stablecoin splits.

### Percentages

All shares are in **basis points** (bps).  
`10_000` = 100%.  `500` = 5%.  `3_000` = 30%.  
They must sum exactly to `10_000` or `create_split` aborts.

### Distribution rules

| Constant | Value | Meaning |
|---|---|---|
| `DIST_MANUAL` | 0 | Initiator calls `distribute` manually |
| `DIST_THRESHOLD` | 1 | SDK watches balance; calls `distribute` when ≥ threshold |
| `DIST_SCHEDULED` | 2 | SDK calls `distribute` on a schedule |
| `DIST_INCOMING` | 3 | SDK watches the split address; calls `distribute` on every deposit |

Rules 1–3 are enforced by the **SDK/backend**, not the contract.  
The contract only rejects `distribute` if the split is not Active or has zero balance.

### Platform fee

Set per-split at creation time (`fee_bps`, `fee_recipient`).  
Default recommendation: `150` bps = 1.5%.  
Fee is deducted from the total before proportional distribution.

### Rounding

The last recipient in the list receives the arithmetic remainder after all
others are paid, ensuring no dust is ever stranded in the contract.

---

## Entry functions

### `create_split<T>`

```
create_split(
  registry:          &mut Registry,
  name:              vector<u8>,
  description:       vector<u8>,
  addrs:             vector<address>,
  names:             vector<vector<u8>>,
  roles:             vector<vector<u8>>,
  shares:            vector<u64>,       // basis points, must sum to 10_000
  distribution_rule: u8,
  threshold_amount:  u64,
  fee_bps:           u64,
  fee_recipient:     address,
  ctx:               &mut TxContext,
)
```

Creates the `SplitAgreement`, issues `InitiatorCap` to caller,
issues one `RecipientCap` to each recipient address.

---

### `confirm_share<T>`

```
confirm_share(
  agreement: &mut SplitAgreement<T>,
  cap:       RecipientCap,              // consumed — one-time use
  ctx:       &mut TxContext,
)
```

Recipient confirms their share.  `RecipientCap` is destroyed.
When all recipients confirm, split status becomes `Active`.

---

### `deposit<T>`

```
deposit(
  agreement: &mut SplitAgreement<T>,
  payment:   Coin<T>,
  ctx:       &mut TxContext,
)
```

Anyone can deposit.  Works in any status (pending or active).

---

### `distribute<T>`

```
distribute(
  agreement: &mut SplitAgreement<T>,
  cap:       &InitiatorCap,
  ctx:       &mut TxContext,
)
```

Distributes the entire current balance.
Requires: `STATUS_ACTIVE`, `balance > 0`, `cap` belongs to this split.

---

### `amend_recipient<T>`

```
amend_recipient(
  agreement:        &mut SplitAgreement<T>,
  cap:              &InitiatorCap,
  recipient_index:  u64,
  new_addr:         address,
  new_name:         vector<u8>,
  new_role:         vector<u8>,
  ctx:              &mut TxContext,
)
```

Replace a recipient before any money has moved.
Only works while `STATUS_PENDING` and `total_distributed == 0`.
Issues a new `RecipientCap` to `new_addr`.  Old cap becomes invalid.

---

### `close_split<T>`

```
close_split(
  agreement: &mut SplitAgreement<T>,
  cap:       &InitiatorCap,
  ctx:       &mut TxContext,
)
```

Permanently marks split as `CLOSED`.  Balance must be zero first.

---

## Events

| Event | Emitted when |
|---|---|
| `SplitCreatedEvent` | New split created |
| `ShareConfirmedEvent` | A recipient confirms |
| `SplitActivatedEvent` | Last confirmation received |
| `DepositEvent` | Funds deposited |
| `DistributionEvent` | Distribution executed |
| `RecipientAmendedEvent` | Recipient replaced |
| `SplitClosedEvent` | Split closed |

The SDK subscribes to these events to drive off-chain workflows
(email notifications, dashboard updates, threshold monitoring).

---

## Error codes

| Code | Name | Meaning |
|---|---|---|
| 0 | `EInvalidShares` | Shares don't sum to 10_000 |
| 1 | `EZeroShare` | A share is 0 bps |
| 2 | `EAlreadyLocked` | Split is Active — cannot amend |
| 3 | `EWrongSplit` | Cap belongs to a different split |
| 4 | `EAlreadyConfirmed` | Recipient already confirmed |
| 5 | `ENotActive` | Split is not Active |
| 6 | `EZeroBalance` | Nothing to distribute |
| 7 | `ENotInitiator` | Caller doesn't hold the InitiatorCap |
| 8 | `EInvalidRecipientCount` | < 2 or > 20 recipients |
| 9 | `EHasDistributed` | Amendment blocked — money already moved |
| 10 | `EBalanceNotEmpty` | Cannot close with funds remaining |
| 11 | `EDuplicateRecipient` | Same address appears twice |
| 12 | `EEmptyName` | Split name is empty |
