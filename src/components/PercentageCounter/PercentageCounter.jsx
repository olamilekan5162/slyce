import React from 'react';
import { Check } from 'lucide-react';
import styles from './PercentageCounter.module.css';

const PercentageCounter = ({ total }) => {
  const isExact = total === 100;
  const isOver = total > 100;

  return (
    <div className={styles.counterContainer}>
      <div className={`
        ${styles.counter} 
        ${isExact ? styles.exact : ''} 
        ${isOver ? styles.over : ''}
      `}>
        <span className={styles.label}>Total: </span>
        <span className={styles.value}>{total}% / 100%</span>
        {isExact && <Check size={16} className={styles.icon} />}
      </div>
    </div>
  );
};

export default PercentageCounter;
