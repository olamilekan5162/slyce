import { useState } from "react";
import Modal from "../modal/Modal";
import Button from "../button/Button";
import styles from "./AddParticipantModal.module.css";

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddParticipantModal({
  isOpen,
  onClose,
}: AddParticipantModalProps) {
  const [address, setAddress] = useState("");
  const [share, setShare] = useState("");

  const handleFormSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    alert(`Participant added!\nAddress: ${address}\nShare: ${share}%`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Participant">
      <form onSubmit={handleFormSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Wallet Address or Name</label>
          <input
            type="text"
            placeholder="Enter wallet address or name"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={styles.textInput}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Percentage Share</label>
          <div className={styles.shareInputWrapper}>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="0"
              value={share}
              onChange={(e) => setShare(e.target.value)}
              className={styles.shareInput}
              required
            />
            <span className={styles.percentSymbol}>%</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className={styles.cancelBtn}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" className={styles.submitBtn}>
            Add Participant
          </Button>
        </div>
      </form>
    </Modal>
  );
}
