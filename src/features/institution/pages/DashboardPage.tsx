import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/useAuth';
import type { Credential } from '../../../shared/types';
import styles from './InstitutionPages.module.css';

const VAULT_KEY_PREFIX = 'chaincred_vault_';

function getAllHolderCredentials(): Credential[] {
  const all: Credential[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(VAULT_KEY_PREFIX)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as Credential[];
      if (Array.isArray(parsed)) all.push(...parsed);
    } catch {
      // skip malformed entries
    }
  }
  return all;
}

function updateCredentialStatus(ownerWallet: string, credentialId: string, status: Credential['status']): void {
  const key = `${VAULT_KEY_PREFIX}${ownerWallet}`;
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const credentials = JSON.parse(raw) as Credential[];
    const updated = credentials.map(c => c.id === credentialId ? { ...c, status } : c);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // skip malformed entries
  }
}

export function InstitutionDashboardPage() {
  const { user } = useAuth();
  const walletAddress = user?.walletAddress ?? null;
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [revokeTarget, setRevokeTarget] = useState<Credential | null>(null);

  useEffect(() => {
    if (!walletAddress) return;
    const interval = setInterval(() => {
      void Promise.resolve().then(() => {
        const all = getAllHolderCredentials();
        setCredentials(
          all.filter(c =>
            c.institutionWallet === walletAddress &&
            (c.status === 'verified' || c.status === 'revoked')
          )
        );
      });
    }, 3000);

    // initial load
    void Promise.resolve().then(() => {
      const all = getAllHolderCredentials();
      setCredentials(
        all.filter(c =>
          c.institutionWallet === walletAddress &&
          (c.status === 'verified' || c.status === 'revoked')
        )
      );
    });

    return () => clearInterval(interval);
  }, [walletAddress]);

  const handleRevokeConfirm = () => {
    if (!revokeTarget || !revokeTarget.ownerWallet) return;
    updateCredentialStatus(revokeTarget.ownerWallet, revokeTarget.id, 'revoked');
    setRevokeTarget(null);
    const all = getAllHolderCredentials();
    setCredentials(
      all.filter(c =>
        c.institutionWallet === walletAddress &&
        (c.status === 'verified' || c.status === 'revoked')
      )
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.contentArea}>
        <div className={styles.topbar}>
          <h1 className={styles.heading}>Dashboard</h1>
          <span className={styles.sub}>{user?.name}</span>
        </div>

        <p className={styles.sectionTitle}>Issued Credentials</p>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Credential Name</th>
                <th>Credential Holder</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {credentials.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyCell}>
                    No verified or revoked credentials yet.
                  </td>
                </tr>
              ) : (
                credentials.map(cred => (
                  <tr key={cred.id}>
                    <td>{cred.name}</td>
                    <td>
                      <span className={styles.holderName}>{cred.ownerName ?? '—'}</span>
                      <span className={styles.holderWallet}>{cred.ownerWallet ?? '—'}</span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles[cred.status]}`}>
                        {cred.status.charAt(0).toUpperCase() + cred.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {cred.status !== 'revoked' ? (
                        <button
                          className={styles.revokeBtn}
                          onClick={() => setRevokeTarget(cred)}
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className={styles.revokedLabel}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {revokeTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>⚠</div>
            <h2 className={styles.modalHeading}>Revoke Credential?</h2>
            <p className={styles.modalBody}>
              You are about to revoke <strong>{revokeTarget.name}</strong> issued to{' '}
              <strong>{revokeTarget.ownerName ?? 'this holder'}</strong>. This action will be recorded on-chain and cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setRevokeTarget(null)}>
                Cancel
              </button>
              <button className={styles.confirmRevokeBtn} onClick={handleRevokeConfirm}>
                Yes, Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}