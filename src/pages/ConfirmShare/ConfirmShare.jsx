import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Globe, Check } from 'lucide-react';
import { confirmationData } from '../../data/dummy';
import styles from './ConfirmShare.module.css';

const ConfirmShare = () => {
  const [confirmed, setConfirmed] = useState(false);
  const data = confirmationData;

  const handleConfirm = () => {
    toast.success("Share confirmed! You'll be notified when payments arrive.");
    setConfirmed(true);
  };

  const handleGoogleSignIn = () => {
    toast.success("Signed in and wallet created");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo}>slyce<span className={styles.dot}></span></div>
          <h1 className={styles.title}>You've been invited to a payment split</h1>
          <p className={styles.subtitle}>
            <strong>{data.inviter}</strong> invited you to <strong>{data.splitName}</strong>
          </p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Split Agreement</h2>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'right' }}>Share</th>
                </tr>
              </thead>
              <tbody>
                {data.participants.map((p, i) => (
                  <tr key={i} className={p.isMe ? styles.myRow : ''}>
                    <td>
                      {p.name}
                      {p.isMe && <span className={styles.youBadge}>You</span>}
                    </td>
                    <td className="text-muted">{p.role}</td>
                    <td style={{ textAlign: 'right' }} className="monospace-numbers bold">
                      {p.share}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.walletSection}>
            <div className={styles.walletInfo}>
              <span className={styles.walletLabel}>Payments will be sent here:</span>
              <span className="monospace-numbers">{data.myAddress}</span>
            </div>
            
            {!data.myAddress && (
              <div className={styles.noWallet}>
                <p>Sign in to create a wallet automatically.</p>
                <button className={`btn-ghost ${styles.googleBtn}`} onClick={handleGoogleSignIn}>
                  <Globe size={16} /> Sign in with Google
                </button>
              </div>
            )}
          </div>

          {confirmed ? (
            <button className={`btn-primary ${styles.confirmBtn} ${styles.confirmedBtn}`} disabled>
              <Check size={20} /> Confirmed
            </button>
          ) : (
            <button className={`btn-primary ${styles.confirmBtn}`} onClick={handleConfirm}>
              Confirm My {data.myShare}% Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmShare;
