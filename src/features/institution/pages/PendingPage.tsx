import { useState } from 'react';
import { useAuth } from '../../auth/context/useAuth';
import styles from './InstitutionPages.module.css';

interface PendingRow {
  id: string;
  credentialName: string;
  holderName: string;
  holderWallet: string;
  submittedAt: string;
}

// Placeholder — will be replaced with Blockfrost queries in Step 3
const MOCK_PENDING: PendingRow[] = [
  {
    id: '1',
    credentialName: 'Bachelor of Science in Computer Science',
    holderName: 'Pedro Reyes',
    holderWallet: 'addr_test1abc...',
    submittedAt: '2025-05-14',
  },
  {
    id: '2',
    credentialName: 'Certificate in Cybersecurity',
    holderName: 'Ana Gomez',
    holderWallet: 'addr_test1def...',
    submittedAt: '2025-05-15',
  },
];

type ConfirmAction = { row: PendingRow; type: 'approve' | 'reject' } | null;

export function InstitutionPendingPage() {
  const { user } = useAuth();
  const [pending, setPending] = useState<PendingRow[]>(MOCK_PENDING);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const handleConfirm = () => {
    if (!confirmAction) return;
    setPending(prev => prev.filter(r => r.id !== confirmAction.row.id));
    setConfirmAction(null);
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
                pending.map(row => (
                  <tr key={row.id}>
                    <td>{row.credentialName}</td>
                    <td>
                      <span className={styles.holderName}>{row.holderName}</span>
                      <span className={styles.holderWallet}>{row.holderWallet}</span>
                    </td>
                    <td>{row.submittedAt}</td>
                    <td>
                      <div className={styles.pendingActions}>
                        <button
                          className={styles.approveBtn}
                          onClick={() => setConfirmAction({ row, type: 'approve' })}
                        >
                          Approve
                        </button>
                        <button
                          className={styles.rejectBtn}
                          onClick={() => setConfirmAction({ row, type: 'reject' })}
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
              You are about to{' '}
              <strong>{confirmAction.type}</strong>{' '}
              <strong>{confirmAction.row.credentialName}</strong> submitted by{' '}
              <strong>{confirmAction.row.holderName}</strong>.{' '}
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