import { useState, useRef, useCallback } from "react";
import Button from "../../components/button/Button";
import LoginModal from "../../components/loginModal/LoginModal";
import styles from "./ConfirmSplit.module.css";

const PASSCODE_LENGTH = 6;

export default function ConfirmSplit() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [passcode, setPasscode] = useState<string[]>(
    Array(PASSCODE_LENGTH).fill(""),
  );
  const [isConfirmed, setIsConfirmed] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const data = {
    title: "Project Alpha Royalties",
    yourShare: 15,
    confirmed: 3,
    total: 4,
    collaborators: [
      {
        id: "c1",
        name: "Alex Morgan",
        address: "0x71C5...3B21",
        avatar: "AM",
        share: 40,
        status: "Confirmed" as const,
        avatarClass: styles.avatarDark,
      },
      {
        id: "c2",
        name: "Sarah Jenkins",
        address: "0x44A5...9F02",
        avatar: "SJ",
        share: 25,
        status: "Confirmed" as const,
        avatarClass: styles.avatarPurple,
      },
      {
        id: "c3",
        name: "David Kim",
        address: "0x99B2...1C44",
        avatar: "DK",
        share: 20,
        status: "Confirmed" as const,
        avatarClass: styles.avatarBlue,
      },
      {
        id: "c4",
        name: "Mia Lin (You)",
        address: "0x22D3...8E11",
        avatar: "ML",
        share: 15,
        status: "Pending" as const,
        avatarClass: styles.avatarGrey,
      },
    ],
  };

  const progress = data.confirmed / data.total;

  const handleConnect = () => setIsConnected(true);

  const handlePasscodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.slice(0, PASSCODE_LENGTH).split("");
      setPasscode((prev) => {
        const next = [...prev];
        chars.forEach((char, i) => {
          if (i < PASSCODE_LENGTH) next[i] = char;
        });
        return next;
      });
      const targetIndex = Math.min(chars.length, PASSCODE_LENGTH - 1);
      inputRefs.current[targetIndex]?.focus();
      return;
    }
    if (!/^\d*$/.test(value)) return;
    setPasscode((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < PASSCODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !passcode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
      const chars = pasted.slice(0, PASSCODE_LENGTH).split("");
      setPasscode((prev) => {
        const next = [...prev];
        chars.forEach((char, i) => {
          if (i < PASSCODE_LENGTH) next[i] = char;
        });
        return next;
      });
      const targetIndex = Math.min(chars.length, PASSCODE_LENGTH - 1);
      inputRefs.current[targetIndex]?.focus();
    },
    [],
  );

  const handleConfirm = () => {
    const code = passcode.join("");
    if (code.length !== PASSCODE_LENGTH) return;
    setIsConfirmed(true);
  };

  const fullPasscode = passcode.join("");
  const isPasscodeComplete = fullPasscode.length === PASSCODE_LENGTH;

  if (isConfirmed) {
    return (
      <div className={styles.page}>
        <div className={styles.inviteCard}>
          <div className={styles.successBlock}>
            <div className={styles.successIcon}>
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2E7D6E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className={styles.successTitle}>Split Confirmed!</h2>
            <p className={styles.successDesc}>
              You've confirmed your {data.yourShare}% share in{" "}
              <strong>{data.title}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inviteCard}>
        {/* Brand header */}
        <div className={styles.brandHeader}>
          <span className={styles.brandName}>Slyce</span>
        </div>

        {/* Invite content */}
        <div className={styles.inviteBody}>
          <div className={styles.inviteText}>
            <h1 className={styles.inviteHeading}>
              You've been added to a split
            </h1>
            <p className={styles.inviteSubtext}>
              Review the details below and confirm your participation.
            </p>
          </div>

          {/* Your share — big visual */}
          <div className={styles.shareSection}>
            <span className={styles.shareLabel}>Your share</span>
            <div className={styles.shareCircle}>
              <span className={styles.sharePercent}>{data.yourShare}%</span>
            </div>
            <span className={styles.shareTitle}>{data.title}</span>
          </div>

          <div className={styles.divider} />

          {/* Participants */}
          <div className={styles.participantsSection}>
            <span className={styles.sectionTitle}>Participants</span>
            <div className={styles.participantRows}>
              {data.collaborators.map((c) => (
                <div key={c.id} className={styles.participantRow}>
                  <div className={styles.participantLeft}>
                    <div className={`${styles.avatar} ${c.avatarClass}`}>
                      {c.avatar}
                    </div>
                    <div className={styles.participantInfo}>
                      <span className={styles.participantName}>{c.name}</span>
                      <span className={styles.participantAddress}>
                        {c.address}
                      </span>
                    </div>
                  </div>
                  <div className={styles.participantMeta}>
                    <span className={styles.participantShare}>{c.share}%</span>
                    <span
                      className={`${styles.statusBadge} ${
                        c.status === "Confirmed"
                          ? styles.statusConfirmed
                          : styles.statusPending
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.progressRow}>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className={styles.progressCount}>
                {data.confirmed}/{data.total} confirmed
              </span>
            </div>
          </div>
        </div>

        {/* Action area */}
        <div className={styles.actionSection}>
          {!isConnected ? (
            <div className={styles.connectBlock}>
              <p className={styles.connectDesc}>
                Connect your wallet to confirm your participation.
              </p>
              <Button
                variant="primary"
                size="lg"
                className={styles.actionBtn}
                onClick={() => setIsLoginOpen(true)}
              >
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div className={styles.passcodeBlock}>
              <label className={styles.passcodeLabel}>Enter Passcode</label>
              <div className={styles.otpRow}>
                {Array.from({ length: PASSCODE_LENGTH }).map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={index === 0 ? PASSCODE_LENGTH : 1}
                    value={passcode[index]}
                    onChange={(e) =>
                      handlePasscodeChange(index, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={styles.otpInput}
                    autoFocus={index === 0}
                    aria-label={`Passcode digit ${index + 1}`}
                  />
                ))}
              </div>
              <Button
                variant="primary"
                size="lg"
                className={styles.actionBtn}
                onClick={handleConfirm}
                disabled={!isPasscodeComplete}
              >
                Confirm Split
              </Button>
            </div>
          )}
        </div>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onConnect={handleConnect}
      />
    </div>
  );
}
