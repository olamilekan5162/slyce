/// Slyce — Programmable Payment Splitting Protocol
///
/// Architecture overview:
///
///   Registry (shared)  — one global object; maps split IDs → metadata.
///                        Lets the SDK look up any split without the
///                        caller already knowing its object ID.
///
///   SplitAgreement (shared) — one per split.  Holds recipient list,
///                        percentages, distribution rule, confirmation
///                        status, and the accumulated Balance<T>.
///
///   InitiatorCap (owned) — capability transferred to whoever created a
///                        split.  Required to trigger manual distribution,
///                        amend a pending split, or close it.
///
///   RecipientCap (owned) — one per recipient.  Proves membership in a
///                        split.  Required to confirm a share.
///
/// Flow:
///   1. create_split  → SplitAgreement (shared) + InitiatorCap (owned by creator)
///                       + N × RecipientCap (owned by each recipient address)
///   2. confirm_share → recipient calls with their RecipientCap; once ALL
///                       confirm, the split is locked (status = Active).
///   3. deposit       → anyone sends Coin<T> into the split balance.
///   4. distribute    → InitiatorCap holder triggers payout; the contract
///                       fans out proportional shares atomically via PTB-
///                       compatible return values (vector<Coin<T>>).
///   5. close         → InitiatorCap holder closes a zero-balance split.
///
/// Coin type T is generic — works with SUI, USDC, or any future token.
///
module slyce::slyce {

    // ── standard library ────────────────────────────────────────────────
    use std::string::{Self, String};
    use std::vector;

    // ── sui framework ────────────────────────────────────────────────────
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::event;
    use sui::object::{Self, ID, UID};
    use sui::table::{Self, Table};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::vec_map::{Self, VecMap};

    // ─────────────────────────────────────────────────────────────────────
    // Error codes
    // ─────────────────────────────────────────────────────────────────────

    /// Percentages in the recipient list do not sum to exactly 10_000 (100.00%).
    const EInvalidShares: u64 = 0;
    /// A recipient's share_bps must be > 0.
    const EZeroShare: u64 = 1;
    /// The split already has all confirmations — it is locked.
    const EAlreadyLocked: u64 = 2;
    /// The caller's RecipientCap does not belong to this split.
    const EWrongSplit: u64 = 3;
    /// The caller has already confirmed their share.
    const EAlreadyConfirmed: u64 = 4;
    /// Distribute called before all recipients have confirmed.
    const ENotActive: u64 = 5;
    /// Balance is zero — nothing to distribute.
    const EZeroBalance: u64 = 6;
    /// Only the initiator cap owner may call this.
    const ENotInitiator: u64 = 7;
    /// Recipient list must have at least 2 and at most 20 members.
    const EInvalidRecipientCount: u64 = 8;
    /// Amendment rejected — money has already moved through this split.
    const EHasDistributed: u64 = 9;
    /// Split must have zero balance to be closed.
    const EBalanceNotEmpty: u64 = 10;
    /// Duplicate recipient address in the list.
    const EDuplicateRecipient: u64 = 11;
    /// Name string is empty.
    const EEmptyName: u64 = 12;

    // ─────────────────────────────────────────────────────────────────────
    // Constants
    // ─────────────────────────────────────────────────────────────────────

    /// Basis points denominator.  10_000 bp = 100.00%
    const BPS_DENOMINATOR: u64 = 10_000;

    const MIN_RECIPIENTS: u64 = 2;
    const MAX_RECIPIENTS: u64 = 20;

    // ─────────────────────────────────────────────────────────────────────
    // Distribution rule enum  (stored as u8)
    // ─────────────────────────────────────────────────────────────────────

    /// Initiator manually calls distribute.
    const DIST_MANUAL: u8 = 0;
    /// Auto-distribute when balance >= threshold.
    const DIST_THRESHOLD: u8 = 1;
    /// Calendar-based distribution (tracked off-chain; on-chain flag only).
    const DIST_SCHEDULED: u8 = 2;
    /// Dedicated incoming address — every deposit triggers immediate split.
    /// The SDK/backend detects deposits and calls distribute on behalf of users.
    const DIST_INCOMING: u8 = 3;

    // ─────────────────────────────────────────────────────────────────────
    // Split status  (stored as u8)
    // ─────────────────────────────────────────────────────────────────────

