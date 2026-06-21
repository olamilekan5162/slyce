/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
import Button from "../../components/button/Button";
import Card from "../../components/card/Card";
import TokensCard from "../../components/tokensCard/TokensCard";
import styles from "./SpltDetails.module.css";
import AddParticipantModal from "../../components/addParticipantModal/AddParticipantModal";
import { useFetchSplitById } from "../../hooks/useFetchSplitById";
import { formatAddress } from "@mysten/sui/utils";
import toast from "react-hot-toast";
import LoadingState from "../../components/loadingState/LoadingState";
import { getDistType } from "../../lib/helpers";
import { useSplits } from "../../hooks/useSplits";

export default function SplitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const { split, loading } = useFetchSplitById(id || "");
  const { distributeVault } = useSplits();

  const progress =
    (split?.confirmedCount || 0) / (split?.recipients.length || 0);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(split?.id || "");
    toast.success("Split address copied to clipboard!");
  };

  const handleDistribute = async (splitId: string) => {
    const toastId = toast.loading("Distributing split...");
    try {
      await distributeVault(splitId);
      toast.success("Split distributed successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message ?? "Distribution failed", { id: toastId });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Split Details</h1>
          <p className={styles.pageSubtitle}>{split?.name}</p>
        </div>

        <div className={styles.headerActions}>
          {!split?.isLocked && (
            <Button
              variant="primary"
              className={styles.editBtn}
              onClick={() => navigate(`/app/splits/${split?.id}/edit`)}
            >
              <span>Edit Split</span>
            </Button>
          )}
          {/* <Button
            variant="primary"
            className={styles.addParticipantBtn}
            onClick={() => setIsAddParticipantOpen(true)}
          >
            <span>Add Participant</span>
          </Button> */}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading split detail.." />
      ) : (
        <div className={styles.detailsGrid}>
          <div className={styles.leftColumn}>
            <TokensCard
              address={id!}
              isSplit={true}
              className={styles.tokensCard}
            />
          </div>

          <div className={styles.rightColumn}>
            <Card variant="light" className={styles.participantsCard}>
              <div className={styles.cardHeader}>
                <h3>Participants</h3>
              </div>

              <div className={styles.collaboratorsList}>
                {split?.recipients.map((c) => (
                  <div
                    key={c.confirmed_address}
                    className={styles.collaboratorRow}
                  >
                    <div className={styles.collabLeft}>
                      <div className={`${styles.avatarCircle}`}>
                        {c.contact?.slice(0, 2)}
                      </div>
                      <div className={styles.collabInfo}>
                        <span className={styles.collabName}>
                          {formatAddress(c.contact)}
                        </span>
                        <span className={styles.collabAddress}>
                          {formatAddress(c.confirmed_address || "")}
                        </span>
                      </div>
                    </div>

                    <div className={styles.collabRight}>
                      <span className={styles.collabShare}>
                        {c.share / 100}% Share
                      </span>
                      <div className={styles.collabStatus}>
                        <span
                          className={`${styles.statusDot} ${
                            c.confirmed
                              ? styles.dotConfirmed
                              : styles.dotPending
                          }`}
                        />
                        <span
                          className={`${styles.statusText} ${
                            c.confirmed
                              ? styles.textConfirmed
                              : styles.textPending
                          }`}
                        >
                          {c.confirmed ? "Confrmed" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="light" className={styles.configCard}>
              <div className={styles.configHeader}>
                <h3>Configuration Setup</h3>
                <span className={styles.confirmedBadge}>
                  {split?.confirmedCount} / {split?.recipients.length} Confirmed
                </span>
              </div>

              {Number(split?.confirmedCount) !==
              Number(split?.recipients.length) ? (
                <p className={styles.configDescription}>
                  Waiting for all participants to confirm the current split
                  ratios before activating.
                </p>
              ) : (
                <p className={styles.configDescription}>
                  All participants have confirmed the current split ratios. You
                  can now distribute the payment.
                </p>
              )}

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              <hr className={styles.divider} />

              <div className={styles.specSection}>
                <h4 className={styles.specTitle}>TECHNICAL SPECIFICATIONS</h4>

                <div className={styles.specRow}>
                  <span className={styles.specLabel}>Split Address</span>
                  <button
                    onClick={handleCopyAddress}
                    className={styles.copyAddressBtn}
                  >
                    <span>{formatAddress(split?.id || "")}</span>
                    <Copy size={14} />
                  </button>
                </div>

                <div className={styles.specRow}>
                  <span className={styles.specLabel}>Creator</span>
                  <span className={styles.specValue}>
                    {formatAddress(split?.creator || "")}
                  </span>
                </div>

                <div className={styles.specRow}>
                  <span className={styles.specLabel}>Distribution Engine</span>
                  <span className={styles.engineBadge}>
                    {getDistType(Number(split?.distributionType))}
                  </span>
                </div>
                <div className={styles.distributeBtn}>
                  {Number(split?.distributionType) === 0 &&
                    Number(split?.confirmedCount) ===
                      Number(split?.recipients.length) && (
                      <Button
                        variant="primary"
                        onClick={() => handleDistribute(split?.id || "")}
                      >
                        Distribute Split
                      </Button>
                    )}
                </div>

                {/* <div className={styles.specRow}>
                <span className={styles.specLabel}>Smart Contract ID</span>
                <span className={styles.specValue}>{data.smartContractId}</span>
              </div> */}
              </div>
            </Card>
          </div>
        </div>
      )}

      <AddParticipantModal
        isOpen={isAddParticipantOpen}
        onClose={() => setIsAddParticipantOpen(false)}
      />
    </div>
  );
}
