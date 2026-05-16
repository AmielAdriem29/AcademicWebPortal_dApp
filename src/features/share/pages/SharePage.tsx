import { useCallback, useEffect, useState } from 'react';
import { useCredentials } from '../../credentials/context/useCredentials';
import type { ShareLinkRecord } from '../../../shared/types/index.ts';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';
import { Toggle } from '../../../shared/components/ui/Toggle';
import { loadShareLinks, setShareLinkStatus, createShareUrl } from '../../../shared/utils/shareLinks';
import styles from './SharePage.module.css';

function formatWalletAddress(walletAddress: string): string {
  if (walletAddress.length <= 14) return walletAddress;
  return `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`;
}

export function SharePage() {
  const { wallet } = useCredentials();
  const [permissions, setPermissions] = useState<ShareLinkRecord[]>([]);
  const [toast, setToast] = useState('');

  const refreshPermissions = useCallback(() => {
    if (!wallet) {
      setPermissions([]);
      return;
    }
    setPermissions(loadShareLinks(wallet));
  }, [wallet]);

  useEffect(() => {
    if (!wallet) {
      void Promise.resolve().then(() => setPermissions([]));
      return;
    }
    void Promise.resolve().then(() => setPermissions(loadShareLinks(wallet)));
  }, [wallet]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!wallet) return;
      if (event.key === null || event.key.startsWith('chaincred_share_links_')) {
        void Promise.resolve().then(() => setPermissions(loadShareLinks(wallet)));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [wallet]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!wallet) return;
      if (event.key === null || event.key.startsWith('chaincred_share_links_')) {
        refreshPermissions();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [wallet, refreshPermissions]);

  const toggle = (id: string, val: boolean) => {
    if (!wallet) return;
    const status = val ? 'active' : 'revoked';
    setPermissions(prev => prev.map(p => p.token !== id ? p : { ...p, status }));
    setShareLinkStatus(wallet, id, status);
  };

  const handleCopy = async (p: ShareLinkRecord) => {
    if (!wallet) return;
    const url = createShareUrl(wallet, p.token);
    await navigator.clipboard.writeText(url);
    setToast('Link copied! You can manage access anytime from the Share Center.');
    setTimeout(() => setToast(''), 3500);
  };

  return (
    <div className={styles.page}>
      {toast && (
        <div className={styles.toast}>
          <span>{toast}</span>
          <button className={styles.toastClose} onClick={() => setToast('')}>✕</button>
        </div>
      )}

      <div className={styles.topbar}>
        <h2 className={styles.heading}>Share Center</h2>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.sectionTitle}>Active access permissions</div>

        {!wallet && (
          <p className={styles.hint}>Connect your wallet to manage public profile access.</p>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Date Granted</th>
                <th>Status</th>
                <th>Access</th>
                <th>Copy Link</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map(p => (
                <tr key={p.token}>
                  <td>
                    <strong className={styles.name}>{p.recipientName}</strong>
                    <span className={styles.wallet} title={p.walletAddress}>
                      {formatWalletAddress(p.walletAddress)}
                    </span>
                  </td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><Toggle enabled={p.status === 'active'} onChange={val => toggle(p.token, val)} /></td>
                  <td>
                    <button className={styles.copyBtn} onClick={() => handleCopy(p)}>
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
              {permissions.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    No share links created yet. Use "Share Portfolio" to generate one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className={styles.hint}>Revoking access immediately invalidates the link for that recipient.</p>
      </div>
    </div>
  );
}