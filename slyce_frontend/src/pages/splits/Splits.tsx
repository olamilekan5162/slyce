import { useState } from "react";
import { PlusIcon, MoreHorizontal, Circle } from "lucide-react";
import styles from "./Splits.module.css";
import Button from "../../components/button/Button";
import { savingsPots } from "../../lib/mockData";
import Card from "../../components/card/Card";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/pagination/Pagination";
import { useFetchSplits } from "../../hooks/useFetchSplits";

const Splits = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(savingsPots.length / itemsPerPage) || 1;
  const { splits } = useFetchSplits(false);

  console.log("Splits:", splits);

  return (
    <div className={styles.dashboard}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.pageTitle}>Splits</h1>
        <Button
          variant="primary"
          className={styles.actionBtn}
          onClick={() => navigate("/app/splits/new")}
        >
          <PlusIcon />
          Add new split
        </Button>
      </div>

      <div className={styles.cardsGrid}>
        {splits.map((split) => {
          const progress = split.confirmedCount / split.recipients.length;

          return (
            <Card
              key={split.id}
              className={styles.card}
              onClick={() => navigate(`/app/splits/${split.id}`)}
            >
              <div className={styles.header}>
                <div className={styles.titleRow}>
                  <Circle
                    size={12}
                    fill="#2E7D6E"
                    stroke="none"
                    className={styles.dot}
                  />
                  <span className={styles.title}>{split.name}</span>
                </div>
                <button className={styles.menuBtn} aria-label="Options">
                  <MoreHorizontal size={18} color="#9CA3AF" />
                </button>
              </div>

              <div className={styles.body}>
                <span className={styles.label}>Total Received</span>
                <span className={styles.amount}>
                  ${split.totalUsd?.toFixed(2)}
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
                  {split.confirmedCount} Collaborator
                  {split.confirmedCount !== 1 ? "s" : ""} confirmed
                </span>
                <span className={styles.total}>
                  of {split.recipients.length} Collaborator
                  {split.recipients.length !== 1 ? "s" : ""}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className={styles.paginationWrapper}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Splits;
