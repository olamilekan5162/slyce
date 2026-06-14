import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy } from "lucide-react";
import Button from "../../components/button/Button";
import Card from "../../components/card/Card";
import TokensCard from "../../components/tokensCard/TokensCard";
import { tokens } from "../../lib/mockData";
import styles from "./SpltDetails.module.css";
import AddParticipantModal from "../../components/addParticipantModal/AddParticipantModal";

export default function SplitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);

  const data = {
    id: id || "1",
    title: "Project Alpha Royalties",
    confirmedCollaborators: 3,
    totalCollaborators: 4,
    distributionType: "Automated Trigger",
    splitAddress: "0x7F23...8a9B",
    creatorAddress: "0x234d...2345",
    smartContractId: "sc_lyce_9283f12a",
    collaborators: [
      {
        id: "c1",
        name: "Alex Morgan",
        address: "0x71C5...3B21",
        avatar: "AM",
        percentage: 40,
        status: "Confirmed",
        avatarColor: styles.bgAvatarDark,
      },
      {
        id: "c2",
        name: "Sarah Jenkins",
        address: "0x44A5...9F02",
        avatar: "SJ",
        percentage: 25,
        status: "Confirmed",
        avatarColor: styles.bgAvatarPurple,
      },
      {
        id: "c3",
        name: "David Kim",
        address: "0x99B2...1C44",
        avatar: "DK",
        percentage: 20,
        status: "Confirmed",
        avatarColor: styles.bgAvatarBlue,
      },
      {
        id: "c4",
        name: "Mia Lin",
        address: "0x22D3...8E11",
        avatar: "ML",
        percentage: 15,
        status: "Pending",
        avatarColor: styles.bgAvatarGrey,
      },
    ],
  };

  const progress = data.confirmedCollaborators / data.totalCollaborators;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(data.splitAddress);
    alert("Split address copied to clipboard!");
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Split Details</h1>
          <p className={styles.pageSubtitle}>{data.title}</p>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="ghost"
            className={styles.editBtn}
            onClick={() => navigate(`/app/splits/${data.id}/edit`)}
          >
            <span>Edit Split</span>
          </Button>
          <Button
            variant="primary"
            className={styles.addParticipantBtn}
            onClick={() => setIsAddParticipantOpen(true)}
          >
            <span>Add Participant</span>
          </Button>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.leftColumn}>
          <TokensCard tokens={tokens} className={styles.tokensCard} />
        </div>

        <div className={styles.rightColumn}>
          <Card variant="light" className={styles.participantsCard}>
            <div className={styles.cardHeader}>
              <h3>Participants</h3>
            </div>

            <div className={styles.collaboratorsList}>
              {data.collaborators.map((c) => (
                <div key={c.id} className={styles.collaboratorRow}>
                  <div className={styles.collabLeft}>
                    <div className={`${styles.avatarCircle} ${c.avatarColor}`}>
                      {c.avatar}
                    </div>
                    <div className={styles.collabInfo}>
                      <span className={styles.collabName}>{c.name}</span>
                      <span className={styles.collabAddress}>{c.address}</span>
                    </div>
                  </div>

                  <div className={styles.collabRight}>
                    <span className={styles.collabShare}>
                      {c.percentage}% Share
                    </span>
                    <div className={styles.collabStatus}>
                      <span
                        className={`${styles.statusDot} ${
                          c.status === "Confirmed"
                            ? styles.dotConfirmed
                            : styles.dotPending
                        }`}
                      />
                      <span
                        className={`${styles.statusText} ${
                          c.status === "Confirmed"
                            ? styles.textConfirmed
                            : styles.textPending
                        }`}
                      >
                        {c.status}
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
                {data.confirmedCollaborators} / {data.totalCollaborators}{" "}
                Confirmed
              </span>
            </div>

            <p className={styles.configDescription}>
              Waiting for all participants to confirm the current split ratios
              before activating.
            </p>

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
                  <span>{data.splitAddress}</span>
                  <Copy size={14} />
                </button>
              </div>

              <div className={styles.specRow}>
                <span className={styles.specLabel}>Creator</span>
                <span className={styles.specValue}>{data.creatorAddress}</span>
              </div>

              <div className={styles.specRow}>
                <span className={styles.specLabel}>Distribution Engine</span>
                <span className={styles.engineBadge}>
                  {data.distributionType}
                </span>
              </div>

              <div className={styles.specRow}>
                <span className={styles.specLabel}>Smart Contract ID</span>
                <span className={styles.specValue}>{data.smartContractId}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AddParticipantModal
        isOpen={isAddParticipantOpen}
        onClose={() => setIsAddParticipantOpen(false)}
      />
    </div>
  );
}
