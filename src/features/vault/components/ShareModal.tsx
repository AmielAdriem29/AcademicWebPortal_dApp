import { useState } from 'react';
import styles from './ShareModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ isOpen, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3 className={styles.title}>Generate Verification Link</h3>

        <div className={styles.row}>
          <span className={styles.label}>Link expires</span>
          <select className={styles.select}>
            <option>After 7 days</option>
            <option>After 30 days</option>
            <option>After 1 view</option>
            <option>Never</option>
          </select>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Max views</span>
          <select className={styles.select}>
            <option>Unlimited</option>
            <option>1 view</option>
            <option>5 views</option>
            <option>10 views</option>
          </select>
        </div>

        <div className={styles.linkBox}>chaincred.io/v/ax7f…3k2p</div>

        <div className={styles.actions}>
          <button className={styles.btnOutline} onClick={onClose}>Cancel</button>
          <button className={styles.btnOutline} onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button className={styles.btnPrimary}>Add to LinkedIn</button>
        </div>
      </div>
    </div>
  );
}