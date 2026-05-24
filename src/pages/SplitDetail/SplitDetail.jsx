import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Copy, Check, Clock } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useSplits } from '../../hooks/useSplits';
import { useSplitActions } from '../../hooks/useSplitActions';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';
import styles from './SplitDetail.module.css';

const SplitDetail = () => {
  const { id } = useParams();
  const { splits, loading, refetch } = useSplits();
  const { distribute } = useSplitActions();
  
  const split = splits?.find(s => s.id === id);
  
  const [isDistributeOpen, setIsDistributeOpen] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(split.splitAddress);
    toast.success("Address copied to clipboard");
  };

  const handleExternalLink = () => {
    toast("Opening Sui Explorer...", { icon: "↗" });
  };

  const handleDistribute = async () => {
    if (!split || !split.initiatorCapId) {
      toast.error("You don't have permission to distribute");
      return;
    }

    setIsDistributing(true);
    toast.loading("Executing distribution on-chain...", { id: 'dist' });
    
    try {
      await distribute(split.id, split.initiatorCapId);
      toast.dismiss('dist');
      toast.success(`Funds distributed to ${split.recipients.length} recipients successfully`);
      setIsDistributeOpen(false);
      refetch();
    } catch (error) {
      toast.dismiss('dist');
      toast.error(error.message || "Failed to distribute");
    } finally {
      setIsDistributing(false);
    }
  };

  if (loading) {
    return <div className={`container ${styles.splitDetail}`}>Loading split details...</div>;
  }

  if (!split) {
    return <div className={`container ${styles.splitDetail}`}>Split not found or you don't have access.</div>;
  }

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
        <span className={styles.addressLabel}>Split Object ID</span>
        <div className={styles.addressBox}>
          <span className="monospace-numbers">{split.id}</span>
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
            <h2 className={styles.sectionTitle}>Balance & History</h2>
            <div className={styles.tableCard}>
              <div style={{ padding: '20px' }}>
                <p><strong>Current Balance:</strong> <span className="monospace-numbers">{split.balance} SUI</span></p>
                <p><strong>Total Distributed:</strong> <span className="monospace-numbers">{split.totalDistributed} SUI</span></p>
                <p className="text-muted" style={{marginTop: '10px', fontSize: '0.9rem'}}>Detailed transaction history will be available soon.</p>
              </div>
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
            <p>You are about to distribute the entire current balance of <strong>{split.balance} SUI</strong> to all recipients.</p>
          </div>

          <div className={styles.previewSection}>
            <h4 className={styles.previewTitle}>Distribution Preview</h4>
            <div className={styles.previewList}>
              {split.recipients.map((rec, i) => {
                const amount = split.balance ? (Number(split.balance) * (rec.share / 100)) : 0;
                return (
                  <div key={i} className={styles.previewItem}>
                    <span>{rec.name.split(' ')[0]} will receive</span>
                    <span className="monospace-numbers text-accent">{amount.toFixed(2)} SUI</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            className={`btn-primary ${styles.confirmBtn}`} 
            onClick={handleDistribute}
            disabled={isDistributing || split.balance <= 0}
          >
            {isDistributing ? 'Executing...' : 'Confirm Distribution'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SplitDetail;
