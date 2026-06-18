import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Button from "../../components/button/Button";
import LoginModal from "../../components/loginModal/LoginModal";
import styles from "./ConfirmSplit.module.css";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useFetchSplitById } from "../../hooks/useFetchSplitById";
import { useSplits } from "../../hooks/useSplits";
import toast from "react-hot-toast";

const PASSCODE_LENGTH = 6;

export default function ConfirmSplit() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const urlCode = searchParams.get("code");
  const navigate = useNavigate();

  const currentAccount = useCurrentAccount();
  const { split, loading: splitLoading } = useFetchSplitById(id || "");
  const { confirmSplit } = useSplits();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [passcode, setPasscode] = useState<string[]>(
    Array(PASSCODE_LENGTH).fill(""),
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Pre-fill passcode if provided in URL
  useEffect(() => {
    if (urlCode && urlCode.length === PASSCODE_LENGTH) {
      setPasscode(urlCode.split(""));
    }
  }, [urlCode]);

  const { total, confirmed, collaborators, yourShare, recipientIndex } = useMemo(() => {
    if (!split) {
      return { total: 0, confirmed: 0, collaborators: [], yourShare: 0, recipientIndex: -1 };
    }

    let userShare = 0;
    let rIndex = -1;
    const collabs = split.recipients.map((r: any, index: number) => {
      const isYou = r.contact === currentAccount?.address;
      if (isYou) {
        userShare = Number(r.share) / 100; // Convert basis points to % if stored as 1500 -> 15%
        rIndex = index;
      }
      return {
        id: index.toString(),
        name: isYou ? "You" : r.contact.slice(0, 6) + "..." + r.contact.slice(-4),
        address: r.contact,
        avatar: isYou ? "U" : r.contact.slice(2, 4).toUpperCase(),
        share: Number(r.share) / 100,
        status: r.has_confirmed ? "Confirmed" : "Pending",
        avatarClass: isYou ? styles.avatarPurple : styles.avatarGrey,
      };
    });

    const confCount = collabs.filter((c) => c.status === "Confirmed").length;
    
    // Check if user is already confirmed
    if (rIndex !== -1 && collabs[rIndex].status === "Confirmed") {
      setIsConfirmed(true);
    }

    return {
      total: collabs.length,
      confirmed: confCount,
      collaborators: collabs,
      yourShare: userShare,
      recipientIndex: rIndex,
    };
  }, [split, currentAccount]);

  const progress = total > 0 ? confirmed / total : 0;
  const isConnected = !!currentAccount;

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
    if (value && !/^[A-Za-z0-9]*$/.test(value)) return;
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
      const pasted = e.clipboardData.getData("text").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
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
    if (recipientIndex === -1) {
      toast.error("Your connected wallet is not a recipient of this split.");
      return;
    }
    
    setIsConfirming(true);
    const toastId = toast.loading("Confirming your participation...");
    
    try {
      const passcodeArray = Array.from(new TextEncoder().encode(code));
      await confirmSplit(split.id, recipientIndex, passcodeArray);
      toast.success("Successfully confirmed split!", { id: toastId });
      setIsConfirmed(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to confirm split.", { id: toastId });
    } finally {
      setIsConfirming(false);
    }
  };

  const fullPasscode = passcode.join("");
  const isPasscodeComplete = fullPasscode.length === PASSCODE_LENGTH;

  if (splitLoading) {
    return (
      <div className={styles.page}>
        <p>Loading split details...</p>
      </div>
    );
  }

  if (!split) {
    return (
      <div className={styles.page}>
        <p>Split not found.</p>
      </div>
    );
  }

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
              You've confirmed your {yourShare}% share in{" "}
              <strong>{split.name}</strong>.
            </p>
            <Button
              variant="primary"
              size="lg"
              className={styles.actionBtn}
              onClick={() => navigate(`/app/splits/${split.id}`)}
              style={{ marginTop: 24 }}
            >
              View Split Dashboard
            </Button>
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
              <span className={styles.sharePercent}>{yourShare}%</span>
            </div>
            <span className={styles.shareTitle}>{split.name}</span>
          </div>

          <div className={styles.divider} />

          {/* Participants */}
          <div className={styles.participantsSection}>
            <span className={styles.sectionTitle}>Participants</span>
            <div className={styles.participantRows}>
              {collaborators.map((c: any) => (
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
                {confirmed}/{total} confirmed
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
                    inputMode="text"
                    maxLength={index === 0 ? PASSCODE_LENGTH : 1}
                    value={passcode[index]}
                    onChange={(e) =>
                      handlePasscodeChange(index, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={styles.otpInput}
                    autoFocus={index === 0 && !isPasscodeComplete}
                    aria-label={`Passcode character ${index + 1}`}
                  />
                ))}
              </div>
              <Button
                variant="primary"
                size="lg"
                className={styles.actionBtn}
                onClick={handleConfirm}
                disabled={!isPasscodeComplete || isConfirming || recipientIndex === -1}
              >
                {isConfirming ? "Confirming..." : "Confirm Split"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
