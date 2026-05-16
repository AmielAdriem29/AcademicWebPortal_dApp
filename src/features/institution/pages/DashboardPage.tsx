import { useState } from 'react';
import { useAuth } from '../../auth/context/useAuth';
import styles from './InstitutionPages.module.css';

interface CredentialRow {
  id: string;
  credentialName: string;
  holderName: string;
  holderWallet: string;
  status: 'verified' | 'revoked';
}

// Placeholder data — will be replaced with Blockfrost queries in Step 3
const MOCK_CREDENTIALS: CredentialRow[] = [
  {
    id: '1',
    credentialName: 'Bachelor of Science in Information Technology',
    holderName: 'Juan dela Cruz',
    holderWallet: 'addr_test1abc...',
    status: 'verified',
  },
  {
    id: '2',
    credentialName: 'Certificate in Web Development',
    holderName: 'Maria Santos',
    holderWallet: 'addr_test1def...',
    status: 'verified',
  },
];

export function InstitutionDashboardPage() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<CredentialRow[]>(MOCK_CREDENTIALS);
  const [revokeTarget, setRevokeTarget] = useState<CredentialRow | null>(null);

  const handleRevokeConfirm = () => {
    if (!revokeTarget) return;
    setCredentials(prev =>
      prev.map(c => c.id === revokeTarget.id ? { ...c, status: 'revoked' } : c)
    );
    setRevokeTarget(null);
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
                    No credentials found.
                    </td>
                </tr>
                ) : (
                credentials.map(row => (
                    <tr key={row.id}>
                    <td>{row.credentialName}</td>
                    <td>
                        <span className={styles.holderName}>{row.holderName}</span>
                        <span className={styles.holderWallet}>{row.holderWallet}</span>
                    </td>
                    <td>
                        <span className={`${styles.badge} ${styles[row.status]}`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                        </span>
                    </td>
                    <td>
                        {row.status !== 'revoked' ? (
                        <button
                            className={styles.revokeBtn}
                            onClick={() => setRevokeTarget(row)}
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
                You are about to revoke <strong>{revokeTarget.credentialName}</strong> issued to{' '}
                <strong>{revokeTarget.holderName}</strong>. This action will be recorded on-chain and cannot be undone.
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