import { useState } from "react";
import { Plus, ArrowDownToLine } from "lucide-react";
import Card from "../../components/card/Card";
import SplitTable from "../../components/splitTable/SplitTable";
import { transactions } from "../../lib/mockData";
import styles from "./Profile.module.css";
import Button from "../../components/button/Button";
import AddFundsModal from "../../components/addFundsModal/AddFundsModal";
import WithdrawModal from "../../components/withdrawModal/WithdrawModal";

const Profile = () => {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Profile</h1>
      <div className={styles.mainContent}>
        <div className={styles.overview}>
          <Card variant="light" className={styles.balanceCard}>
            <div className={styles.balanceInfo}>
              <span className={styles.cardLabel}>Account Balance</span>
              <span className={styles.balanceAmount}>$384.98</span>
            </div>
            
            <div className={styles.balanceActions}>
              <Button
                variant="primary"
                className={styles.addFundsBtn}
                onClick={() => setIsAddFundsOpen(true)}
              >
                <Plus size={16} />
                <span>Add Funds</span>
              </Button>
              <Button
                variant="ghost"
                className={styles.withdrawBtn}
                onClick={() => setIsWithdrawOpen(true)}
              >
                <ArrowDownToLine size={16} />
                <span>Withdraw</span>
              </Button>
            </div>
          </Card>

          <Card variant="light" className={styles.walletCard}>
            <div className={styles.walletHeader}>
              <span className={styles.cardLabel}>Wallet Address</span>
              <button className={styles.disconnectLink} onClick={() => {}}>
                Disconnect
              </button>
            </div>
            
            <div className={styles.walletAddress}>
              0x123465...098448
            </div>

            <div className={styles.walletFooter}>
              <div className={styles.totalSplitsStack}>
                <span className={styles.cardLabel}>Total Splits</span>
                <span className={styles.splitsCount}>20</span>
              </div>

              <div className={styles.avatarList}>
                <div className={`${styles.avatarCircle} ${styles.avatarOrange}`}>JD</div>
                <div className={`${styles.avatarCircle} ${styles.avatarBlue}`}>MK</div>
                <div className={`${styles.avatarCircle} ${styles.avatarPurple}`}>SL</div>
                <div className={`${styles.avatarCircle} ${styles.avatarGrey}`}>+17</div>
              </div>
            </div>
          </Card>
        </div>
        
        <SplitTable splits={transactions} />
      </div>

      <AddFundsModal
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
      />
    </div>
  );
};

export default Profile;
