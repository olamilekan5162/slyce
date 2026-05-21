import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { UserPlus, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RecipientRow from '../../components/RecipientRow/RecipientRow';
import PercentageCounter from '../../components/PercentageCounter/PercentageCounter';
import styles from './CreateSplit.module.css';

const CreateSplit = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [details, setDetails] = useState({
    name: '',
    description: '',
    distribution: 'manual',
    threshold: '',
    schedule: 'weekly'
  });

  const [recipients, setRecipients] = useState([
    { name: '', role: '', contact: '', percentage: 0 },
    { name: '', role: '', contact: '', percentage: 0 }
  ]);

  const [confirmed, setConfirmed] = useState(false);

  // Computed
  const totalPercentage = recipients.reduce((acc, curr) => acc + (curr.percentage || 0), 0);

  // Handlers
  const handleDetailsChange = (field, value) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep1 = () => {
    if (!details.name.trim()) {
      toast.error('Split name is required');
      return;
    }
    setStep(2);
  };

  const updateRecipient = (index, field, value) => {
    const newRecipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  };

  const addRecipient = () => {
    setRecipients([...recipients, { name: '', role: '', contact: '', percentage: 0 }]);
  };

  const removeRecipient = (index) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  };

  const handleNextStep2 = () => {
    if (totalPercentage !== 100) {
      toast.error('Percentages must add up to exactly 100%');
      return;
    }
    setStep(3);
  };

  const handleCreate = () => {
    if (!confirmed) {
      toast.error('Please confirm the agreement');
      return;
    }
    
    setIsSubmitting(true);
    toast.loading("Creating your split on-chain...", { id: 'create-toast' });
    
    setTimeout(() => {
      toast.dismiss('create-toast');
      toast.success("Split created! Invitations sent to all recipients.");
      // Navigate to a dummy detail view
      navigate('/splits/split-001');
    }, 2000);
  };

  return (
    <div className={`container ${styles.createSplit}`}>
      <div className={styles.wizardContainer}>
        <div className={styles.stepIndicator}>
          Step {step} of 3
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h1 className={styles.title}>Split Details</h1>
            
            <div className={styles.formGroup}>
              <label>Split Name</label>
              <input 
                type="text" 
                placeholder="e.g. Kilometre — Single (2026)" 
                value={details.name}
                onChange={(e) => handleDetailsChange('name', e.target.value)}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Description (optional)</label>
              <textarea 
                placeholder="Brief context for your collaborators" 
                rows={3}
                value={details.description}
                onChange={(e) => handleDetailsChange('description', e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Distribution Method</label>
              <div className={styles.radioGroup}>
                <label className={`${styles.radioCard} ${details.distribution === 'manual' ? styles.radioSelected : ''}`}>
                  <input 
                    type="radio" 
                    name="distribution" 
                    value="manual"
                    checked={details.distribution === 'manual'}
                    onChange={(e) => handleDetailsChange('distribution', e.target.value)}
                  />
                  <div className={styles.radioContent}>
                    <strong>Manual</strong>
                    <p>You trigger each distribution yourself</p>
                  </div>
                </label>
                
                <label className={`${styles.radioCard} ${details.distribution === 'threshold' ? styles.radioSelected : ''}`}>
                  <input 
                    type="radio" 
                    name="distribution" 
                    value="threshold"
                    checked={details.distribution === 'threshold'}
                    onChange={(e) => handleDetailsChange('distribution', e.target.value)}
                  />
                  <div className={styles.radioContent}>
                    <strong>Threshold</strong>
                    <p>Auto-distribute when balance hits a set amount</p>
                  </div>
                </label>
                
                {details.distribution === 'threshold' && (
                  <div className={styles.nestedInput}>
                    <label>Distribute when balance reaches</label>
                    <div className={styles.currencyInput}>
                      <span className={styles.currencyPrefix}>$</span>
                      <input 
                        type="number" 
                        className="monospace-numbers"
                        value={details.threshold}
                        onChange={(e) => handleDetailsChange('threshold', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <label className={`${styles.radioCard} ${details.distribution === 'scheduled' ? styles.radioSelected : ''}`}>
                  <input 
                    type="radio" 
                    name="distribution" 
                    value="scheduled"
                    checked={details.distribution === 'scheduled'}
                    onChange={(e) => handleDetailsChange('distribution', e.target.value)}
                  />
                  <div className={styles.radioContent}>
                    <strong>Scheduled</strong>
                    <p>Auto-distribute on a set interval</p>
                  </div>
                </label>

                {details.distribution === 'scheduled' && (
                  <div className={styles.nestedInput}>
                    <select 
                      value={details.schedule}
                      onChange={(e) => handleDetailsChange('schedule', e.target.value)}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom Date</option>
                    </select>
                  </div>
                )}

                <label className={`${styles.radioCard} ${details.distribution === 'incoming' ? styles.radioSelected : ''}`}>
                  <input 
                    type="radio" 
                    name="distribution" 
                    value="incoming"
                    checked={details.distribution === 'incoming'}
                    onChange={(e) => handleDetailsChange('distribution', e.target.value)}
                  />
                  <div className={styles.radioContent}>
                    <strong>Incoming address</strong>
                    <p>A dedicated address is generated; any payment to it triggers instant split</p>
                  </div>
                </label>
              </div>
            </div>

            <div className={styles.actions}>
              <button className="btn-ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
              <button className="btn-primary" onClick={handleNextStep1}>
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <h1 className={styles.title}>Who gets paid?</h1>
            
            <div className={styles.recipientsList}>
              {recipients.map((rec, i) => (
                <RecipientRow 
                  key={i}
                  index={i}
                  recipient={rec}
                  canRemove={recipients.length > 2}
                  updateRecipient={updateRecipient}
                  removeRecipient={removeRecipient}
                />
              ))}
            </div>

            <button className={`btn-ghost ${styles.addBtn}`} onClick={addRecipient}>
              <UserPlus size={16} /> Add Recipient
            </button>

            <PercentageCounter total={totalPercentage} />

            <div className={styles.actions}>
              <button className="btn-ghost" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Back
              </button>
              <button 
                className="btn-primary" 
                onClick={handleNextStep2}
                disabled={totalPercentage !== 100}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h1 className={styles.title}>Review & Create</h1>
            
            <div className={styles.summaryCard}>
              <div className={styles.summarySection}>
                <h3>{details.name}</h3>
                {details.description && <p className={styles.summaryDesc}>{details.description}</p>}
                
                <div className={styles.summaryMeta}>
                  <span className={styles.metaLabel}>Distribution: </span>
                  <span className={styles.metaValue}>
                    {details.distribution === 'threshold' 
                      ? `Threshold ($${details.threshold || 0})` 
                      : details.distribution === 'scheduled'
                      ? `Scheduled (${details.schedule})`
                      : details.distribution === 'incoming'
                      ? 'Incoming address'
                      : 'Manual'}
                  </span>
                </div>
              </div>

              <div className={styles.summarySection}>
                <table className={styles.reviewTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Contact</th>
                      <th style={{ textAlign: 'right' }}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.map((rec, i) => (
                      <tr key={i}>
                        <td>{rec.name || '-'}</td>
                        <td>{rec.role || '-'}</td>
                        <td>{rec.contact || '-'}</td>
                        <td style={{ textAlign: 'right' }} className="monospace-numbers bold">{rec.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span className={styles.checkboxText}>
                I confirm this agreement is accurate. Once all recipients confirm, it cannot be changed.
              </span>
            </label>

            <div className={styles.actions}>
              <button className="btn-ghost" onClick={() => setStep(2)} disabled={isSubmitting}>
                <ArrowLeft size={16} /> Back
              </button>
              <button 
                className={`btn-primary ${styles.submitBtn}`} 
                onClick={handleCreate}
                disabled={isSubmitting || !confirmed}
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Creating...</>
                ) : (
                  'Send for Confirmation'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSplit;
