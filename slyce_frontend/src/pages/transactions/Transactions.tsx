import { useEffect, useState } from "react";
import TransactionTable from "../../components/traansactionTable/TransactionTable";
import styles from "./Trasactions.module.css";
import { useCurrentAccount, useCurrentClient } from "@mysten/dapp-kit-react";
import { fetchUserActivity } from "../../lib/helpers";
import type { Activity } from "../../types";

const Transactions = () => {
  const currentAccount = useCurrentAccount();
  const [activityList, setActivityList] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const client = useCurrentClient();

  useEffect(() => {
    if (currentAccount?.address) {
      setLoading(true);
      fetchUserActivity(currentAccount.address, 50).then((data: any) => {
        setActivityList(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [client, currentAccount?.address]);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Transactions</h1>
      <TransactionTable
        activities={activityList}
        isDashboard={false}
        loading={loading}
      />
    </div>
  );
};

export default Transactions;
