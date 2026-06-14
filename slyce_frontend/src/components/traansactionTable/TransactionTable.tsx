import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../card/Card";
import styles from "./TransactionTable.module.css";
import { ChevronRight } from "lucide-react";
import Pagination from "../pagination/Pagination";
import type { Transaction } from "../../lib/types";

const TransactionTable = ({
  transactions,
  isDashboard = false,
}: {
  transactions: Transaction[];
  isDashboard?: boolean;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / itemsPerPage) || 1;
  const displayedTransactions = isDashboard
    ? transactions
    : transactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      );

  return (
    <Card variant="light" className={styles.tableCard}>
      {isDashboard && (
        <div className={styles.sectionHeader}>
          <h3>Transactions</h3>
          <Link to="/app/transactions" className={styles.seeAllLink}>
            View All <ChevronRight size={14} />
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
      {!isDashboard && (
        <div className={styles.tableHeader}>
          <div>Recipient / Sender</div>
          <div>Category</div>
          <div>Transaction Date</div>
          <div className={styles.headerAmount}>Amount</div>
        </div>
      )}

      <div className={styles.transactionsList}>
        {displayedTransactions.map((transaction: Transaction) => (
          <div
            key={transaction.id}
            className={`${styles.transactionItem} ${
              isDashboard ? styles.dashboardItem : ""
            }`}
          >
            <div className={styles.txLeft}>
              <div className={styles.txAvatar}>
                <img src={transaction.image} alt={transaction.name} />
              </div>

              <div className={styles.txInfo}>
                <div className={styles.txName}>{transaction.name}</div>
              </div>
            </div>

            {isDashboard ? (
              <div className={styles.txRight}>
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
                <div className={styles.txDate}>{transaction.date}</div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        ))}
      </div>

      {!isDashboard && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </Card>
  );
};

export default TransactionTable;
