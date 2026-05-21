import React from 'react';
import styles from './StatusBadge.module.css';

const StatusBadge = ({ status }) => {
  const isLive = status.toLowerCase() === 'live' || status.toLowerCase() === 'all 4 paid';
  const isPending = status.toLowerCase().includes('pending');
  
  return (
    <span className={`${styles.badge} ${isLive ? styles.live : isPending ? styles.pending : styles.default}`}>
      {isLive && '🟢 '}
      {isPending && '🟡 '}
      {status}
    </span>
  );
};

export default StatusBadge;
