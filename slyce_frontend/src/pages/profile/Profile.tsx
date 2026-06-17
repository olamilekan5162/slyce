import { useState } from "react";
import { Plus, ArrowDownToLine } from "lucide-react";
import Card from "../../components/card/Card";
import SplitTable from "../../components/splitTable/SplitTable";
import styles from "./Profile.module.css";
import Button from "../../components/button/Button";
import AddFundsModal from "../../components/addFundsModal/AddFundsModal";
import WithdrawModal from "../../components/withdrawModal/WithdrawModal";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useBalances } from "../../hooks/useBalances";
import { formatAddress } from "@mysten/sui/utils";
import { useFetchSplits } from "../../hooks/useFetchSplits";
import { useNavigate } from "react-router-dom";
import { dAppKit } from "../../lib/suiClient";
import toast from "react-hot-toast";

const Profile = () => {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const currentAccount = useCurrentAccount();
  const { totalBalance } = useBalances(currentAccount?.address);
  const { splits, loading: splitsLoading } = useFetchSplits(true);
  const navigate = useNavigate();

  const handleDisconnect = async () => {
    await dAppKit.disconnectWallet();
    toast.success("Wallet disconnected successfully");
    navigate("/");
  };

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Profile</h1>
      <div className={styles.mainContent}>
        <div className={styles.overview}>
          <Card variant="light" className={styles.balanceCard}>
            <div className={styles.balanceInfo}>
              <span className={styles.cardLabel}>Account Balance</span>
              <span className={styles.balanceAmount}>${totalBalance}</span>
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
              <button
                className={styles.disconnectLink}
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            </div>

            <div className={styles.walletAddress}>
              {formatAddress(currentAccount?.address || "")}
            </div>

            <div className={styles.walletFooter}>
              <div className={styles.totalSplitsStack}>
                <span className={styles.cardLabel}>Total Splits</span>
                <span className={styles.splitsCount}>
                  {splitsLoading ? "..." : splits?.length}
                </span>
              </div>

              <div className={styles.avatarList}>
                {splitsLoading
                  ? "..."
                  : splits?.slice(0, 3).map((split, index) => (
                      <div
                        key={index}
                        className={`${styles.avatarCircle} ${styles.avatarOrange}`}
                      >
                        {split.name.slice(0, 2).toUpperCase()}
                      </div>
                    ))}

                {splits.length > 3 && (
                  <div
                    className={`${styles.avatarCircle} ${styles.avatarGrey}`}
                  >
                    {splitsLoading ? "..." : `+${splits.length - 3}`}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <SplitTable splits={splits} loading={splitsLoading} />
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
