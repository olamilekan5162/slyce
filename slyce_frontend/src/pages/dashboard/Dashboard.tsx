import { ChevronRight, DollarSign, Plus } from "lucide-react";
import Card from "../../components/card/Card";
import Button from "../../components/button/Button";
import styles from "./Dashboard.module.css";
import TransactionTable from "../../components/traansactionTable/TransactionTable";
import TokensCard from "../../components/tokensCard/TokensCard";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useBalances } from "../../hooks/useBalances";
import { useFetchSplits } from "../../hooks/useFetchSplits";
import { useFetchTransactions } from "../../hooks/useFetchTransactions";
import { formatAddress, getDistType } from "../../lib/helpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const { totalBalance } = useBalances(currentAccount?.address);
  const { splits } = useFetchSplits(false);
  const { transactions: activityList, totalIncome, loading: loadingActivities } =
    useFetchTransactions();
  const lastSplit = splits?.at(-1);

  const share = lastSplit?.recipients.find((recipient) =>
    recipient?.contact
      ?.toLocaleLowerCase()
      .includes(currentAccount?.address?.toLocaleLowerCase() ?? ""),
  );

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
          <span>Start a Collaboration</span>
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
          <div className={styles.statsAmount}>
            ${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
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
              <h3>Recent Collaboration</h3>
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
                    Total Paid Out
                  </div>
                  <div className={styles.splitTotalAmount}>
                    ${lastSplit?.totalUsd || 0}
                  </div>
                </div>
              </Card>

              <div className={styles.splitDetailsGrid}>
                <div className={`${styles.detailCol} ${styles.borderDark}`}>
                  <div className={styles.detailLabel}>Creator</div>
                  <div className={styles.detailValue}>
                    {formatAddress(lastSplit?.creator || "") || 0x00}
                  </div>
                </div>
                <div className={`${styles.detailCol} ${styles.borderBlue}`}>
                  <div className={styles.detailLabel}>Payout Type</div>
                  <div className={styles.detailValue}>
                    {getDistType(Number(lastSplit?.distributionType))}
                  </div>
                </div>
                <div className={`${styles.detailCol} ${styles.borderGreen}`}>
                  <div className={styles.detailLabel}>Share</div>
                  <div className={styles.detailValue}>
                    {(share?.share ?? 0) / 100 || 0}%
                  </div>
                </div>
                <div className={`${styles.detailCol} ${styles.borderOrange}`}>
                  <div className={styles.detailLabel}>Received</div>
                  <div className={styles.detailValue}>
                    $
                    {(
                      (lastSplit?.totalUsd || 0) *
                      ((share?.share ?? 0) / 10000 || 1)
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <TransactionTable
            activities={activityList}
            isDashboard={true}
            loading={loadingActivities}
          />
        </div>

        {/* Right Column */}
        <TokensCard address={currentAccount?.address || ""} />
      </div>
    </div>
  );
};

export default Dashboard;
