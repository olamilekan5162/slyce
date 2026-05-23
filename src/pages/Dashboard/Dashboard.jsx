import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SplitTable from "../../components/SplitTable/SplitTable";
import { mySplits, recipientSplits } from "../../data/dummy";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");

  const activeSplits = mySplits.filter((s) => s.status !== "closed");
  const closedSplits = mySplits.filter((s) => s.status === "closed");

  const totalEarned = recipientSplits.reduce(
    (acc, curr) => acc + curr.totalReceived,
    0,
  );

  return (
    <div className={`container ${styles.dashboard}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Splits</h1>
        <button className="btn-primary" onClick={() => navigate("/splits/new")}>
          <Plus size={20} />
          New Split
        </button>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "active" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active
        </button>
        <button
          className={`${styles.tab} ${activeTab === "closed" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("closed")}
        >
          Closed
        </button>
        <button
          className={`${styles.tab} ${activeTab === "recipient" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("recipient")}
        >
          I'm a Recipient
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "active" && (
          <SplitTable splits={activeSplits} type="active" />
        )}
        {activeTab === "closed" && (
          <SplitTable splits={closedSplits} type="closed" />
        )}
        {activeTab === "recipient" && (
          <>
            <SplitTable splits={recipientSplits} type="recipient" />
            <div className={styles.summaryLine}>
              Total earned via Slyce:{" "}
              <span className="monospace-numbers">
                ${totalEarned.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
