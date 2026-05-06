import { CREDENTIALS } from '../../../shared/data/mockData';
import { CredentialCard } from '../components/CredentialCard';
import { ShareModal } from '../components/ShareModal';
import { useModal } from '../../../shared/hooks/useModal';
import styles from './VaultPage.module.css';

export function VaultPage() {
  const modal = useModal();

  const verified = CREDENTIALS.filter(c => c.status === 'verified').length;
  const views = 12;

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h2 className={styles.heading}>My Credential Vault</h2>
        <button className={styles.shareBtn} onClick={modal.open}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="4" r="2" />
            <circle cx="4" cy="8" r="2" />
            <circle cx="12" cy="12" r="2" />
            <path d="M6 7l4-2M6 9l4 2" />
          </svg>
          Share Portfolio
        </button>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Total credentials</div>
            <div className={styles.statValue}>{CREDENTIALS.length}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Verified</div>
            <div className={`${styles.statValue} ${styles.green}`}>{verified}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Recent views</div>
            <div className={styles.statValue}>{views}</div>
          </div>
        </div>

        <div className={styles.sectionTitle}>Diplomas &amp; Certificates</div>
        <div className={styles.grid}>
          {CREDENTIALS.map(cred => (
            <CredentialCard key={cred.id} credential={cred} />
          ))}
        </div>
      </div>

      <ShareModal isOpen={modal.isOpen} onClose={modal.close} />
    </div>
  );
}