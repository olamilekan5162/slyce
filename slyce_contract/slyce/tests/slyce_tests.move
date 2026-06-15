#[test_only]
module slyce::slyce_tests;

use std::ascii;
use std::option;

use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::test_scenario;

use slyce::slyce;

// ── Test Constants ──────────────────────────────────────────────
const CREATOR: address = @0x1;
const RECIPIENT_1: address = @0x2;
const RECIPIENT_2: address = @0x3;
const RECIPIENT_3: address = @0x4;
const TREASURY: address = @0x5;
const STRANGER: address = @0x6;

// ── Init Tests ──────────────────────────────────────────────────

#[test]
fun test_init_creates_shared_config() {
    let mut scenario = test_scenario::begin(CREATOR);

    // ProtocolConfig should be shared with default values
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let config = test_scenario::take_shared<slyce::ProtocolConfig>(&scenario);
        assert!(slyce::get_fee_bps(&config) == 100, 0); // default 1%
        assert!(slyce::get_treasury(&config) == CREATOR, 1);
        test_scenario::return_shared(config);
    };

    test_scenario::end(scenario);
}

// ── Admin Tests ─────────────────────────────────────────────────

#[test]
fun test_update_fee() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let cap = test_scenario::take_from_sender<slyce::AdminCap>(&scenario);
        let mut config = test_scenario::take_shared<slyce::ProtocolConfig>(&scenario);
        slyce::update_fee(&cap, &mut config, 200); // 2%
        assert!(slyce::get_fee_bps(&config) == 200, 0);
        test_scenario::return_shared(config);
        test_scenario::return_to_sender(&scenario, cap);
    };

    test_scenario::end(scenario);
}

#[test]
#[expected_failure(abort_code = ::slyce::slyce::EFeeTooHigh)]
fun test_update_fee_too_high() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let cap = test_scenario::take_from_sender<slyce::AdminCap>(&scenario);
        let mut config = test_scenario::take_shared<slyce::ProtocolConfig>(&scenario);
        slyce::update_fee(&cap, &mut config, 600); // 6% > MAX 5%
        test_scenario::return_shared(config);
        test_scenario::return_to_sender(&scenario, cap);
    };

    test_scenario::end(scenario);
}

#[test]
fun test_update_treasury() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let cap = test_scenario::take_from_sender<slyce::AdminCap>(&scenario);
        let mut config = test_scenario::take_shared<slyce::ProtocolConfig>(&scenario);
        slyce::update_treasury(&cap, &mut config, TREASURY);
        assert!(slyce::get_treasury(&config) == TREASURY, 0);
        test_scenario::return_shared(config);
        test_scenario::return_to_sender(&scenario, cap);
    };

    test_scenario::end(scenario);
}

// ── Create Split Tests ──────────────────────────────────────────

#[test]
fun test_create_split_success() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Test Split"),
            vector[
                ascii::string(b"r1@email.com"),
                ascii::string(b"r2@email.com"),
            ],
            vector[RECIPIENT_1, RECIPIENT_2],
            vector[5000, 5000],
            vector[vector[], vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    // Verify the split was created as a shared object
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let split = test_scenario::take_shared<slyce::Split>(&scenario);
        assert!(!slyce::is_locked(&split), 0);
        assert!(!slyce::is_cancelled(&split), 1);
        assert!(slyce::confirmed_count(&split) == 0, 2);
        test_scenario::return_shared(split);
    };

    test_scenario::end(scenario);
}

#[test]
#[expected_failure(abort_code = ::slyce::slyce::ENoRecipients)]
fun test_create_split_no_recipients() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Empty Split"),
            vector[], vector[], vector[], vector[],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    test_scenario::end(scenario);
}

#[test]
#[expected_failure(abort_code = ::slyce::slyce::EInvalidShares)]
fun test_create_split_shares_not_100_percent() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Bad Split"),
            vector[ascii::string(b"r1@email.com"), ascii::string(b"r2@email.com")],
            vector[RECIPIENT_1, RECIPIENT_2],
            vector[3000, 3000],
            vector[vector[], vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    test_scenario::end(scenario);
}

