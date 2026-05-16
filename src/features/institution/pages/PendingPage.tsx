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

type ConfirmAction = { credential: Credential; type: 'approve' | 'reject' } | null;

export function InstitutionPendingPage() {
  const { user } = useAuth();
  const walletAddress = user?.walletAddress ?? null;
  const [pending, setPending] = useState<Credential[]>([]);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  useEffect(() => {
    if (!walletAddress) return;
    void Promise.resolve().then(() => {
        const all = getAllHolderCredentials();
        setPending(
        all.filter(c => c.institutionWallet === walletAddress && c.status === 'pending')
        );
    });
    }, [walletAddress]);

  const handleConfirm = () => {
    if (!confirmAction || !walletAddress) return;
    const { credential, type } = confirmAction;
    if (!credential.ownerWallet) return;
    updateCredentialStatus(credential.ownerWallet, credential.id, type === 'approve' ? 'verified' : 'rejected');
    setConfirmAction(null);

    // reload pending list
    const all = getAllHolderCredentials();
    setPending(
      all.filter(c => c.institutionWallet === walletAddress && c.status === 'pending')
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.contentArea}>
        <div className={styles.topbar}>
          <h1 className={styles.heading}>Pending Queue</h1>
          <span className={styles.sub}>{user?.name}</span>
        </div>

        <p className={styles.sectionTitle}>Awaiting Review</p>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Credential Name</th>
                <th>Credential Holder</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyCell}>
                    No pending credentials. When holders submit credentials to your institution, they will appear here.
                  </td>
                </tr>
              ) : (
                pending.map(cred => (
                  <tr key={cred.id}>
                    <td>{cred.name}</td>
                    <td>
                      <span className={styles.holderName}>{cred.ownerName ?? '—'}</span>
                      <span className={styles.holderWallet}>{cred.ownerWallet ?? '—'}</span>
                    </td>
                    <td>{cred.issuedDate}</td>
                    <td>
                      <div className={styles.pendingActions}>
                        <button
                          className={styles.approveBtn}
                          onClick={() => setConfirmAction({ credential: cred, type: 'approve' })}
                        >
                          Approve
                        </button>
                        <button
                          className={styles.rejectBtn}
                          onClick={() => setConfirmAction({ credential: cred, type: 'reject' })}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmAction && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>
              {confirmAction.type === 'approve' ? '✓' : '✕'}
            </div>
            <h2 className={styles.modalHeading}>
              {confirmAction.type === 'approve' ? 'Approve Credential?' : 'Reject Credential?'}
            </h2>
            <p className={styles.modalBody}>
              You are about to <strong>{confirmAction.type}</strong>{' '}
              <strong>{confirmAction.credential.name}</strong> submitted by{' '}
              <strong>{confirmAction.credential.ownerName ?? 'this holder'}</strong>.{' '}
              {confirmAction.type === 'approve'
                ? 'This will be recorded on-chain as verified.'
                : 'This action cannot be undone.'}
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmAction(null)}>
                Cancel
              </button>
              <button
                className={confirmAction.type === 'approve' ? styles.confirmApproveBtn : styles.confirmRevokeBtn}
                onClick={handleConfirm}
              >
                {confirmAction.type === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}