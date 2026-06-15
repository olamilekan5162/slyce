/*
/// Module: slyce
module slyce::slyce;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

module slyce::slyce;

    use sui::coin::{Self, Coin};
    use sui::balance::Balance;
    use sui::dynamic_field;
    use sui::event;
    use std::ascii::String;

    // ── Errors ────────────────────────────────────────────────────────────────
    const EInvalidShares:     u64 = 0;
    const ENotLocked:         u64 = 1;
    const EAlreadyLocked:     u64 = 2;
    const ENotRecipient:      u64 = 3;
    const EZeroAmount:        u64 = 4;
    const EAlreadyConfirmed:  u64 = 5;
    const ENoRecipients:      u64 = 6;
    const ENoFunds:           u64 = 7;
    const ESplitCancelled:    u64 = 8;
    const ENotCreator:        u64 = 9;
    const EFeeTooHigh:        u64 = 10;
    const ERecipientNotFound: u64 = 11;

    const BPS_DENOMINATOR: u64 = 10_000; // 100.00 %
    const MAX_FEE_BPS:     u64 = 500;    // 5 % ceiling

    // ── Events ────────────────────────────────────────────────────────────────
    public struct SplitCreatedEvent has copy, drop {
        split_id:          ID,
        name:              String,
        creator:           address,
        num_recipients:    u64,
        distribution_type: u8,
    }

    public struct RecipientConfirmedEvent has copy, drop {
        split_id:           ID,
        recipient:          address,
        confirmations_left: u64,
    }

    public struct SplitLockedEvent has copy, drop { split_id: ID }

    public struct SplitCancelledEvent has copy, drop { split_id: ID }

    public struct RecipientAmendedEvent has copy, drop {
        split_id:      ID,
        recipient_idx: u64,
    }

    public struct FundsDepositedEvent has copy, drop {
        split_id: ID,
        amount:   u64,
    }

    public struct PaymentDistributedEvent has copy, drop {
        split_id: ID,
        amount:   u64,
    }

    public struct FeeUpdatedEvent has copy, drop {
        old_fee_bps: u64,
        new_fee_bps: u64,
    }

    public struct TreasuryUpdatedEvent has copy, drop { new_treasury: address }

    public struct SplitUpdatedEvent has copy, drop {
        split_id:      ID,
        num_recipients: u64,
        distribution_type: u8,
    }

    // ── Objects ───────────────────────────────────────────────────────────────

    /// Grants admin control over ProtocolConfig.
    /// Transfer this object to transfer governance.
    public struct AdminCap has key, store { id: UID }

    /// Shared singleton — stores the platform fee rate and treasury.
    public struct ProtocolConfig has key {
        id:       UID,
        fee_bps:  u64,
        treasury: address,
    }

    public struct Recipient has store, copy, drop {
        contact:           String,
        confirmed_address: Option<address>,
        share:             u64,
        confirmed:         bool,
        passcode_hash:     vector<u8>,
    }

    /// A payment-splitting agreement between multiple recipients.
    public struct Split has key {
        id:                UID,
        name:              String,
        creator:           address,
        recipients:        vector<Recipient>,
        confirmed_count:   u64,
        is_locked:         bool,
        is_cancelled:      bool,
        distribution_type: u8,    // 0: Manual, 1: Threshold, 2: Scheduled, 3: Incoming
        threshold:         u64,   // Only used if type == 1
        interval:          u64,   // Only used if type == 2
        target_currency:   Option<String>,
    }

    /// Dynamic-field key for the per-coin vault.
    public struct VaultKey<phantom T> has copy, drop, store {}

    // ── Public View Functions ─────────────────────────────────────────────────

    /// Returns the current platform fee in basis points.
    public fun get_fee_bps(config: &ProtocolConfig): u64 { config.fee_bps }

    /// Returns the treasury address.
    public fun get_treasury(config: &ProtocolConfig): address { config.treasury }

    /// Returns true if the split is locked.
    public fun is_locked(split: &Split): bool { split.is_locked }

    /// Returns true if the split is cancelled.
    public fun is_cancelled(split: &Split): bool { split.is_cancelled }

    /// Returns the number of confirmed recipients.
    public fun confirmed_count(split: &Split): u64 { split.confirmed_count }

    /// Returns the distribution type (0=Manual, 1=Threshold, 2=Scheduled, 3=Incoming).
    public fun distribution_type(split: &Split): u8 { split.distribution_type }

    /// Returns the threshold amount (only relevant for Threshold distribution).
    public fun threshold(split: &Split): u64 { split.threshold }

    /// Returns the split name.
    public fun name(split: &Split): String { split.name }

    // ── Init ──────────────────────────────────────────────────────────────────
    fun init(ctx: &mut TxContext) {
        // AdminCap goes to deployer; transfer it to pass governance
        transfer::transfer(AdminCap { id: object::new(ctx) }, ctx.sender());

        transfer::share_object(ProtocolConfig {
            id:       object::new(ctx),
            fee_bps:  100,             // 1 % default
            treasury: ctx.sender(),
        });
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    public fun update_fee(
        _cap:        &AdminCap,
        config:      &mut ProtocolConfig,
        new_fee_bps: u64,
    ) {
        assert!(new_fee_bps <= MAX_FEE_BPS, EFeeTooHigh);
        let old_fee_bps = config.fee_bps;
        config.fee_bps  = new_fee_bps;
        event::emit(FeeUpdatedEvent { old_fee_bps, new_fee_bps });
    }

    public fun update_treasury(
        _cap:         &AdminCap,
        config:       &mut ProtocolConfig,
        new_treasury: address,
    ) {
        config.treasury = new_treasury;
        event::emit(TreasuryUpdatedEvent { new_treasury });
    }

    // ── Create ────────────────────────────────────────────────────────────────
    public fun create_split(
        name:              String,
        contacts:          vector<String>,
        addresses:         vector<address>,
        shares:            vector<u64>,
        passcode_hashes:   vector<vector<u8>>,
        distribution_type: u8,
        threshold:         u64,
        interval:          u64,
        target_currency:   Option<String>,
        ctx:               &mut TxContext,
    ) {
        let n = contacts.length();
        assert!(n > 0, ENoRecipients);
        assert!(n == shares.length(), EInvalidShares);
        assert!(n == addresses.length(), EInvalidShares);
        assert!(n == passcode_hashes.length(), EInvalidShares);

        let mut sum = 0u64;
        let mut i   = 0;
        while (i < n) { sum = sum + shares[i]; i = i + 1 };
        assert!(sum == BPS_DENOMINATOR, EInvalidShares);

        let uid      = object::new(ctx);
        let split_id = uid.to_inner();

        event::emit(SplitCreatedEvent {
            split_id,
            name:              copy name,
            creator:           ctx.sender(),
            num_recipients:    n,
            distribution_type,
        });

        let mut recipients = vector[];
        let mut j = 0;
        while (j < n) {
            let contact = *vector::borrow(&contacts, j);
            let addr = *vector::borrow(&addresses, j);
            let share = *vector::borrow(&shares, j);
            let passcode_hash = *vector::borrow(&passcode_hashes, j);

            let confirmed_address = if (addr == @0x0) {
                option::none()
            } else {
                option::some(addr)
            };

            vector::push_back(&mut recipients, Recipient {
                contact,
                confirmed_address,
                share,
                confirmed: false,
                passcode_hash,
            });
            j = j + 1;
        };

        // Auto-confirm the creator (index 0)
        let first_recipient = vector::borrow_mut(&mut recipients, 0);
        first_recipient.confirmed = true;
        first_recipient.confirmed_address = option::some(ctx.sender());

        let split = Split {
            id:                   uid,
            name,
            creator:              ctx.sender(),
            recipients,
            confirmed_count:      1,
            is_locked:            n == 1, // Lock immediately if solo split
            is_cancelled:         false,
            distribution_type,
            threshold,
            interval,
            target_currency,
        };

        if (split.is_locked) {
            event::emit(SplitLockedEvent { split_id: split.id.to_inner() });
        };

        transfer::share_object(split);
    }

    // ── Confirm ───────────────────────────────────────────────────────────────
    public fun confirm_split(
        split:         &mut Split,
        recipient_idx: u64,
        passcode:      vector<u8>,
        ctx:           &mut TxContext,
    ) {
        assert!(!split.is_cancelled, ESplitCancelled);
        assert!(!split.is_locked, EAlreadyLocked);

        let sender = ctx.sender();
        let total  = split.recipients.length();
        assert!(recipient_idx < total, ERecipientNotFound);

        let recipient = vector::borrow_mut(&mut split.recipients, recipient_idx);
        assert!(!recipient.confirmed, EAlreadyConfirmed);

        if (recipient.confirmed_address.is_some()) {
            let target_addr = *recipient.confirmed_address.borrow();
            assert!(target_addr == sender, ENotRecipient);
        } else {
            assert!(recipient.passcode_hash.length() > 0, ENotRecipient);
            let hashed = std::hash::sha2_256(passcode);
            assert!(hashed == recipient.passcode_hash, ENotRecipient);
            recipient.confirmed_address = option::some(sender);
        };

        recipient.confirmed = true;
        split.confirmed_count = split.confirmed_count + 1;

        let confirmed = split.confirmed_count;
        let split_id  = object::id(split);

        event::emit(RecipientConfirmedEvent {
            split_id,
            recipient:          sender,
            confirmations_left: total - confirmed,
        });

        if (confirmed == total) {
            split.is_locked = true;
            event::emit(SplitLockedEvent { split_id });
        }
    }

    // ── Cancel ────────────────────────────────────────────────────────────────
    /// Permanently deactivates an unlocked split.
    /// Shared objects cannot be deleted on Sui — is_cancelled blocks all future calls.
    public fun cancel_split(split: &mut Split, ctx: &mut TxContext) {
        assert!(!split.is_cancelled, ESplitCancelled);
        assert!(!split.is_locked, EAlreadyLocked);
        assert!(split.creator == ctx.sender(), ENotCreator);

        split.is_cancelled = true;
        event::emit(SplitCancelledEvent { split_id: object::id(split) });
    }

    // ── Update ────────────────────────────────────────────────────────────────
    /// Full update of a split's metadata and recipients.
    /// Only the creator can call this before the split is locked.
    /// All existing confirmations are reset — everyone must re-confirm.
    public fun update_split(
        split:             &mut Split,
        name:              String,
        contacts:          vector<String>,
        addresses:         vector<address>,
        shares:            vector<u64>,
        passcode_hashes:   vector<vector<u8>>,
        distribution_type: u8,
        threshold:         u64,
        interval:          u64,
        target_currency:   Option<String>,
        ctx:               &mut TxContext,
    ) {
        assert!(!split.is_cancelled, ESplitCancelled);
        assert!(!split.is_locked, EAlreadyLocked);
        assert!(split.creator == ctx.sender(), ENotCreator);

        let n = contacts.length();
        assert!(n > 0, ENoRecipients);
        assert!(n == shares.length(), EInvalidShares);
        assert!(n == addresses.length(), EInvalidShares);
        assert!(n == passcode_hashes.length(), EInvalidShares);

        let mut sum = 0u64;
        let mut i   = 0;
        while (i < n) { sum = sum + shares[i]; i = i + 1 };
        assert!(sum == BPS_DENOMINATOR, EInvalidShares);

        let mut recipients = vector[];
        let mut j = 0;
        while (j < n) {
            let contact = *vector::borrow(&contacts, j);
            let addr = *vector::borrow(&addresses, j);
            let share = *vector::borrow(&shares, j);
            let passcode_hash = *vector::borrow(&passcode_hashes, j);

            let confirmed_address = if (addr == @0x0) {
                option::none()
            } else {
                option::some(addr)
            };

            vector::push_back(&mut recipients, Recipient {
                contact,
                confirmed_address,
                share,
                confirmed: false,
                passcode_hash,
            });
            j = j + 1;
        };

        split.name = name;
        split.recipients = recipients;
        split.confirmed_count = 0;
        split.distribution_type = distribution_type;
        split.threshold = threshold;
        split.interval = interval;
        split.target_currency = target_currency;

        event::emit(SplitUpdatedEvent {
            split_id: object::id(split),
            num_recipients: n,
            distribution_type,
        });
    }

    // ── Amend ─────────────────────────────────────────────────────────────────
    /// Replace a recipient before the split locks.
    /// All existing confirmations are reset — everyone must re-confirm.
    public fun replace_recipient(
        split:             &mut Split,
        recipient_idx:     u64,
        new_contact:       String,
        new_address:       address,
        new_passcode_hash: vector<u8>,
        ctx:               &mut TxContext,
    ) {
        assert!(!split.is_cancelled, ESplitCancelled);
        assert!(!split.is_locked, EAlreadyLocked);
        assert!(split.creator == ctx.sender(), ENotCreator);

        let n = split.recipients.length();
        assert!(recipient_idx < n, ERecipientNotFound);

        let recipient = vector::borrow_mut(&mut split.recipients, recipient_idx);
        recipient.contact = new_contact;
        if (new_address == @0x0) {
            recipient.confirmed_address = option::none();
        } else {
            recipient.confirmed_address = option::some(new_address);
        };
        recipient.passcode_hash = new_passcode_hash;
        recipient.confirmed = false;

        // Reset all confirmations — the agreement has changed
        let mut i = 0;
        while (i < n) {
            let r = vector::borrow_mut(&mut split.recipients, i);
            r.confirmed = false;
            i = i + 1;
        };
        split.confirmed_count = 0;

        event::emit(RecipientAmendedEvent {
            split_id: object::id(split),
            recipient_idx,
        });
    }

    // ── Direct Split ─────────────────────────────────────────────────────────
    public fun split_payment<T>(
        config:  &ProtocolConfig,
        split:   &Split,
        payment: Coin<T>,
        ctx:     &mut TxContext,
    ) {
        assert!(!split.is_cancelled, ESplitCancelled);
        assert!(split.is_locked, ENotLocked);
        assert!(payment.value() > 0, EZeroAmount);
        internal_distribute(config, split, payment, ctx);
    }

    // ── Vault Deposit ─────────────────────────────────────────────────────────
    public fun deposit_to_vault<T>(split: &mut Split, payment: Coin<T>) {
        assert!(!split.is_cancelled, ESplitCancelled);
        let amount = payment.value();
        assert!(amount > 0, EZeroAmount);

        let key = VaultKey<T> {};

        if (dynamic_field::exists_with_type<VaultKey<T>, Balance<T>>(&split.id, key)) {
            let vault = dynamic_field::borrow_mut<VaultKey<T>, Balance<T>>(&mut split.id, key);
            vault.join(payment.into_balance());
        } else {
            dynamic_field::add(&mut split.id, key, payment.into_balance());
        };

        event::emit(FundsDepositedEvent { split_id: object::id(split), amount });
    }

    // ── Vault Distribution ────────────────────────────────────────────────────
    public fun distribute_vault<T>(
        config: &ProtocolConfig,
        split:  &mut Split,
        ctx:    &mut TxContext,
    ) {
        assert!(!split.is_cancelled, ESplitCancelled);
        assert!(split.is_locked, ENotLocked);

        let key = VaultKey<T> {};
        assert!(
            dynamic_field::exists_with_type<VaultKey<T>, Balance<T>>(&split.id, key),
            ENoFunds,
        );

        let vault   = dynamic_field::remove<VaultKey<T>, Balance<T>>(&mut split.id, key);
        let payment = coin::from_balance(vault, ctx);
        internal_distribute(config, split, payment, ctx);
    }

    // ── Inbox Distribution (Receiving) ────────────────────────────────────────
    public fun receive_and_distribute<T>(
        config:  &ProtocolConfig,
        split:   &mut Split,
        receipt: sui::transfer::Receiving<Coin<T>>,
        ctx:     &mut TxContext,
    ) {
        assert!(!split.is_cancelled, ESplitCancelled);
        assert!(split.is_locked, ENotLocked);
        let payment = sui::transfer::public_receive(&mut split.id, receipt);
        assert!(payment.value() > 0, EZeroAmount);
        internal_distribute(config, split, payment, ctx);
    }

    // ── Internal ──────────────────────────────────────────────────────────────
    fun internal_distribute<T>(
        config:      &ProtocolConfig,
        split:       &Split,
        mut payment: Coin<T>,
        ctx:         &mut TxContext,
    ) {
        let total = payment.value();

        // Protocol fee
        let fee = (total * config.fee_bps) / BPS_DENOMINATOR;
        if (fee > 0) {
            transfer::public_transfer(payment.split(fee, ctx), config.treasury);
        };

        // Per-recipient shares — all except the last
        let after_fee = payment.value();
        let n         = split.recipients.length();
        let mut i     = 0;
        while (i < n - 1) {
            let recipient = vector::borrow(&split.recipients, i);
            let amount = (after_fee * recipient.share) / BPS_DENOMINATOR;
            if (amount > 0) {
                let addr = *option::borrow(&recipient.confirmed_address);
                transfer::public_transfer(payment.split(amount, ctx), addr);
            };
            i = i + 1;
        };

        // Last recipient absorbs any rounding dust — no value is ever trapped
        let last_recipient = vector::borrow(&split.recipients, n - 1);
        let last_addr = *option::borrow(&last_recipient.confirmed_address);
        transfer::public_transfer(payment, last_addr);

        event::emit(PaymentDistributedEvent { split_id: object::id(split), amount: total });
    }
