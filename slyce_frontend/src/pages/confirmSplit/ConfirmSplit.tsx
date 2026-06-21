/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback, useEffect } from "react";
import Button from "../../components/button/Button";
import LoginModal from "../../components/loginModal/LoginModal";
import styles from "./ConfirmSplit.module.css";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useFetchSplitById } from "../../hooks/useFetchSplitById";
import { useSplits } from "../../hooks/useSplits";
import { formatAddress } from "../../lib/helpers";
import LoadingState from "../../components/loadingState/LoadingState";
import toast from "react-hot-toast";
import slycelogo from "../../assets/slyce_logo.svg";

const PASSCODE_LENGTH = 6;

export default function ConfirmSplit() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const urlCode = searchParams.get("code") ?? "";

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState<string[]>(
    Array(PASSCODE_LENGTH).fill(""),
  );
  const [isConfirmed, setIsConfirmed] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const currentAccount = useCurrentAccount();
  const isConnected = !!currentAccount;

  const { split, loading } = useFetchSplitById(id ?? "");
  const { confirmSplit } = useSplits();

  // Auto-fill passcode from URL param on mount
  useEffect(() => {
    const initialize = async () => {
      if (urlCode && urlCode.length === PASSCODE_LENGTH) {
        setPasscode(urlCode.toUpperCase().split(""));
      }
    };
    initialize();
  }, [urlCode]);

  // Find the recipient index for the connected wallet
  const recipientIndex = (() => {
    if (!split) return -1;

    // 1. Try wallet address match (for wallet-type recipients already confirmed)
    if (currentAccount) {
      const idx = split.recipients.findIndex(
        (r: any) =>
          r.confirmed_address?.toLowerCase() ===
            currentAccount.address.toLowerCase() ||
          r.contact?.toLowerCase() === currentAccount.address.toLowerCase(),
      );
      if (idx >= 0) return idx;
    }

    // 2. Fallback: use the idx param from the invite URL (for email-type recipients)
    const urlIdx = searchParams.get("idx");
    if (urlIdx !== null) {
      const parsed = parseInt(urlIdx, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < split.recipients.length) {
        return parsed;
      }
    }

    return -1;
  })();

  // The recipient we're confirming for
  const myRecipient =
    recipientIndex >= 0 ? split?.recipients[recipientIndex] : null;

  const myShare = myRecipient
    ? (Number((myRecipient as any).share) / 100).toFixed(0)
    : "0";
  const confirmedCount = Number(split?.confirmedCount ?? 0);
  const totalCount = split?.recipients.length ?? 0;
  const progress = totalCount > 0 ? confirmedCount / totalCount : 0;

  const handlePasscodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.toUpperCase().slice(0, PASSCODE_LENGTH).split("");
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
    setPasscode((prev) => {
      const next = [...prev];
      next[index] = value.toUpperCase();
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
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\s/g, "")
        .toUpperCase();
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

  const handleConfirm = async () => {
    const code = passcode.join("");
    if (code.length !== PASSCODE_LENGTH) return;
    if (!id || recipientIndex < 0) {
      toast.error(
        "Could not find your collaborator slot in this collaboration.",
      );
      return;
    }

    const toastId = toast.loading("Confirming your participation...");
    try {
      // Convert the raw passcode string to bytes (number[]) — the contract hashes it internally
      const encoder = new TextEncoder();
      const passcodeBytes = Array.from(encoder.encode(code));

      await confirmSplit(id, recipientIndex, passcodeBytes);
      toast.success("Collaboration confirmed successfully!", { id: toastId });
      setIsConfirmed(true);
      setTimeout(() => navigate("/app"), 2000);
    } catch (err: any) {
      toast.error(err.message ?? "Confirmation failed", { id: toastId });
    }
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
            <h2 className={styles.successTitle}>Collaboration Confirmed!</h2>
            <p className={styles.successDesc}>
              You've confirmed your {myShare}% share in{" "}
              <strong>{split?.name}</strong>.
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
          <img
            src={slycelogo}
            width={48}
            alt="Slyce"
            className={styles.brandLogo}
          />
          <span className={styles.brandName}>Slyce</span>
        </div>

        {loading ? (
          <LoadingState message="Loading collaboration details..." />
        ) : !split ? (
          <div className={styles.inviteBody}>
            <p className={styles.inviteSubtext}>
              This collaboration could not be found or has been cancelled.
            </p>
          </div>
        ) : (
          <>
            {/* Invite content */}
            <div className={styles.inviteBody}>
              <div className={styles.inviteText}>
                <h1 className={styles.inviteHeading}>
                  You've been added to a collaboration
                </h1>
                <p className={styles.inviteSubtext}>
                  Review the details below and confirm your participation.
                </p>
              </div>

              {/* Your share — big visual */}
              <div className={styles.shareSection}>
                <span className={styles.shareLabel}>Your share</span>
                <div className={styles.shareCircle}>
                  <span className={styles.sharePercent}>{myShare}%</span>
                </div>
                <span className={styles.shareTitle}>{split.name}</span>
              </div>

              <div className={styles.divider} />

              {/* Participants */}
              <div className={styles.participantsSection}>
                <span className={styles.sectionTitle}>Participants</span>
                <div className={styles.participantRows}>
                  {split.recipients.map((r: any, i: number) => {
                    const isMe =
                      r.confirmed_address?.toLowerCase() ===
                        currentAccount?.address?.toLowerCase() ||
                      r.contact?.toLowerCase() ===
                        currentAccount?.address?.toLowerCase();
                    return (
                      <div key={i} className={styles.participantRow}>
                        <div className={styles.participantLeft}>
                          <div
                            className={`${styles.avatar} ${isMe ? styles.avatarDark : styles.avatarGrey}`}
                          >
                            {(r.contact ?? "?").slice(2, 4).toUpperCase()}
                          </div>
                          <div className={styles.participantInfo}>
                            <span className={styles.participantName}>
                              {formatAddress(r.contact)}
                              {isMe ? " (You)" : ""}
                            </span>
                            <span className={styles.participantAddress}>
                              {formatAddress(r.confirmed_address || r.contact)}
                            </span>
                          </div>
                        </div>
                        <div className={styles.participantMeta}>
                          <span className={styles.participantShare}>
                            {(Number(r.share) / 100).toFixed(0)}%
                          </span>
                          <span
                            className={`${styles.statusBadge} ${
                              r.confirmed
                                ? styles.statusConfirmed
                                : styles.statusPending
                            }`}
                          >
                            {r.confirmed ? "Confirmed" : "Pending"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.progressRow}>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  <span className={styles.progressCount}>
                    {confirmedCount}/{totalCount} confirmed
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
              ) : myRecipient && (myRecipient as any).confirmed ? (
                <div className={styles.connectBlock}>
                  <p className={styles.connectDesc}>
                    You have already confirmed your participation in this
                    collaboration.
                  </p>
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
                        inputMode="text"
                        maxLength={index === 0 ? PASSCODE_LENGTH : 1}
                        value={passcode[index]}
                        onChange={(e) =>
                          handlePasscodeChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className={styles.otpInput}
                        autoFocus={index === 0}
                        aria-label={`Passcode character ${index + 1}`}
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
                    Confirm Collaboration
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
