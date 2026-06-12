import { Outlet } from "react-router-dom";
import Sidebar from "./components/sidebar/Sidebar";
import styles from "./App.module.css";

function App() {
  return (
    <main className={styles.layout}>
      <Sidebar />

      <section className={styles.content}>
        <Outlet />
      </section>
    </main>
  );
}

export default App;