// ── Confirm Split Tests ─────────────────────────────────────────

#[test]
fun test_confirm_split_locks_when_all_confirm() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Test Split"),
            vector[ascii::string(b"r1@email.com"), ascii::string(b"r2@email.com")],
            vector[RECIPIENT_1, RECIPIENT_2],
            vector[5000, 5000],
            vector[vector[], vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    // R1 confirms
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut split, 0, vector[], test_scenario::ctx(&mut scenario));
        assert!(!slyce::is_locked(&split), 0);
        assert!(slyce::confirmed_count(&split) == 1, 1);
        test_scenario::return_shared(split);
    };

    // R2 confirms — locks
    test_scenario::next_tx(&mut scenario, RECIPIENT_2);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut split, 1, vector[], test_scenario::ctx(&mut scenario));
        assert!(slyce::is_locked(&split), 0);
        assert!(slyce::confirmed_count(&split) == 2, 1);
        test_scenario::return_shared(split);
    };

    test_scenario::end(scenario);
}

#[test]
#[expected_failure(abort_code = ::slyce::slyce::ENotRecipient)]
fun test_confirm_split_wrong_sender() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Test Split"),
            vector[ascii::string(b"r1@email.com")],
            vector[RECIPIENT_1],
            vector[10000],
            vector[vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    // STRANGER tries to confirm
    test_scenario::next_tx(&mut scenario, STRANGER);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut split, 0, vector[], test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(split);
    };

    test_scenario::end(scenario);
}

// ── Full Flow (Create + Confirm + Distribute) ───────────────────

#[test]
fun test_full_split_flow() {
    let mut scenario = test_scenario::begin(CREATOR);

    // Create split with 3 recipients
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Test Split"),
            vector[
                ascii::string(b"recipient1@email.com"),
                ascii::string(b"recipient2@email.com"),
                ascii::string(b"recipient3@email.com"),
            ],
            vector[RECIPIENT_1, RECIPIENT_2, RECIPIENT_3],
            vector[5000, 3000, 2000],
            vector[vector[], vector[], vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    // R1 confirms
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut split, 0, vector[], test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(split);
    };

    // R2 confirms
    test_scenario::next_tx(&mut scenario, RECIPIENT_2);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut split, 1, vector[], test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(split);
    };

    // R3 confirms — locks
    test_scenario::next_tx(&mut scenario, RECIPIENT_3);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut split, 2, vector[], test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(split);
    };

    // Distribute 1000
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let config = test_scenario::take_shared<slyce::ProtocolConfig>(&scenario);
        let split = test_scenario::take_shared<slyce::Split>(&scenario);
        let payment = coin::mint_for_testing<SUI>(1000, test_scenario::ctx(&mut scenario));
        slyce::split_payment(&config, &split, payment, test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(config);
        test_scenario::return_shared(split);
    };

    // Verify shares: 1000 - 1% = 990, R1=50%=495, R2=30%=297, R3=20%=198
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let c = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        assert!(coin::value(&c) == 495, 0);
        test_scenario::return_to_sender(&scenario, c);
    };
    test_scenario::next_tx(&mut scenario, RECIPIENT_2);
    {
        let c = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        assert!(coin::value(&c) == 297, 0);
        test_scenario::return_to_sender(&scenario, c);
    };
    test_scenario::next_tx(&mut scenario, RECIPIENT_3);
    {
        let c = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        assert!(coin::value(&c) == 198, 0);
        test_scenario::return_to_sender(&scenario, c);
    };

    // Treasury fee: 1% of 1000 = 10
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let c = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        assert!(coin::value(&c) == 10, 0);
        test_scenario::return_to_sender(&scenario, c);
    };

    test_scenario::end(scenario);
}

