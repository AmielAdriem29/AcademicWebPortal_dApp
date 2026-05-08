import { useCallback, useEffect, useState } from 'react';
import { useCredentials } from '../../credentials/context/useCredentials';
import type { ShareLinkRecord } from '../../../shared/types/index.ts';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';
import { Toggle } from '../../../shared/components/ui/Toggle';
import { loadShareLinks, setShareLinkStatus } from '../../../shared/utils/shareLinks';
import styles from './SharePage.module.css';

function formatWalletAddress(walletAddress: string): string {
  if (walletAddress.length <= 14) return walletAddress;
  return `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`;
}

function formatToken(token: string): string {
  if (!token) return '';
  if (token.length <= 12) return token;
  return `${token.slice(0, 8)}…${token.slice(-4)}`;
}

export function SharePage() {
  const { wallet } = useCredentials();
  const [permissions, setPermissions] = useState<ShareLinkRecord[]>([]);

  const refreshPermissions = useCallback(() => {
    if (!wallet) {
      setPermissions([]);
      return;
    }

    setPermissions(loadShareLinks(wallet));
  }, [wallet]);

  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

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
    const token = id;
    setPermissions(prev => prev.map(p => {
      if (p.token !== token) return p;
      return { ...p, status };
    }));
    setShareLinkStatus(wallet, token, status);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h2 className={styles.heading}>Share Center · Access Control</h2>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.sectionTitle}>Active access permissions</div>

        {!wallet && (
          <p className={styles.hint}>Connect the student wallet to manage public profile access.</p>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Recipient Name</th>
                <th>Share Link</th>
                <th>Token</th>
                <th>Date Granted</th>
                <th>Last Viewed</th>
                <th>Status</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map(p => (
                <tr key={p.token}>
                  <td>
                    <strong className={styles.name}>{p.recipientName}</strong>
                    <span className={styles.company} title={p.walletAddress}>
                      {formatWalletAddress(p.walletAddress)}
                    </span>
                  </td>
                  <td>
                    <span className={styles.link}>{`${window.location.origin}${window.location.pathname}?wallet=${encodeURIComponent(p.walletAddress)}&token=${encodeURIComponent(p.token)}`}</span>
                  </td>
                  <td><span title={p.token}>{formatToken(p.token)}</span></td>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                  <td>{p.lastViewedAt ? new Date(p.lastViewedAt).toLocaleString() : 'Never'}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><Toggle enabled={p.status === 'active'} onChange={val => toggle(p.token, val)} /></td>
                </tr>
              ))}
              {permissions.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>No public-profile links have been created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className={styles.hint}>Revoking access immediately invalidates the public profile link for that recipient.</p>
      </div>
    </div>
  );
}