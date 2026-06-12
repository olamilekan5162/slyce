import TransactionTable from "../../components/traansactionTable/TransactionTable";
import { transactions } from "../../lib/mockData";
import styles from "./Trasactions.module.css";
const Transactions = () => {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Trasactions</h1>
      <TransactionTable transactions={transactions} isDashboard={false} />
    </div>
  );
};

export default Transactions;
