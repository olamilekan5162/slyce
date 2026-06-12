import { ReceiptText, Send } from "lucide-react";
import Card from "../../components/card/Card";
import SplitTable from "../../components/splitTable/SplitTable";
import { transactions } from "../../lib/mockData";
import styles from "./Profile.module.css";
import Button from "../../components/button/Button";
const Profile = () => {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Profile</h1>
      <div className={styles.mainContent}>
        <div className={styles.overview}>
          <Card variant="dark" className={styles.statsCard}>
            <ReceiptText size={32} />
            <div className={styles.withdraw}>
              <div>
                <div className={styles.cardLabel}>Account Balance</div>
                <div className={styles.balanceAmount}>$4,836.00</div>
              </div>
              <Button variant={"secondary"}>
                <Send size={20} />
                Withdraw
              </Button>
            </div>
          </Card>

          <Card variant="light" className={styles.statsCard}>
            <div className={styles.statsLabel}>Summary</div>
            <div className={styles.statRow}>
              <h3>Account</h3>
              <p>0x123465...098448</p>
            </div>
            <div className={styles.statRow}>
              <h3>Total Split</h3>
              <p>20</p>
            </div>
          </Card>
        </div>
        <SplitTable splits={transactions} />
      </div>
    </div>
  );
};

export default Profile;
