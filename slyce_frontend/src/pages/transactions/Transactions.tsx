import TransactionTable from "../../components/traansactionTable/TransactionTable";
import styles from "./Trasactions.module.css";
import { useFetchTransactions } from "../../hooks/useFetchTransactions";

const Transactions = () => {
  const { transactions, loading } = useFetchTransactions();

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Transactions</h1>
      <TransactionTable
        activities={transactions}
        isDashboard={false}
        loading={loading}
      />
    </div>
  );
};

export default Transactions;