#[test]
fun test_vault_deposit_and_distribute() {
    let mut scenario = test_scenario::begin(CREATOR);

    // Create split with 1 recipient
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Vault Test"),
            vector[ascii::string(b"r1@email.com")],
            vector[RECIPIENT_1],
            vector[10000],
            vector[vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    // Confirm
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut split, 0, vector[], test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(split);
    };

    // Deposit to vault
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        let payment = coin::mint_for_testing<SUI>(1000, test_scenario::ctx(&mut scenario));
        slyce::deposit_to_vault(&mut split, payment);
        test_scenario::return_shared(split);
    };

    // Distribute from vault
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let config = test_scenario::take_shared<slyce::ProtocolConfig>(&scenario);
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::distribute_vault<SUI>(&config, &mut split, test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(config);
        test_scenario::return_shared(split);
    };

    // R1: 1000 - 1% = 990
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let c = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        assert!(coin::value(&c) == 990, 0);
        test_scenario::return_to_sender(&scenario, c);
    };

    test_scenario::end(scenario);
}

#[test]
fun test_rounding_dust_goes_to_last_recipient() {
    let mut scenario = test_scenario::begin(CREATOR);

    // 33.33%, 33.33%, 33.34%
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Rounding Test"),
            vector[
                ascii::string(b"r1@email.com"),
                ascii::string(b"r2@email.com"),
                ascii::string(b"r3@email.com"),
            ],
            vector[RECIPIENT_1, RECIPIENT_2, RECIPIENT_3],
            vector[3333, 3333, 3334],
            vector[vector[], vector[], vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    // All confirm
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    { let mut s = test_scenario::take_shared<slyce::Split>(&scenario); slyce::confirm_split(&mut s, 0, vector[], test_scenario::ctx(&mut scenario)); test_scenario::return_shared(s); };
    test_scenario::next_tx(&mut scenario, RECIPIENT_2);
    { let mut s = test_scenario::take_shared<slyce::Split>(&scenario); slyce::confirm_split(&mut s, 1, vector[], test_scenario::ctx(&mut scenario)); test_scenario::return_shared(s); };
    test_scenario::next_tx(&mut scenario, RECIPIENT_3);
    { let mut s = test_scenario::take_shared<slyce::Split>(&scenario); slyce::confirm_split(&mut s, 2, vector[], test_scenario::ctx(&mut scenario)); test_scenario::return_shared(s); };

    // Split 100 — after 1% fee = 99
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let config = test_scenario::take_shared<slyce::ProtocolConfig>(&scenario);
        let split = test_scenario::take_shared<slyce::Split>(&scenario);
        let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
        slyce::split_payment(&config, &split, payment, test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(config);
        test_scenario::return_shared(split);
    };

    // 99 * 3333 / 10000 = 32 each for R1,R2. R3 gets remainder: 99-32-32 = 35
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    { let c = test_scenario::take_from_sender<Coin<SUI>>(&scenario); assert!(coin::value(&c) == 32, 0); test_scenario::return_to_sender(&scenario, c); };
    test_scenario::next_tx(&mut scenario, RECIPIENT_2);
    { let c = test_scenario::take_from_sender<Coin<SUI>>(&scenario); assert!(coin::value(&c) == 32, 0); test_scenario::return_to_sender(&scenario, c); };
    test_scenario::next_tx(&mut scenario, RECIPIENT_3);
    { let c = test_scenario::take_from_sender<Coin<SUI>>(&scenario); assert!(coin::value(&c) == 35, 0); test_scenario::return_to_sender(&scenario, c); };

    test_scenario::end(scenario);
}

// ── Error Cases ─────────────────────────────────────────────────

#[test]
#[expected_failure(abort_code = ::slyce::slyce::ENotLocked)]
fun test_split_payment_before_lock_fails() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Test"),
            vector[ascii::string(b"r1@email.com")],
            vector[RECIPIENT_1], vector[10000], vector[vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    // Try to distribute before confirm
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let config = test_scenario::take_shared<slyce::ProtocolConfig>(&scenario);
        let split = test_scenario::take_shared<slyce::Split>(&scenario);
        let payment = coin::mint_for_testing<SUI>(1000, test_scenario::ctx(&mut scenario));
        slyce::split_payment(&config, &split, payment, test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(config);
        test_scenario::return_shared(split);
    };

    test_scenario::end(scenario);
}

#[test]
#[expected_failure(abort_code = ::slyce::slyce::EZeroAmount)]
fun test_split_payment_zero_amount_fails() {
    let mut scenario = test_scenario::begin(CREATOR);

    // Create + confirm
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Test"),
            vector[ascii::string(b"r1@email.com")],
            vector[RECIPIENT_1], vector[10000], vector[vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let mut s = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut s, 0, vector[], test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(s);
    };

    // Distribute 0
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let config = test_scenario::take_shared<slyce::ProtocolConfig>(&scenario);
        let split = test_scenario::take_shared<slyce::Split>(&scenario);
        let payment = coin::mint_for_testing<SUI>(0, test_scenario::ctx(&mut scenario));
        slyce::split_payment(&config, &split, payment, test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(config);
        test_scenario::return_shared(split);
    };

    test_scenario::end(scenario);
}

// ── Cancel Tests ────────────────────────────────────────────────

#[test]
fun test_cancel_split_by_creator() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Cancellable"),
            vector[ascii::string(b"r1@email.com")],
            vector[RECIPIENT_1], vector[10000], vector[vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::cancel_split(&mut split, test_scenario::ctx(&mut scenario));
        assert!(slyce::is_cancelled(&split), 0);
        test_scenario::return_shared(split);
    };

    test_scenario::end(scenario);
}

