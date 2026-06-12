import Card from "../card/Card";
import styles from "./SplitTable.module.css";
const SplitTable = ({ splits }) => {
  return (
    <Card variant="light">
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
        {splits.map((split) => (
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

      {/* <div className={styles.pagination}>
        <button className={styles.pageBtn}>‹ Prev</button>

        <div className={styles.pageNumbers}>
          <button className={styles.pageNumber}>1</button>
          <button className={`${styles.pageNumber} ${styles.activePage}`}>
            2
          </button>
          <button className={styles.pageNumber}>3</button>
          <button className={styles.pageNumber}>4</button>
          <button className={styles.pageNumber}>5</button>
        </div>

        <button className={styles.pageBtn}>Next ›</button>
      </div> */}
    </Card>
  );
};

export default SplitTable;
