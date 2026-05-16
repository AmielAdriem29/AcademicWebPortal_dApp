import { useState } from 'react';
import { useCredentials } from '../../credentials/context/useCredentials';
import { CredentialCard } from '../components/CredentialCard';
import { ShareModal } from '../components/ShareModal';
import { IssuanceModal } from '../components/IssuanceModal';
import { useModal } from '../../../shared/hooks/useModal';
import styles from './VaultPage.module.css';

export function VaultPage() {
  const { credentials, isLoading } = useCredentials();
  const shareModal = useModal();
  const issuanceModal = useModal();
  const [showSharedToast, setShowSharedToast] = useState(false);

  const verified = credentials.filter(c => c.status === 'verified').length;
  const pending  = credentials.filter(c => c.status === 'pending').length;

  const handleShared = () => {
    setShowSharedToast(true);
    setTimeout(() => {
      setShowSharedToast(false);
    }, 4000);
  };

  return (
    <div className={styles.page}>
      {showSharedToast && (
        <div className={styles.toast}>
          Share link copied to clipboard!
        </div>
      )}

      <div className={styles.topbar}>
        <h2 className={styles.heading}>My Credential Vault</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className={styles.issuanceBtn} onClick={issuanceModal.open}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 3v10M3 8h10" strokeLinecap="round"/>
            </svg>
            Issue Credential
          </button>
          <button className={styles.shareBtn} onClick={shareModal.open}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="4" r="2" />
              <circle cx="4" cy="8" r="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 7l4-2M6 9l4 2" />
            </svg>
            Share Portfolio
          </button>
        </div>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Total credentials</div>
            <div className={styles.statValue}>{credentials.length}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Verified</div>
            <div className={`${styles.statValue} ${styles.green}`}>{verified}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Awaiting review</div>
            <div className={styles.statValue} style={{ color: pending > 0 ? 'var(--status-pending-text)' : undefined }}>
              {pending}
            </div>
          </div>
        </div>

        <div className={styles.sectionTitle}>Diplomas &amp; Certificates</div>

        {isLoading ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '16px', padding: '24px 0' }}>Loading credentials…</div>
        ) : credentials.length === 0 ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: '16px', padding: '48px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📂</div>
            <div>No credentials yet. Issue your first one above.</div>
          </div>
        ) : (
          <div className={styles.grid}>
            {credentials.map(cred => (
              <CredentialCard key={cred.id} credential={cred} />
            ))}
          </div>
        )}
      </div>

      <ShareModal
        key={shareModal.isOpen ? 'open' : 'closed'}
        isOpen={shareModal.isOpen}
        onClose={shareModal.close}
        onShared={handleShared}
      />
      <IssuanceModal isOpen={issuanceModal.isOpen} onClose={issuanceModal.close} />
    </div>
  );
}