import { useState } from "react";
import Card from "../card/Card";
import styles from "./SplitTable.module.css";
import Pagination from "../pagination/Pagination";
import type { Transaction } from "../../lib/types";

const SplitTable = ({ splits }: { splits: Transaction[] }) => {
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
        <div>Created Date</div>
        <div className={styles.headerAmount}>Distributed</div>
      </div>

      <div className={styles.transactionsList}>
        {displayedSplits.map((split: Transaction) => (
          <div key={split.id} className={styles.transactionItem}>
            <div className={styles.txLeft}>
              <div className={styles.txAvatar}>
                <img src={split.image} alt={split.name} />
              </div>

              <div className={styles.txInfo}>
                <div className={styles.txName}>{split.name}</div>
              </div>
            </div>

            <div className={styles.txDate}>{split.date}</div>

            <div className={styles.txAmountWrapper}>
              <div
                className={
                  split.amount > 0 ? styles.txAmountPos : styles.txAmountNeg
                }
              >
                {split.amount > 0 ? "+" : "-"}$
                {Math.abs(split.amount).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
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
