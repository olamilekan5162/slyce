import Button from "../../components/button/Button";
import Card from "../../components/card/Card";
import { MoreHorizontal, Circle, ChevronRight } from "lucide-react";
import { tokens } from "../../lib/mockData";
import styles from "./SpltDetails.module.css";
const SplitDetails = () => {
  const data = {
    id: "1",
    title: "More details",
    confirmedCollaborators: 3,
    totalCollaborators: 4,
    distributionType: "Manual",
    splitAddress: "0x12345678911767....23234443",
    collaborators: [
      {
        id: "c1",
        name: "James Thompson",
        avatar: "https://i.pravatar.cc/150?img=11",
        percentage: 40,
        status: "Pending",
      },
      {
        id: "c2",
        name: "Pixel Playground",
        avatar: "PP", // initials fallback
        percentage: 30,
        status: "Confirmed",
      },
      {
        id: "c3",
        name: "Rina Sato",
        avatar: "https://i.pravatar.cc/150?img=47",
        percentage: 30,
        status: "Confirmed",
      },
    ],
  };

  const progress = data.confirmedCollaborators / data.totalCollaborators;
  const shortAddress = data.splitAddress;

  return (
    <div className={styles.dashboard}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.pageTitle}>Split Title</h1>
        <Button variant="primary" className={styles.actionBtn}>
          Edit split
        </Button>
      </div>

      <Card className={styles.card}>
        <div className={styles.pieChartContainer}>
          <div className={styles.donutWrapper}>
            <div className={styles.donutInner}>
              <span className={styles.donutAmount}>$338</span>
              <span className={styles.donutChange}>+$975</span>
            </div>
          </div>
        </div>

        <div className={styles.tokensList}>
          <h3>Tokens</h3>

          {tokens.map((token) => (
            <div key={token.id} className={styles.tokenItem}>
              <div className={styles.tokenLeft}>
                <img
                  src={token.iconUrl}
                  alt={token.symbol}
                  className={styles.tokenIcon}
                />
                <div className={styles.tokenInfo}>
                  <div className={styles.tokenSymbol}>{token.symbol}</div>
                  <div className={styles.tokenName}>{token.name}</div>
                </div>
              </div>
              <div className={styles.tokenRight}>
                <div className={styles.tokenFiat}>
                  ${token.fiatValue.toFixed(2)}
                </div>
                <div className={styles.tokenAmount}>
                  {`${token.amount} ${token.symbol}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className={styles.detailsCard}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <Circle size={12} fill="#2E7D6E" stroke="none" />
            <span className={styles.title}>{data.title}</span>
          </div>
          <button
            className={styles.menuBtn}
            onClick={() => {}}
            aria-label="Options"
          >
            <MoreHorizontal size={18} color="#9CA3AF" />
          </button>
        </div>

        {/* Collaborator count */}
        <p className={styles.countLabel}>
          {data.confirmedCollaborators} / {data.totalCollaborators}{" "}
          Collaborators Confirmed
        </p>

        {/* Progress bar */}
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>

        {/* Meta row */}
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Distribution Type</span>
            <span className={styles.metaValue}>{data.distributionType}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Split Address</span>
            <span className={`${styles.metaValue} ${styles.address}`}>
              {shortAddress}
            </span>
          </div>
        </div>

        {/* Collaborators section */}
        <Card variant="cream" className={styles.collaboratorsBox}>
          <div className={styles.collaboratorsHeader}>
            <span className={styles.collaboratorsTitle}>Collaborators</span>
            <button className={styles.seeAllBtn} onClick={() => {}}>
              See All <ChevronRight size={14} />
            </button>
          </div>

          <div className={styles.list}>
            {data.collaborators.map((c, i) => (
              <div
                key={c.id}
                className={`${styles.row} ${
                  i < data.collaborators.length - 1 ? styles.rowBorder : ""
                }`}
              >
                <div className={styles.rowLeft}>
                  <img src={c.avatar} alt={c.name} />
                  <span className={styles.rowName}>{c.name}</span>
                </div>
                <div className={styles.rowRight}>
                  <span className={styles.percentage}>{c.percentage}%</span>
                  <span
                    className={`${styles.status} ${
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
        </Card>
      </Card>
    </div>
  );
};

export default SplitDetails;
