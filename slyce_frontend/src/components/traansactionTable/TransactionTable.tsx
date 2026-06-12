import { Link } from "react-router-dom";
import Card from "../card/Card";
import styles from "./TransactionTable.module.css";

const TransactionTable = ({ transactions, isDashboard = false }) => {
  return (
    <Card variant="light">
      {isDashboard && (
        <div className={styles.sectionHeader}>
          <h3>Transactions</h3>
          <Link to="/app/transactions" className={styles.seeAllLink}>
            View All ›
          </Link>
        </div>
      )}

      {!isDashboard && (
        <>
          <div className={styles.toolbar}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search transaction"
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <span>Sort by</span>

                <select className={styles.select}>
                  <option>Latest</option>
                  <option>Oldest</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <span>Category</span>

                <select className={styles.select}>
                  <option>All Transactions</option>
                  <option>General</option>
                  <option>Dining Out</option>
                  <option>Groceries</option>
                  <option>Entertainment</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}
      <div className={styles.tableHeader}>
        <div>Recipient / Sender</div>
        <div>Category</div>
        <div>Transaction Date</div>
        <div className={styles.headerAmount}>Amount</div>
      </div>

      <div className={styles.transactionsList}>
        {transactions.map((transaction) => (
          <div key={transaction.id} className={styles.transactionItem}>
            <div className={styles.txLeft}>
              <div className={styles.txAvatar}>
                <img src={transaction.image} alt={transaction.name} />
              </div>

              <div className={styles.txInfo}>
                <div className={styles.txName}>{transaction.name}</div>
              </div>
            </div>

            <div className={styles.txCategory}>{transaction.category}</div>
            <div className={styles.txDate}>{transaction.date}</div>

            <div className={styles.txAmountWrapper}>
              <div
                className={
                  transaction.amount > 0
                    ? styles.txAmountPos
                    : styles.txAmountNeg
                }
              >
                {transaction.amount > 0 ? "+" : "-"}$
                {Math.abs(transaction.amount).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isDashboard && (
        <div className={styles.pagination}>
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
        </div>
      )}
    </Card>
  );
};

export default TransactionTable;
