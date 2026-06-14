import { useState } from "react";
import Modal from "../modal/Modal";
import Button from "../button/Button";
import { Copy, QrCode } from "lucide-react";
import styles from "./AddFundsModal.module.css";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddFundsModal({ isOpen, onClose }: AddFundsModalProps) {
  const walletAddress = "0x123465098448";
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Funds">
      <div className={styles.container}>
        <div className={styles.qrSection}>
          <div className={styles.qrBox}>
            <QrCode size={120} className={styles.qrIcon} />
          </div>
          <p className={styles.instruction}>
            Scan this QR code to deposit funds directly into your wallet.
          </p>
        </div>

        <div className={styles.walletSection}>
          <span className={styles.label}>Your Deposit Address</span>
          <div className={styles.walletAddressRow}>
            <span className={styles.addressText}>{walletAddress}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={styles.copyBtn}
              onClick={handleCopyAddress}
            >
              {copied ? "Copied!" : <Copy size={14} />}
            </Button>
          </div>
        </div>

        <div className={styles.infoBox}>
          Send only supported tokens (SUI, USDC, BTC) to this address.
        </div>
      </div>
    </Modal>
  );
}
