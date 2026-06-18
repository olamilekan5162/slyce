import { useState } from "react";
import { PlusIcon, MoreHorizontal, Circle, LayoutGrid } from "lucide-react";
import styles from "./Splits.module.css";
import Button from "../../components/button/Button";
import Card from "../../components/card/Card";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/pagination/Pagination";
import { useFetchSplits } from "../../hooks/useFetchSplits";
import LoadingState from "../../components/loadingState/LoadingState";
import EmptyState from "../../components/emptyState/EmptyState";

const Splits = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { splits, loading, error } = useFetchSplits(false);

  const totalPages = Math.ceil(splits.length / itemsPerPage) || 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSplits = splits.slice(startIndex, endIndex);

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

      {loading ? (
        <LoadingState message="Loading your splits..." />
      ) : error ? (
        <EmptyState
          icon={<LayoutGrid size={32} />}
          title="Error loading splits"
          description={error}
        />
      ) : splits.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid size={32} />}
          title="No splits found"
          description="You haven't joined or created any splits yet."
          action={
            <Button
              variant="primary"
              onClick={() => navigate("/app/splits/new")}
            >
              <PlusIcon size={18} style={{ marginRight: 8 }} />
              Create your first split
            </Button>
          }
        />
      ) : (
        <>
          <div className={styles.cardsGrid}>
            {paginatedSplits.map((split) => {
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

          {totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Splits;
