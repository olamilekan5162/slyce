import { useState } from "react";
import Card from "../card/Card";
import styles from "./SplitTable.module.css";
import Pagination from "../pagination/Pagination";
import { formatAddress } from "../../lib/helpers";
import LoadingState from "../loadingState/LoadingState";
// import Jazzicon from "react-jazzicon";

const SplitTable = ({
  splits,
  loading = false,
}: {
  splits: any;
  loading?: boolean;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(splits.length / itemsPerPage) || 1;
  const displayedSplits = splits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Card variant="light" className={styles.tableCard}>
      <div className={styles.sectionHeader}>
        <h3>My Splits</h3>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search splits"
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <span>Sort by</span>

            <select className={styles.select}>
              <option>Latest</option>
              <option>Oldest</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.tableHeader}>
        <div>Split Title</div>
        <div>Creator</div>
        <div className={styles.headerAmount}>Distributed</div>
      </div>

      <div className={styles.transactionsList}>
        {loading ? (
          <LoadingState message="Loadng splits..." />
        ) : (
          displayedSplits.map((split: any) => (
            <div key={split.id} className={styles.transactionItem}>
              <div className={styles.txLeft}>
                <div className={styles.txAvatar}>
                  {/* <Jazzicon diameter={22} seed={split.creator} /> */}
                  {/* <img src={split.image} alt={split.name} /> */}
                </div>

                <div className={styles.txInfo}>
                  <div className={styles.txName}>{split.name}</div>
                </div>
              </div>

              <div className={styles.txDate}>
                {formatAddress(split.creator)}
              </div>

              <div className={styles.txAmountWrapper}>
                <div
                  className={
                    split.totalUsd >= 0
                      ? styles.txAmountPos
                      : styles.txAmountNeg
                  }
                >
                  {split.totalUsd >= 0 ? "+" : "-"}$
                  {Math.abs(split.totalUsd).toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </Card>
  );
};

export default SplitTable;
