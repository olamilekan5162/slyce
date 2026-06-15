import { ChevronRight, DollarSign, Plus } from "lucide-react";
import Card from "../../components/card/Card";
import Button from "../../components/button/Button";
import styles from "./Dashboard.module.css";
import TransactionTable from "../../components/traansactionTable/TransactionTable";
import { transactions } from "../../lib/mockData";
import TokensCard from "../../components/tokensCard/TokensCard";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useBalances } from "../../hooks/useBalances";

const Dashboard = () => {
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const { totalBalance } = useBalances(currentAccount?.address);

  return (
    <div className={styles.dashboard}>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>Overview</h1>
        <Button
          size="md"
          variant="primary"
          className={styles.addSplitBtn}
          onClick={() => navigate("/app/splits/new")}
        >
          <Plus size={16} />
          <span>Add New Split</span>
        </Button>
      </div>

      {/* Overview Section */}
      <div className={styles.overviewGrid}>
        <Card variant="dark" className={styles.statsCard}>
          <div className={styles.cardLabel}>Current Balance</div>
          <div className={styles.balanceAmount}>${totalBalance}</div>
        </Card>

        <Card variant="light" className={styles.statsCard}>
          <div className={styles.statsLabel}>Income</div>
          <div className={styles.statsAmount}>$3,814.25</div>
        </Card>

        <Card variant="light" className={styles.statsCard}>
          <div className={styles.statsLabel}>Withdrawn</div>
          <div className={styles.statsAmount}>$1,700.50</div>
        </Card>
      </div>

      {/* Main Content Row */}
      <div className={styles.mainRow}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          <Card variant="light">
            <div className={styles.sectionHeader}>
              <h3>Recent Split</h3>
              <a href="#" className={styles.seeAllLink}>
                See Details <ChevronRight size={14} />
              </a>
            </div>

            <div className={styles.splitContainer}>
              <Card variant="cream" className={styles.creamCard}>
                <div className={styles.splitIcon}>
                  <DollarSign size={24} color="#3e9b8f" />
                </div>
                <div>
                  <div className={styles.splitTotalLabel}>
                    Total Distributed
                  </div>
                  <div className={styles.splitTotalAmount}>$850</div>
                </div>
              </Card>

              <div className={styles.splitDetailsGrid}>
                <div className={`${styles.detailCol} ${styles.borderDark}`}>
                  <div className={styles.detailLabel}>Creator</div>
                  <div className={styles.detailValue}>0x234...2345</div>
                </div>
                <div className={`${styles.detailCol} ${styles.borderBlue}`}>
                  <div className={styles.detailLabel}>Distribution Type</div>
                  <div className={styles.detailValue}>Manual</div>
                </div>
                <div className={`${styles.detailCol} ${styles.borderGreen}`}>
                  <div className={styles.detailLabel}>Share</div>
                  <div className={styles.detailValue}>40%</div>
                </div>
                <div className={`${styles.detailCol} ${styles.borderOrange}`}>
                  <div className={styles.detailLabel}>Received</div>
                  <div className={styles.detailValue}>$100</div>
                </div>
              </div>
            </div>
          </Card>

          <TransactionTable transactions={transactions} isDashboard={true} />
        </div>

        {/* Right Column */}
        <TokensCard address={currentAccount?.address || ""} />
      </div>
    </div>
  );
};

export default Dashboard;
