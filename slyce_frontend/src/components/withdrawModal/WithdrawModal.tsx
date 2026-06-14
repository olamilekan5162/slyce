import React, { useState } from "react";
import Modal from "../modal/Modal";
import Button from "../button/Button";
import styles from "./WithdrawModal.module.css";
import { tokens } from "../../lib/mockData";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TokenWithdrawalState {
  tokenId: number;
  isSelected: boolean;
  amount: string;
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [destinationAddress, setDestinationAddress] = useState("");
  const [withdrawAll, setWithdrawAll] = useState(false);
  const [withdrawals, setWithdrawals] = useState<TokenWithdrawalState[]>(
    tokens.map((token) => ({
      tokenId: token.id,
      isSelected: false,
      amount: "",
    }))
  );

  const handleToggleTokenSelection = (tokenId: number) => {
    if (withdrawAll) return;
    setWithdrawals(
      withdrawals.map((item) =>
        item.tokenId === tokenId
          ? { ...item, isSelected: !item.isSelected, amount: "" }
          : item
      )
    );
  };

  const handleAmountChange = (tokenId: number, val: string) => {
    setWithdrawals(
      withdrawals.map((item) =>
        item.tokenId === tokenId ? { ...item, amount: val } : item
      )
    );
  };

  const handleToggleWithdrawAll = () => {
    const nextWithdrawAll = !withdrawAll;
    setWithdrawAll(nextWithdrawAll);
    if (nextWithdrawAll) {
      setWithdrawals(
        withdrawals.map((item) => {
          const matchedToken = tokens.find((t) => t.id === item.tokenId);
          return {
            tokenId: item.tokenId,
            isSelected: true,
            amount: matchedToken ? matchedToken.amount.toString() : "",
          };
        })
      );
    } else {
      setWithdrawals(
        withdrawals.map((item) => ({
          tokenId: item.tokenId,
          isSelected: false,
          amount: "",
        }))
      );
    }
  };

  const handleFormSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const activeWithdrawals = withdrawals.filter((w) => w.isSelected);
    if (activeWithdrawals.length === 0) {
      alert("Please select at least one token to withdraw.");
      return;
    }
    const details = activeWithdrawals.map((item) => {
      const token = tokens.find((t) => t.id === item.tokenId);
      return `${item.amount} ${token?.symbol}`;
    });
    alert(
      `Withdrawal initiated!\nDestination: ${destinationAddress}\nAssets: ${details.join(
        ", "
      )}`
    );
    onClose();
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
            {tokens.map((token) => {
              const withdrawalState = withdrawals.find(
                (w) => w.tokenId === token.id
              ) || { isSelected: false, amount: "" };

              return (
                <div key={token.id} className={styles.tokenRow}>
                  <div className={styles.tokenRowLeft}>
                    <input
                      type="checkbox"
                      checked={withdrawalState.isSelected}
                      onChange={() => handleToggleTokenSelection(token.id)}
                      disabled={withdrawAll}
                      className={styles.checkboxInput}
                    />
                    <div
                      className={`${styles.tokenIconWrapper} ${
                        styles[token.symbol.toLowerCase()]
                      }`}
                    >
                      <img
                        src={token.iconUrl}
                        alt={token.symbol}
                        className={styles.tokenIcon}
                      />
                    </div>
                    <div className={styles.tokenTextStack}>
                      <span className={styles.tokenSymbol}>{token.symbol}</span>
                      <span className={styles.tokenName}>{token.name}</span>
                    </div>
                  </div>

                  <div className={styles.tokenRowRight}>
                    <div className={styles.balanceStack}>
                      <span className={styles.tokenAmount}>
                        {token.amount} {token.symbol}
                      </span>
                      <span className={styles.tokenValue}>
                        ${token.fiatValue.toFixed(2)}
                      </span>
                    </div>

                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={withdrawalState.amount}
                      onChange={(e) =>
                        handleAmountChange(token.id, e.target.value)
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

        <Button type="submit" variant="primary" className={styles.submitBtn}>
          Confirm Withdrawal
        </Button>
      </form>
    </Modal>
  );
}
