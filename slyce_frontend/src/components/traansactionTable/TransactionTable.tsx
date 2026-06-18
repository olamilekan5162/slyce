import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../card/Card";
import styles from "./TransactionTable.module.css";
import {
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Activity as ActivityIcon,
} from "lucide-react";
import Pagination from "../pagination/Pagination";
import type { Activity } from "../../types";
import LoadingState from "../loadingState/LoadingState";
import EmptyState from "../emptyState/EmptyState";

const TransactionTable = ({
  activities,
  isDashboard = false,
  loading = false,
}: {
  activities: Activity[];
  isDashboard?: boolean;
  loading?: boolean;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(activities?.length / itemsPerPage) || 1;
  const displayedActivities = isDashboard
    ? activities
    : activities?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
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
                  <option>Receive</option>
                  <option>Split</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {!isDashboard && (
        <div className={styles.tableHeader}>
          <div>Type</div>
          <div>Category</div>
          <div>Transaction Date</div>
          <div className={styles.headerAmount}>Amount</div>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading activities..." />
      ) : activities?.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          icon={<ActivityIcon size={32} />}
          description="You do not have a valid transaction yet"
        />
      ) : (
        <div className={styles.transactionsList}>
          {displayedActivities?.map((activity: Activity) => (
            <div
              key={activity?.id}
              className={`${styles.transactionItem} ${
                isDashboard ? styles.dashboardItem : ""
              }`}
            >
              <div className={styles.txLeft}>
                <div
                  className={styles.txAvatar}
                  style={{
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {activity?.type === "receive" ? (
                    <ArrowDownLeft size={20} color="#2E7D6E" />
                  ) : (
                    <ArrowUpRight size={20} color="#E07A5F" />
                  )}
                </div>

                <div className={styles.txInfo}>
                  <div className={styles.txName}>{activity?.title}</div>
                </div>
              </div>

              {isDashboard ? (
                <div className={styles.txRight}>
                  <div
                    className={
                      activity?.type === "receive"
                        ? styles.txAmountPos
                        : styles.txAmountNeg
                    }
                  >
                    {activity?.amount}
                  </div>
                  <div className={styles.txDate}>{activity?.time}</div>
                </div>
              ) : (
                <>
                  <div
                    className={styles.txCategory}
                    style={{ textTransform: "capitalize" }}
                  >
                    {activity?.type}
                  </div>
                  <div className={styles.txDate}>{activity?.date}</div>

                  <div className={styles.txAmountWrapper}>
                    <div
                      className={
                        activity?.type === "receive"
                          ? styles.txAmountPos
                          : styles.txAmountNeg
                      }
                    >
                      {activity?.amount}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {!isDashboard && !loading && activities?.length > 0 && (
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
