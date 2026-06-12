import { PlusIcon, MoreHorizontal, Circle } from "lucide-react";
import styles from "./Splits.module.css";
import Button from "../../components/button/Button";
import { savingsPots } from "../../lib/mockData";
import Card from "../../components/card/Card";
import { useNavigate } from "react-router-dom";
const Splits = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.dashboard}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.pageTitle}>Splits</h1>
        <Button variant="primary" className={styles.actionBtn}>
          <PlusIcon />
          Add new split
        </Button>
      </div>

      <div className={styles.cardsGrid}>
        {savingsPots.map((pot) => {
          const progress = pot.confirmedCollaborators / pot.totalCollaborators;

          return (
            <Card
              key={pot.id}
              className={styles.card}
              onClick={() => navigate(`/app/splits/${pot.id}`)}
            >
              <div className={styles.header}>
                <div className={styles.titleRow}>
                  <Circle
                    size={12}
                    fill="#2E7D6E"
                    stroke="none"
                    className={styles.dot}
                  />
                  <span className={styles.title}>{pot.title}</span>
                </div>
                <button className={styles.menuBtn} aria-label="Options">
                  <MoreHorizontal size={18} color="#9CA3AF" />
                </button>
              </div>

              <div className={styles.body}>
                <span className={styles.label}>Total Received</span>
                <span className={styles.amount}>
                  ${pot.totalReceived.toFixed(2)}
                </span>
              </div>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.min(progress * 100, 100)}%` }}
                />
              </div>

              <div className={styles.footer}>
                <span className={styles.confirmed}>
                  {pot.confirmedCollaborators} Collaborator
                  {pot.confirmedCollaborators !== 1 ? "s" : ""} confirmed
                </span>
                <span className={styles.total}>
                  of {pot.totalCollaborators} Collaborator
                  {pot.totalCollaborators !== 1 ? "s" : ""}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Splits;
