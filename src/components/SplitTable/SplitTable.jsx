import React from 'react';
import styles from './SplitTable.module.css';
import StatusBadge from '../StatusBadge/StatusBadge';
import { useNavigate } from 'react-router-dom';

const SplitTable = ({ splits, type }) => {
  const navigate = useNavigate();
  if (!splits || splits.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No splits found.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Split Name</th>
            {type === 'active' || type === 'closed' ? (
              <>
                <th>Recipients</th>
                <th>Total Distributed</th>
                <th>Status</th>
                <th>Distribution</th>
                <th>Action</th>
              </>
            ) : (
              <>
                <th>My Share</th>
                <th>Total Received</th>
                <th>Initiator</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {splits.map((split, i) => (
            <tr key={split.id || i} className={styles.row}>
              <td className={styles.nameCell}>{split.name}</td>
              
              {type === 'active' || type === 'closed' ? (
                <>
                  <td className="monospace-numbers">{split.recipients}</td>
                  <td className="monospace-numbers">${split.totalDistributed.toFixed(2)}</td>
                  <td><StatusBadge status={split.status === 'live' ? 'Live' : 'Pending confirmations'} /></td>
                  <td>{split.distribution}</td>
                  <td>
                    <button 
                      className="btn-text"
                      onClick={() => navigate(`/splits/${split.id}`)}
                    >
                      View
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="monospace-numbers bold">{split.myShare}%</td>
                  <td className="monospace-numbers">${split.totalReceived.toFixed(2)}</td>
                  <td>{split.initiator}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SplitTable;