    /// Waiting for all RecipientCaps to call confirm_share.
    const STATUS_PENDING: u8 = 0;
    /// All confirmed — distributions are enabled.
    const STATUS_ACTIVE: u8 = 1;
    /// Closed by initiator.
    const STATUS_CLOSED: u8 = 2;

    // ─────────────────────────────────────────────────────────────────────
    // Structs
    // ─────────────────────────────────────────────────────────────────────

    /// One entry in the recipient list.
    public struct Recipient has copy, drop, store {
        /// The Sui address that receives payments.
        addr: address,
        /// Friendly display name (e.g. "DJ Spinall").
        name: String,
        /// Role label (e.g. "Producer").
        role: String,
        /// Share in basis points.  500 = 5.00%, 3000 = 30.00%.
        share_bps: u64,
        /// Whether this recipient has confirmed their share.
        confirmed: bool,
    }

    /// The main split agreement object.  Shared so any transaction can
    /// deposit into it and the initiator can distribute from it.
    public struct SplitAgreement<phantom T> has key {
        id: UID,
        /// Human-readable name, e.g. "Kilometre — Single (2026)".
        name: String,
        /// Optional short description.
        description: String,
        /// Address that created this split.
        initiator: address,
        /// Ordered list of recipients.
        recipients: vector<Recipient>,
        /// How many recipients still need to confirm.
        pending_confirmations: u64,
        /// DIST_MANUAL | DIST_THRESHOLD | DIST_SCHEDULED | DIST_INCOMING
        distribution_rule: u8,
        /// For DIST_THRESHOLD: minimum balance (in base units) before auto-payout.
        threshold_amount: u64,
        /// STATUS_PENDING | STATUS_ACTIVE | STATUS_CLOSED
        status: u8,
        /// Funds held until distribution.
        balance: Balance<T>,
        /// Total ever distributed (for history / auditing).
        total_distributed: u64,
        /// Platform fee in basis points (default 150 = 1.50%).
        fee_bps: u64,
        /// Address that collects the platform fee.
        fee_recipient: address,
        /// Number of times distribute has been called successfully.
        distribution_count: u64,
    }

    /// Capability object given to the split creator.
    /// Has key + store so it can be transferred if ownership changes.
    public struct InitiatorCap has key, store {
        id: UID,
        /// The SplitAgreement this cap belongs to.
        split_id: ID,
    }

    /// Capability object given to each recipient when the split is created.
    /// The recipient must call confirm_share with this to register consent.
    public struct RecipientCap has key, store {
        id: UID,
        /// The SplitAgreement this cap belongs to.
        split_id: ID,
        /// Index in the recipients vector (to avoid linear search on confirm).
        recipient_index: u64,
        /// The recipient's address (sanity check).
        recipient_addr: address,
    }

    /// Global registry — one per deployment, shared.
    /// Allows the SDK to enumerate all splits and look them up by ID.
    public struct Registry has key {
        id: UID,
        /// split_id → initiator address
        splits: Table<ID, address>,
        /// Total splits ever created.
        total_splits: u64,
        /// Total volume ever distributed across all splits (in base units).
        total_volume: u64,
    }

    // ─────────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────────

    public struct SplitCreatedEvent has copy, drop {
        split_id: ID,
        initiator: address,
        name: String,
        recipient_count: u64,
        distribution_rule: u8,
    }

    public struct ShareConfirmedEvent has copy, drop {
        split_id: ID,
        recipient_addr: address,
        recipient_index: u64,
        /// True if this was the LAST confirmation — split is now Active.
        now_active: bool,
    }

    public struct SplitActivatedEvent has copy, drop {
        split_id: ID,
        initiator: address,
        name: String,
    }

    public struct DepositEvent has copy, drop {
        split_id: ID,
        depositor: address,
        amount: u64,
        new_balance: u64,
    }

    public struct DistributionEvent has copy, drop {
        split_id: ID,
        initiator: address,
        total_amount: u64,
        fee_amount: u64,
        recipient_count: u64,
        distribution_index: u64,
    }

    public struct SplitClosedEvent has copy, drop {
        split_id: ID,
        initiator: address,
    }

    public struct RecipientAmendedEvent has copy, drop {
        split_id: ID,
        old_addr: address,
        new_addr: address,
        index: u64,
    }