#[test]
#[expected_failure(abort_code = ::slyce::slyce::ENotCreator)]
fun test_cancel_split_by_non_creator() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Test"),
            vector[ascii::string(b"r1@email.com")],
            vector[RECIPIENT_1], vector[10000], vector[vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::cancel_split(&mut split, test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(split);
    };

    test_scenario::end(scenario);
}

#[test]
#[expected_failure(abort_code = ::slyce::slyce::EAlreadyLocked)]
fun test_cancel_split_when_locked() {
    let mut scenario = test_scenario::begin(CREATOR);

    // Create + confirm (locks)
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Test"),
            vector[ascii::string(b"r1@email.com")],
            vector[RECIPIENT_1], vector[10000], vector[vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let mut s = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut s, 0, vector[], test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(s);
    };

    // Try to cancel locked split
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::cancel_split(&mut split, test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(split);
    };

    test_scenario::end(scenario);
}

// ── Edge Cases ──────────────────────────────────────────────────

#[test]
fun test_single_recipient_split() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Solo"),
            vector[ascii::string(b"only@email.com")],
            vector[RECIPIENT_1], vector[10000], vector[vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    // Confirm — locks immediately
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut split, 0, vector[], test_scenario::ctx(&mut scenario));
        assert!(slyce::is_locked(&split), 0);
        test_scenario::return_shared(split);
    };

    // Distribute
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let config = test_scenario::take_shared<slyce::ProtocolConfig>(&scenario);
        let split = test_scenario::take_shared<slyce::Split>(&scenario);
        let payment = coin::mint_for_testing<SUI>(1000, test_scenario::ctx(&mut scenario));
        slyce::split_payment(&config, &split, payment, test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(config);
        test_scenario::return_shared(split);
    };

    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let c = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        assert!(coin::value(&c) == 990, 0);
        test_scenario::return_to_sender(&scenario, c);
    };

    test_scenario::end(scenario);
}

#[test]
fun test_zero_fee_distribution() {
    let mut scenario = test_scenario::begin(CREATOR);

    // Set fee to 0
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let cap = test_scenario::take_from_sender<slyce::AdminCap>(&scenario);
        let mut config = test_scenario::take_shared<slyce::ProtocolConfig>(&scenario);
        slyce::update_fee(&cap, &mut config, 0);
        test_scenario::return_shared(config);
        test_scenario::return_to_sender(&scenario, cap);
    };

    // Create + confirm
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"No Fee"),
            vector[ascii::string(b"r1@email.com")],
            vector[RECIPIENT_1], vector[10000], vector[vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let mut s = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut s, 0, vector[], test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(s);
    };

    // Distribute 1000 — no fee, recipient gets all
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let config = test_scenario::take_shared<slyce::ProtocolConfig>(&scenario);
        let split = test_scenario::take_shared<slyce::Split>(&scenario);
        let payment = coin::mint_for_testing<SUI>(1000, test_scenario::ctx(&mut scenario));
        slyce::split_payment(&config, &split, payment, test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(config);
        test_scenario::return_shared(split);
    };
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let c = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        assert!(coin::value(&c) == 1000, 0);
        test_scenario::return_to_sender(&scenario, c);
    };

    test_scenario::end(scenario);
}

