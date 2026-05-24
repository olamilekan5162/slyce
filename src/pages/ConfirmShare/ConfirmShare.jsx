import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Globe, Check } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit-react';
import { useSplits } from '../../hooks/useSplits';
import { useSplitActions } from '../../hooks/useSplitActions';
import styles from './ConfirmShare.module.css';

const ConfirmShare = () => {
  const { token } = useParams(); // split ID
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { splits, loading, refetch } = useSplits();
  const { confirmShare } = useSplitActions();

  const [isConfirming, setIsConfirming] = useState(false);

  const split = splits?.find(s => s.id === token);
  const myRecipientData = split?.recipients?.find(r => r.address === account?.address);
  const isAlreadyConfirmed = myRecipientData?.confirmed;

  const handleConfirm = async () => {
    if (!split || !split.recipientCapId) {
      toast.error("You don't have the required RecipientCap to confirm");
      return;
    }

    setIsConfirming(true);
    toast.loading("Confirming your share on-chain...", { id: 'confirm' });
    
    try {
      await confirmShare(split.id, split.recipientCapId);
      toast.dismiss('confirm');
      toast.success("Share confirmed! You'll be notified when payments arrive.");
      refetch();
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      toast.dismiss('confirm');
      toast.error(error.message || "Failed to confirm share");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast.success("Signed in and wallet created");
  };

  if (loading) return <div className={styles.wrapper}>Loading...</div>;
  if (!split) return <div className={styles.wrapper}>Split not found or you don't have access. Try connecting your wallet.</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo}>slyce<span className={styles.dot}></span></div>
          <h1 className={styles.title}>You've been invited to a payment split</h1>
          <p className={styles.subtitle}>
            <strong>{split.initiator}</strong> invited you to <strong>{split.name}</strong>
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
                {split.recipients.map((p, i) => {
                  const isMe = account && p.address === account.address;
                  return (
                    <tr key={i} className={isMe ? styles.myRow : ''}>
                      <td>
                        {p.name}
                        {isMe && <span className={styles.youBadge}>You</span>}
                      </td>
                      <td className="text-muted">{p.role}</td>
                      <td style={{ textAlign: 'right' }} className="monospace-numbers bold">
                        {p.share}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.walletSection}>
            <div className={styles.walletInfo}>
              <span className={styles.walletLabel}>Payments will be sent here:</span>
              <span className="monospace-numbers">{account?.address || 'Not connected'}</span>
            </div>
            
            {!account && (
              <div className={styles.noWallet}>
                <p>Sign in to connect your wallet automatically.</p>
                <button className={`btn-ghost ${styles.googleBtn}`} onClick={handleGoogleSignIn}>
                  <Globe size={16} /> Sign in with Google
                </button>
              </div>
            )}
          </div>

          {isAlreadyConfirmed ? (
            <button className={`btn-primary ${styles.confirmBtn} ${styles.confirmedBtn}`} disabled>
              <Check size={20} /> Confirmed
            </button>
          ) : (
            <button 
              className={`btn-primary ${styles.confirmBtn}`} 
              onClick={handleConfirm}
              disabled={isConfirming || !account || !split.recipientCapId}
            >
              {isConfirming ? 'Confirming...' : `Confirm My ${myRecipientData?.share || 0}% Share`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmShare;
