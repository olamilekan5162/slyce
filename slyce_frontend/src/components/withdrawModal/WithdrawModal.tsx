import React, { useState, useEffect } from "react";
import Modal from "../modal/Modal";
import Button from "../button/Button";
import styles from "./WithdrawModal.module.css";
import { useBalances } from "../../hooks/useBalances";
import { useWithdraw } from "../../hooks/useWithdraw";
import toast from "react-hot-toast";

interface WithdrawModalProps {
  isOpen: boolean;
  address: string;
  onClose: () => void;
}

interface TokenWithdrawalState {
  symbol: string;
  isSelected: boolean;
  amount: string;
}

export default function WithdrawModal({
  isOpen,
  address,
  onClose,
}: WithdrawModalProps) {
  const { assets } = useBalances(address);
  const { withdraw, pending } = useWithdraw();
  const [destinationAddress, setDestinationAddress] = useState("");
  const [withdrawAll, setWithdrawAll] = useState(false);
  const [withdrawals, setWithdrawals] = useState<TokenWithdrawalState[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadWithdrawals = () => {
      if (cancelled) return;
      setWithdrawals(
        assets.map((asset) => ({
          symbol: asset.symbol,
          isSelected: false,
          amount: "",
        })),
      );
    };
    loadWithdrawals();

    return () => {
      cancelled = true;
    };
  }, [assets]);

  const handleToggleTokenSelection = (symbol: string) => {
    if (withdrawAll) return;
    setWithdrawals(
      withdrawals.map((item) =>
        item.symbol === symbol
          ? { ...item, isSelected: !item.isSelected, amount: "" }
          : item,
      ),
    );
  };

  const handleAmountChange = (symbol: string, val: string) => {
    setWithdrawals(
      withdrawals.map((item) =>
        item.symbol === symbol ? { ...item, amount: val } : item,
      ),
    );
  };

  const handleToggleWithdrawAll = () => {
    const nextWithdrawAll = !withdrawAll;
    setWithdrawAll(nextWithdrawAll);
    if (nextWithdrawAll) {
      setWithdrawals(
        withdrawals.map((item) => {
          const matchedAsset = assets.find((a) => a.symbol === item.symbol);
          return {
            symbol: item.symbol,
            isSelected: true,
            amount: matchedAsset ? matchedAsset.balance.toString() : "",
          };
        }),
      );
    } else {
      setWithdrawals(
        withdrawals.map((item) => ({
          symbol: item.symbol,
          isSelected: false,
          amount: "",
        })),
      );
    }
  };

  const handleFormSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const activeWithdrawals = withdrawals.filter((w) => w.isSelected);
    if (activeWithdrawals.length === 0) {
      toast.error("Please select at least one token to withdraw.");
      return;
    }

    try {
      const batchWithdrawals = activeWithdrawals
        .map((w) => {
          const asset = assets.find((a) => a.symbol === w.symbol);
          if (!asset) return null;

          // Convert the amount to the smallest unit (using the coin's decimals)
          const amountInSmallestUnit = w.amount
            ? BigInt(
                Math.floor(Number(w.amount) * Math.pow(10, asset.decimals)),
              ).toString()
            : "";

          return { coinType: asset.coinType, amount: amountInSmallestUnit };
        })
        .filter(Boolean) as { coinType: string; amount: string }[];

      if (batchWithdrawals.length === 0) return;

      await withdraw(batchWithdrawals, destinationAddress);

      toast.success("Withdrawal completed successfully!");
      onClose();
    } catch (err) {
      console.error("Withdrawal failed:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Withdrawal failed. Please try again.",
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw Funds">
      <form onSubmit={handleFormSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Destination Address</label>
          <input
            type="text"
            placeholder="Enter destination SUI address"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            className={styles.textInput}
            required
          />
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={withdrawAll}
              onChange={handleToggleWithdrawAll}
              className={styles.checkboxInput}
            />
            <span>Withdraw all tokens at once</span>
          </label>
        </div>

        <div className={styles.tokensSection}>
          <span className={styles.label}>Select Assets</span>
          <div className={styles.tokensList}>
            {assets.map((asset) => {
              const withdrawalState = withdrawals.find(
                (w) => w.symbol === asset.symbol,
              ) || { isSelected: false, amount: "" };

              return (
                <div key={asset.symbol} className={styles.tokenRow}>
                  <div className={styles.tokenRowLeft}>
                    <input
                      type="checkbox"
                      checked={withdrawalState.isSelected}
                      onChange={() => handleToggleTokenSelection(asset.symbol)}
                      disabled={withdrawAll}
                      className={styles.checkboxInput}
                    />
                    <div
                      className={`${styles.tokenIconWrapper} ${
                        styles[asset.symbol.toLowerCase()]
                      }`}
                    >
                      <img
                        src={asset.iconUrl}
                        alt={asset.symbol}
                        className={styles.tokenIcon}
                      />
                    </div>
                    <div className={styles.tokenTextStack}>
                      <span className={styles.tokenSymbol}>{asset.symbol}</span>
                      <span className={styles.tokenName}>{asset.name}</span>
                    </div>
                  </div>

                  <div className={styles.tokenRowRight}>
                    <div className={styles.balanceStack}>
                      <span className={styles.tokenAmount}>
                        {asset.balance} {asset.symbol}
                      </span>
                      <span className={styles.tokenValue}>
                        {asset.usdValue}
                      </span>
                    </div>

                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={withdrawalState.amount}
                      onChange={(e) =>
                        handleAmountChange(asset.symbol, e.target.value)
                      }
                      disabled={!withdrawalState.isSelected || withdrawAll}
                      className={styles.amountInput}
                      required={withdrawalState.isSelected}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className={styles.submitBtn}
          disabled={pending}
        >
          {pending ? "Processing..." : "Confirm Withdrawal"}
        </Button>
      </form>
    </Modal>
  );
}
