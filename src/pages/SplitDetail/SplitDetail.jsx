import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Copy, Check, Clock } from 'lucide-react';
import { splitDetail } from '../../data/dummy';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';
import styles from './SplitDetail.module.css';

const SplitDetail = ({ id }) => {
  // Always use the dummy detail regardless of ID for this prototype
  const split = splitDetail;
  
  const [isDistributeOpen, setIsDistributeOpen] = useState(false);
  const [distributeAmount, setDistributeAmount] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(split.splitAddress);
    toast.success("Address copied to clipboard");
  };

  const handleExternalLink = () => {
    toast("Opening Sui Explorer...", { icon: "↗" });
  };

  const handleDistribute = () => {
    if (!distributeAmount || isNaN(distributeAmount) || Number(distributeAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setIsDistributeOpen(false);
    toast.loading("Executing distribution...", { id: 'dist' });
    
    setTimeout(() => {
      toast.success(`$${distributeAmount} distributed to ${split.recipients.length} recipients in one transaction`, { id: 'dist' });
      setDistributeAmount('');
    }, 1500);
  };

  return (
    <div className={`container ${styles.splitDetail}`}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{split.name}</h1>
          <StatusBadge status={split.status === 'live' ? 'Live' : split.status} />
        </div>
        {split.status === 'live' && (
          <button className="btn-primary" onClick={() => setIsDistributeOpen(true)}>
            Distribute Now
          </button>
        )}
      </header>

      <div className={styles.addressRow}>
        <span className={styles.addressLabel}>Split Address</span>
        <div className={styles.addressBox}>
          <span className="monospace-numbers">{split.splitAddress}</span>
          <button className={styles.copyBtn} onClick={handleCopy} aria-label="Copy address">
            <Copy size={16} />
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Recipients</h2>
            <div className={styles.tableCard}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Address</th>
                    <th>Share</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {split.recipients.map((rec, i) => (
                    <tr key={i}>
                      <td>{rec.name}</td>
                      <td className="text-muted">{rec.role}</td>
                      <td className={`monospace-numbers text-muted ${styles.addressCell}`}>{rec.address}</td>
                      <td className="monospace-numbers bold">{rec.share}%</td>
                      <td>
                        {rec.confirmed ? (
                          <span className={styles.statusConfirmed}><Check size={14} /> Confirmed</span>
                        ) : (
                          <div className={styles.statusPending}>
                            <Clock size={14} /> 
                            <button className={styles.reminderBtn}>Send Reminder</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Payment History</h2>
            <div className={styles.tableCard}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Note</th>
                    <th>Status</th>
                    <th>Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {split.history.map((tx, i) => (
                    <tr key={i}>
                      <td>{tx.date}</td>
                      <td className="monospace-numbers">${tx.amount.toFixed(2)}</td>
                      <td>{tx.note}</td>
                      <td>{tx.status}</td>
                      <td>
                        <button className={styles.txLink} onClick={handleExternalLink}>
                          {tx.tx}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.infoCard}>
            <h3>Distribution Rule</h3>
            <p className={styles.ruleType}>
              {split.distribution === 'threshold' ? 'Threshold Auto-Split' : 'Manual'}
            </p>
            {split.distribution === 'threshold' && (
              <p className={styles.ruleDesc}>
                Distributes automatically when balance reaches <strong>${split.thresholdAmount}</strong>
              </p>
            )}
            
            <div className={styles.stats}>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Total Distributed</span>
                <span className={`monospace-numbers ${styles.statValue}`}>${split.totalDistributed.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isDistributeOpen} 
        onClose={() => setIsDistributeOpen(false)}
        title="Distribute Funds"
      >
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label>Amount to distribute (USDC)</label>
            <div className={styles.currencyInput}>
              <span>$</span>
              <input 
                type="number" 
                className="monospace-numbers"
                placeholder="0.00"
                value={distributeAmount}
                onChange={(e) => setDistributeAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className={styles.previewSection}>
            <h4 className={styles.previewTitle}>Distribution Preview</h4>
            <div className={styles.previewList}>
              {split.recipients.map((rec, i) => {
                const amount = distributeAmount ? (Number(distributeAmount) * (rec.share / 100)) : 0;
                return (
                  <div key={i} className={styles.previewItem}>
                    <span>{rec.name.split(' ')[0]} will receive</span>
                    <span className="monospace-numbers text-accent">${amount.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button className={`btn-primary ${styles.confirmBtn}`} onClick={handleDistribute}>
            Confirm Distribution
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SplitDetail;
