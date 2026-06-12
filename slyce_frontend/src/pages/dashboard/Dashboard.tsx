import { DollarSign } from "lucide-react";
import Card from "../../components/card/Card";
import styles from "./Dashboard.module.css";
import TransactionTable from "../../components/traansactionTable/TransactionTable";
import { tokens, transactions } from "../../lib/mockData";

const Dashboard = () => {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Overview</h1>

      {/* Overview Section */}
      <div className={styles.overviewGrid}>
        <Card variant="dark" className={styles.statsCard}>
          <div className={styles.cardLabel}>Current Balance</div>
          <div className={styles.balanceAmount}>$4,836.00</div>
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
                See Details ›
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
        <Card className={styles.rightColumn}>
          <div className={styles.pieChartContainer}>
            <div className={styles.donutWrapper}>
              <div className={styles.donutInner}>
                <span className={styles.donutAmount}>$338</span>
                <span className={styles.donutChange}>+$975</span>
              </div>
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <h3>Tokens</h3>
          </div>

          <div className={styles.tokensList}>
            {tokens.map((token) => (
              <div key={token.id} className={styles.tokenItem}>
                <div className={styles.tokenLeft}>
                  <img
                    src={token.iconUrl}
                    alt={token.symbol}
                    className={styles.tokenIcon}
                  />
                  <div className={styles.tokenInfo}>
                    <div className={styles.tokenSymbol}>{token.symbol}</div>
                    <div className={styles.tokenName}>{token.name}</div>
                  </div>
                </div>
                <div className={styles.tokenRight}>
                  <div className={styles.tokenFiat}>
                    ${token.fiatValue.toFixed(2)}
                  </div>
                  <div className={styles.tokenAmount}>
                    {`${token.amount} ${token.symbol}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