#[test]
fun test_distribution_type_and_threshold() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Threshold Test"),
            vector[ascii::string(b"r1@email.com"), ascii::string(b"r2@email.com")],
            vector[RECIPIENT_1, RECIPIENT_2],
            vector[5000, 5000],
            vector[vector[], vector[]],
            1, // Threshold
            100, // $100 threshold
            0,
            option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let split = test_scenario::take_shared<slyce::Split>(&scenario);
        assert!(slyce::distribution_type(&split) == 1, 0);
        assert!(slyce::threshold(&split) == 100, 1);
        test_scenario::return_shared(split);
    };

    test_scenario::end(scenario);
}

// ── Already Confirmed ───────────────────────────────────────────

#[test]
#[expected_failure(abort_code = ::slyce::slyce::EAlreadyLocked)]
fun test_confirm_already_locked_fails() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Test"),
            vector[ascii::string(b"r1@email.com")],
            vector[RECIPIENT_1], vector[10000], vector[vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    // Confirm (locks)
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let mut s = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut s, 0, vector[], test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(s);
    };

    // Try to confirm again
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut split, 0, vector[], test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(split);
    };

    test_scenario::end(scenario);
}

#[test]
fun test_update_split_resets_confirmations() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Original"),
            vector[ascii::string(b"r1@email.com"), ascii::string(b"r2@email.com")],
            vector[RECIPIENT_1, RECIPIENT_2],
            vector[5000, 5000],
            vector[vector[], vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    // R1 confirms
    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut split, 0, vector[], test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(split);
    };

    // Creator updates split — resets confirmations
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::update_split(
            &mut split,
            ascii::string(b"Updated"),
            vector[ascii::string(b"r1@email.com")],
            vector[RECIPIENT_1],
            vector[10000],
            vector[vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
        assert!(slyce::confirmed_count(&split) == 0, 0);
        test_scenario::return_shared(split);
    };

    test_scenario::end(scenario);
}

#[test]
fun test_replace_recipient_resets_confirmations() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Test"),
            vector[ascii::string(b"r1@email.com"), ascii::string(b"r2@email.com")],
            vector[RECIPIENT_1, RECIPIENT_2],
            vector[5000, 5000],
            vector[vector[], vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    test_scenario::next_tx(&mut scenario, RECIPIENT_1);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::confirm_split(&mut split, 0, vector[], test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(split);
    };

    // Replace recipient
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::replace_recipient(
            &mut split, 1,
            ascii::string(b"new@email.com"), RECIPIENT_3, vector[],
            test_scenario::ctx(&mut scenario),
        );
        assert!(slyce::confirmed_count(&split) == 0, 0);
        test_scenario::return_shared(split);
    };

    test_scenario::end(scenario);
}

#[test]
#[expected_failure(abort_code = ::slyce::slyce::ESplitCancelled)]
fun test_cancelled_split_rejects_deposit() {
    let mut scenario = test_scenario::begin(CREATOR);

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        slyce::create_split(
            ascii::string(b"Test"),
            vector[ascii::string(b"r1@email.com")],
            vector[RECIPIENT_1], vector[10000], vector[vector[]],
            0, 0, 0, option::none(),
            test_scenario::ctx(&mut scenario),
        );
    };

    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        slyce::cancel_split(&mut split, test_scenario::ctx(&mut scenario));
        test_scenario::return_shared(split);
    };

    // Deposit to cancelled split should abort
    test_scenario::next_tx(&mut scenario, CREATOR);
    {
        let mut split = test_scenario::take_shared<slyce::Split>(&scenario);
        let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
        slyce::deposit_to_vault(&mut split, payment);
        test_scenario::return_shared(split);
    };

    test_scenario::end(scenario);
}