import React from 'react';
import { Trash2 } from 'lucide-react';
import styles from './RecipientRow.module.css';

const RecipientRow = ({ index, recipient, canRemove, updateRecipient, removeRecipient }) => {
  return (
    <div className={styles.row}>
      <div className={styles.fieldGroup}>
        <input 
          type="text" 
          placeholder="Name" 
          value={recipient.name}
          onChange={(e) => updateRecipient(index, 'name', e.target.value)}
        />
      </div>
      <div className={styles.fieldGroup}>
        <input 
          type="text" 
          placeholder="e.g. Producer, Designer" 
          value={recipient.role}
          onChange={(e) => updateRecipient(index, 'role', e.target.value)}
        />
      </div>
      <div className={styles.fieldGroupLarge}>
        <input 
          type="text" 
          placeholder="email@domain.com or 0x..." 
          value={recipient.contact}
          onChange={(e) => updateRecipient(index, 'contact', e.target.value)}
        />
      </div>
      <div className={styles.fieldGroupSmall}>
        <div className={styles.inputWithSuffix}>
          <input 
            type="number" 
            placeholder="0" 
            value={recipient.percentage === 0 ? '' : recipient.percentage}
            onChange={(e) => updateRecipient(index, 'percentage', parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
            className="monospace-numbers"
          />
          <span className={styles.suffix}>%</span>
        </div>
      </div>
      
      <div className={styles.actionGroup}>
        {canRemove && (
          <button 
            type="button"
            className={styles.removeBtn} 
            onClick={() => removeRecipient(index)}
            aria-label="Remove recipient"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default RecipientRow;