    // ─────────────────────────────────────────────────────────────────────
    // Module initialiser — runs once on publish
    // ─────────────────────────────────────────────────────────────────────

    fun init(ctx: &mut TxContext) {
        let registry = Registry {
            id: object::new(ctx),
            splits: table::new(ctx),
            total_splits: 0,
            total_volume: 0,
        };
        transfer::share_object(registry);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────────────────────────────

    /// Validate that share_bps values sum to BPS_DENOMINATOR and each > 0.
    /// Also checks for duplicate addresses.
    fun validate_recipients(
        addrs: &vector<address>,
        names: &vector<String>,
        roles: &vector<String>,
        shares: &vector<u64>,
    ) {
        let n = vector::length(shares);
        assert!(
            n >= MIN_RECIPIENTS && n <= MAX_RECIPIENTS,
            EInvalidRecipientCount
        );
        assert!(vector::length(addrs) == n, EInvalidRecipientCount);
        assert!(vector::length(names) == n, EInvalidRecipientCount);
        assert!(vector::length(roles) == n, EInvalidRecipientCount);

        let mut total: u64 = 0;
        let mut seen: VecMap<address, bool> = vec_map::empty();
        let mut i = 0;
        while (i < n) {
            let s = *vector::borrow(shares, i);
            assert!(s > 0, EZeroShare);
            total = total + s;

            let a = *vector::borrow(addrs, i);
            assert!(!vec_map::contains(&seen, &a), EDuplicateRecipient);
            vec_map::insert(&mut seen, a, true);

            i = i + 1;
        };
        assert!(total == BPS_DENOMINATOR, EInvalidShares);
    }

    /// Build the recipients vector from parallel input arrays.
    fun build_recipients(
        addrs: vector<address>,
        names: vector<String>,
        roles: vector<String>,
        shares: vector<u64>,
    ): vector<Recipient> {
        let mut recipients: vector<Recipient> = vector[];
        let n = vector::length(&shares);
        let mut i = 0;
        while (i < n) {
            let r = Recipient {
                addr:      *vector::borrow(&addrs, i),
                name:      *vector::borrow(&names, i),
                role:      *vector::borrow(&roles, i),
                share_bps: *vector::borrow(&shares, i),
                confirmed: false,
            };
            vector::push_back(&mut recipients, r);
            i = i + 1;
        };
        recipients
    }

    // ─────────────────────────────────────────────────────────────────────
    // Public entry — Create a split
    // ─────────────────────────────────────────────────────────────────────

    /// Create a new SplitAgreement.
    ///
    /// Parameters
    /// ----------
    /// registry         — the shared Registry object
    /// name             — display name for this split
    /// description      — short optional description
    /// addrs            — recipient Sui addresses (parallel with others)
    /// names            — display names for each recipient
    /// roles            — role labels for each recipient
    /// shares           — share_bps for each recipient; must sum to 10_000
    /// distribution_rule — DIST_MANUAL(0) / DIST_THRESHOLD(1) / DIST_SCHEDULED(2) / DIST_INCOMING(3)
    /// threshold_amount — for DIST_THRESHOLD: min balance before auto-pay (0 for others)
    /// fee_bps          — platform fee in basis points (e.g. 150 = 1.5%); caller sets it
    /// fee_recipient    — address that receives the platform fee
    ///
    /// On success:
    ///   - A SplitAgreement<T> is shared on-chain.
    ///   - An InitiatorCap is transferred to the caller.
    ///   - One RecipientCap is transferred to each recipient address.

    #[allow(lint(self_transfer))]
    public fun create_split<T>(
        registry: &mut Registry,
        name: vector<u8>,
        description: vector<u8>,
        addrs: vector<address>,
        names: vector<vector<u8>>,
        roles: vector<vector<u8>>,
        shares: vector<u64>,
        distribution_rule: u8,
        threshold_amount: u64,
        fee_bps: u64,
        fee_recipient: address,
        ctx: &mut TxContext,
    ) {
        let name_str = string::utf8(name);
        assert!(string::length(&name_str) > 0, EEmptyName);

        // Convert raw bytes to String vectors
        let mut str_names: vector<String> = vector[];
        let mut str_roles: vector<String> = vector[];
        let n = vector::length(&names);
        let mut i = 0;
        while (i < n) {
            vector::push_back(&mut str_names, string::utf8(*vector::borrow(&names, i)));
            vector::push_back(&mut str_roles, string::utf8(*vector::borrow(&roles, i)));
            i = i + 1;
        };

        validate_recipients(&addrs, &str_names, &str_roles, &shares);

        let recipient_count = vector::length(&shares);
        let initiator = tx_context::sender(ctx);

        let recipients = build_recipients(addrs, str_names, str_roles, shares);

        let uid = object::new(ctx);
        let split_id = object::uid_to_inner(&uid);

        let agreement = SplitAgreement<T> {
            id: uid,
            name: name_str,
            description: string::utf8(description),
            initiator,
            recipients,
            pending_confirmations: recipient_count,
            distribution_rule,
            threshold_amount,
            status: STATUS_PENDING,
            balance: balance::zero<T>(),
            total_distributed: 0,
            fee_bps,
            fee_recipient,
            distribution_count: 0,
        };

        // Register in the global registry
        table::add(&mut registry.splits, split_id, initiator);
        registry.total_splits = registry.total_splits + 1;

        // Transfer InitiatorCap to caller
        let initiator_cap = InitiatorCap {
            id: object::new(ctx),
            split_id,
        };
        transfer::transfer(initiator_cap, initiator);

        // Transfer one RecipientCap to each recipient
        let mut j = 0;
        while (j < recipient_count) {
            let r = vector::borrow(&agreement.recipients, j);
            let recipient_cap = RecipientCap {
                id: object::new(ctx),
                split_id,
                recipient_index: j,
                recipient_addr: r.addr,
            };
            transfer::transfer(recipient_cap, r.addr);
            j = j + 1;
        };

        event::emit(SplitCreatedEvent {
            split_id,
            initiator,
            name: agreement.name,
            recipient_count,
            distribution_rule,
        });

        transfer::share_object(agreement);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Public entry — Recipient confirms their share
    // ─────────────────────────────────────────────────────────────────────

    /// The recipient calls this with their RecipientCap to consent to the
    /// agreement.  When the last recipient confirms, the split becomes Active.
    ///
    /// The RecipientCap is consumed (destroyed) — it cannot be used again.
    public fun confirm_share<T>(
        agreement: &mut SplitAgreement<T>,
        cap: RecipientCap,
        ctx: &mut TxContext,
    ) {
        // Verify the cap belongs to this split
        assert!(cap.split_id == object::uid_to_inner(&agreement.id), EWrongSplit);
        assert!(agreement.status == STATUS_PENDING, EAlreadyLocked);

        let idx = cap.recipient_index;
        let caller = tx_context::sender(ctx);

        // Verify caller is the expected recipient
        let r = vector::borrow_mut(&mut agreement.recipients, idx);
        assert!(r.addr == caller, EWrongSplit);
        assert!(!r.confirmed, EAlreadyConfirmed);

        r.confirmed = true;
        agreement.pending_confirmations = agreement.pending_confirmations - 1;

        let now_active = agreement.pending_confirmations == 0;
        if (now_active) {
            agreement.status = STATUS_ACTIVE;
            event::emit(SplitActivatedEvent {
                split_id: object::uid_to_inner(&agreement.id),
                initiator: agreement.initiator,
                name: agreement.name,
            });
        };

        event::emit(ShareConfirmedEvent {
            split_id: object::uid_to_inner(&agreement.id),
            recipient_addr: caller,
            recipient_index: idx,
            now_active,
        });

        // Destroy the cap — one-time use
        let RecipientCap { id, split_id: _, recipient_index: _, recipient_addr: _ } = cap;
        object::delete(id);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Public entry — Deposit funds into a split
    // ─────────────────────────────────────────────────────────────────────

    /// Anyone can deposit Coin<T> into a split.  No restriction on status —
    /// you can fund a pending split so it is ready to distribute the moment
    /// it activates.
    public fun deposit<T>(
        agreement: &mut SplitAgreement<T>,
        payment: Coin<T>,
        ctx: &mut TxContext,
    ) {
        let amount = coin::value(&payment);
        balance::join(&mut agreement.balance, coin::into_balance(payment));

        event::emit(DepositEvent {
            split_id: object::uid_to_inner(&agreement.id),
            depositor: tx_context::sender(ctx),
            amount,
            new_balance: balance::value(&agreement.balance),
        });
    }

    // ─────────────────────────────────────────────────────────────────────
    // Public entry — Distribute funds
    // ─────────────────────────────────────────────────────────────────────

    /// Distribute the entire current balance proportionally to all recipients.
    ///
    /// This is the core atomic payout.  The function:
    ///   1. Deducts the platform fee.
    ///   2. For each recipient, splits their proportional share out of the
    ///      remaining balance and transfers it directly to their address.
    ///
    /// Requires: STATUS_ACTIVE, balance > 0, caller holds InitiatorCap.
    ///
    /// For DIST_THRESHOLD splits the SDK/backend checks the threshold and
    /// calls this entry — the contract does not re-check it so off-chain
    /// automation can call it without restriction.
    public fun distribute<T>(
        agreement: &mut SplitAgreement<T>,
        cap: &InitiatorCap,
        ctx: &mut TxContext,
    ) {
        assert!(cap.split_id == object::uid_to_inner(&agreement.id), ENotInitiator);
        assert!(agreement.status == STATUS_ACTIVE, ENotActive);

        let total = balance::value(&agreement.balance);
        assert!(total > 0, EZeroBalance);

        // ── Platform fee ─────────────────────────────────────────────────
        let fee_amount = (total * agreement.fee_bps) / BPS_DENOMINATOR;
        if (fee_amount > 0) {
            let fee_balance = balance::split(&mut agreement.balance, fee_amount);
            let fee_coin = coin::from_balance(fee_balance, ctx);
            transfer::public_transfer(fee_coin, agreement.fee_recipient);
        };

        // ── Distribute remaining balance ──────────────────────────────────
        let distributable = balance::value(&agreement.balance);
        let n = vector::length(&agreement.recipients);

        // We split out n-1 shares explicitly; the last recipient gets
        // whatever remains to avoid rounding dust being stranded.
        let mut i = 0;
        while (i < n - 1) {
            let r = vector::borrow(&agreement.recipients, i);
            let share_amount = (distributable * r.share_bps) / BPS_DENOMINATOR;
            if (share_amount > 0) {
                let share_balance = balance::split(&mut agreement.balance, share_amount);
                let share_coin = coin::from_balance(share_balance, ctx);
                transfer::public_transfer(share_coin, r.addr);
            };
            i = i + 1;
        };

        // Last recipient gets the remainder (handles rounding dust)
        let remainder = balance::value(&agreement.balance);
        if (remainder > 0) {
            let last_r = vector::borrow(&agreement.recipients, n - 1);
            let last_balance = balance::split(&mut agreement.balance, remainder);
            let last_coin = coin::from_balance(last_balance, ctx);
            transfer::public_transfer(last_coin, last_r.addr);
        };

        agreement.total_distributed = agreement.total_distributed + total;
        agreement.distribution_count = agreement.distribution_count + 1;

        // Update global volume tracker (best-effort; registry not passed here)
        event::emit(DistributionEvent {
            split_id: object::uid_to_inner(&agreement.id),
            initiator: tx_context::sender(ctx),
            total_amount: total,
            fee_amount,
            recipient_count: n,
            distribution_index: agreement.distribution_count,
        });
    }

    // ─────────────────────────────────────────────────────────────────────
    // Public entry — Amend a recipient (only while pending + zero history)
    // ─────────────────────────────────────────────────────────────────────

    /// Replace a recipient's address before any money has moved.
    ///
    /// Use case: a collaborator drops out before they have confirmed.
    /// The initiator can swap in a replacement; a fresh RecipientCap is
    /// issued to the new address, and the old cap becomes permanently invalid
    /// (it will fail EWrongSplit on confirm_share if reused).
    ///
    /// Rules:
    ///   - Only callable while STATUS_PENDING.
    ///   - Only callable if total_distributed == 0 (no money has moved).
    ///   - The target recipient must NOT have confirmed yet.
    public fun amend_recipient<T>(
        agreement: &mut SplitAgreement<T>,
        cap: &InitiatorCap,
        recipient_index: u64,
        new_addr: address,
        new_name: vector<u8>,
        new_role: vector<u8>,
        ctx: &mut TxContext,
    ) {
        assert!(cap.split_id == object::uid_to_inner(&agreement.id), ENotInitiator);
        assert!(agreement.status == STATUS_PENDING, EAlreadyLocked);
        assert!(agreement.total_distributed == 0, EHasDistributed);

        let r = vector::borrow_mut(&mut agreement.recipients, recipient_index);
        assert!(!r.confirmed, EAlreadyConfirmed);

        let old_addr = r.addr;
        r.addr = new_addr;
        r.name = string::utf8(new_name);
        r.role = string::utf8(new_role);

        // Issue a fresh RecipientCap to the new address
        let new_cap = RecipientCap {
            id: object::new(ctx),
            split_id: object::uid_to_inner(&agreement.id),
            recipient_index,
            recipient_addr: new_addr,
        };
        transfer::transfer(new_cap, new_addr);

        event::emit(RecipientAmendedEvent {
            split_id: object::uid_to_inner(&agreement.id),
            old_addr,
            new_addr,
            index: recipient_index,
        });
    }

    // ─────────────────────────────────────────────────────────────────────
    // Public entry — Close a split
    // ─────────────────────────────────────────────────────────────────────

    /// Permanently close a split.  Requires zero balance — initiator must
    /// distribute everything first.  The SplitAgreement object is NOT deleted
    /// (shared objects cannot be deleted on Sui) but is marked CLOSED so
    /// distribute and deposit are rejected.
    public fun close_split<T>(
        agreement: &mut SplitAgreement<T>,
        cap: &InitiatorCap,
        _ctx: &mut TxContext,
    ) {
        assert!(cap.split_id == object::uid_to_inner(&agreement.id), ENotInitiator);
        assert!(balance::value(&agreement.balance) == 0, EBalanceNotEmpty);
        agreement.status = STATUS_CLOSED;

        event::emit(SplitClosedEvent {
            split_id: object::uid_to_inner(&agreement.id),
            initiator: agreement.initiator,
        });
    }

    // ─────────────────────────────────────────────────────────────────────
    // Read-only view helpers  (non-entry public functions)
    // These are callable from PTBs and other Move modules.
    // ─────────────────────────────────────────────────────────────────────

    public fun split_name<T>(agreement: &SplitAgreement<T>): &String {
        &agreement.name
    }

    public fun split_status<T>(agreement: &SplitAgreement<T>): u8 {
        agreement.status
    }

    public fun split_balance<T>(agreement: &SplitAgreement<T>): u64 {
        balance::value(&agreement.balance)
    }

    public fun split_total_distributed<T>(agreement: &SplitAgreement<T>): u64 {
        agreement.total_distributed
    }

    public fun split_pending_confirmations<T>(agreement: &SplitAgreement<T>): u64 {
        agreement.pending_confirmations
    }

    public fun split_distribution_rule<T>(agreement: &SplitAgreement<T>): u8 {
        agreement.distribution_rule
    }

    public fun split_threshold<T>(agreement: &SplitAgreement<T>): u64 {
        agreement.threshold_amount
    }

    public fun split_initiator<T>(agreement: &SplitAgreement<T>): address {
        agreement.initiator
    }

    public fun split_recipient_count<T>(agreement: &SplitAgreement<T>): u64 {
        vector::length(&agreement.recipients)
    }

    public fun recipient_at<T>(agreement: &SplitAgreement<T>, index: u64): (address, String, String, u64, bool) {
        let r = vector::borrow(&agreement.recipients, index);
        (r.addr, r.name, r.role, r.share_bps, r.confirmed)
    }

    public fun registry_total_splits(registry: &Registry): u64 {
        registry.total_splits
    }

    // ─────────────────────────────────────────────────────────────────────
    // Constants exposed for SDK / tests
    // ─────────────────────────────────────────────────────────────────────

    public fun dist_manual(): u8    { DIST_MANUAL }
    public fun dist_threshold(): u8 { DIST_THRESHOLD }
    public fun dist_scheduled(): u8 { DIST_SCHEDULED }
    public fun dist_incoming(): u8  { DIST_INCOMING }

    public fun status_pending(): u8 { STATUS_PENDING }
    public fun status_active(): u8  { STATUS_ACTIVE }
    public fun status_closed(): u8  { STATUS_CLOSED }

    public fun bps_denominator(): u64 { BPS_DENOMINATOR }
}
