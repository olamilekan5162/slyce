import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SplitTable from "../../components/SplitTable/SplitTable";
import { useSplits } from "../../hooks/useSplits";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const { splits, loading } = useSplits();
  const account = useCurrentAccount();

  const activeSplits = [];
  const closedSplits = [];
  const recipientSplits = [];
  let totalEarned = 0;

  if (splits && account) {
    splits.forEach(s => {
      const isInitiator = s.initiator === account.address;
      
      const distributionMap = ['Manual', 'Threshold', 'Scheduled', 'Incoming'];
      const statusMap = ['pending', 'live', 'closed'];

      const myRecipientData = s.recipients.find(r => r.address === account.address);
      const myShare = myRecipientData ? myRecipientData.share : 0;
      const myTotalReceived = (s.totalDistributed * myShare) / 100;

      const formattedSplit = {
        ...s,
        recipients: s.recipients.length,
        distribution: distributionMap[s.distributionRule] || 'Unknown',
        status: statusMap[s.status] || 'Unknown',
        myShare: myShare,
        totalReceived: myTotalReceived,
      };

      if (isInitiator) {
        if (s.status === 2) closedSplits.push(formattedSplit);
        else activeSplits.push(formattedSplit);
      } else if (myRecipientData) {
        recipientSplits.push(formattedSplit);
        totalEarned += myTotalReceived;
      }
    });
  }

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
        {loading ? (
          <div className={styles.emptyState}><p>Loading splits...</p></div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
