import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/useAuth';
import type { Credential, ShareLinkRecord } from '../../../shared/types';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';
import { findShareLink, markShareLinkViewed } from '../../../shared/utils/shareLinks';
import styles from './PublicProfilePage.module.css';

const VAULT_KEY_PREFIX = 'chaincred_vault_';

function loadVaultCredentials(walletAddress: string): Credential[] {
  try {
    const raw = localStorage.getItem(`${VAULT_KEY_PREFIX}${walletAddress}`);
    return raw ? (JSON.parse(raw) as Credential[]) : [];
  } catch {
    return [];
  }
}

function formatShortWallet(walletAddress: string): string {
  return `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`;
}

export function PublicProfilePage() {
  const { user } = useAuth();
  const [sharedCredentials, setSharedCredentials] = useState<Credential[]>([]);

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const requestedWallet = searchParams.get('wallet') ?? '';
  const requestedToken = searchParams.get('token') ?? '';
  const ownerWallet = user?.walletAddress ?? '';
  const initialShare = requestedWallet && requestedToken ? findShareLink(requestedWallet, requestedToken) : null;
  const [shareRecord, setShareRecord] = useState<ShareLinkRecord | null>(initialShare);
  const shareDenied = Boolean(requestedWallet && requestedToken) && (!shareRecord || shareRecord.status === 'revoked');
  const isSharedView = Boolean(shareRecord && shareRecord.status === 'active');
  const activeWallet = isSharedView ? shareRecord?.walletAddress ?? '' : ownerWallet;

  // Poll for revocations (catches same-tab changes) and listen for storage events (cross-tab)
  useEffect(() => {
    if (!requestedWallet || !requestedToken) return;
    
    // Polling: check status every 500ms to catch revocations in real-time
    const interval = setInterval(() => {
      const latest = findShareLink(requestedWallet, requestedToken);
      setShareRecord(latest);
    }, 500);

    // Storage event listener for cross-tab revocations
    const handler = (e: StorageEvent) => {
      if (e.key === null || e.key.startsWith('chaincred_share_links_')) {
        const latest = findShareLink(requestedWallet, requestedToken);
        setShareRecord(latest);
      }
    };
    window.addEventListener('storage', handler);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handler);
    };
  }, [requestedWallet, requestedToken]);

  useEffect(() => {
    if (!activeWallet) {
      setSharedCredentials([]);
      return;
    }

    let cancelled = false;

    const hydrate = async () => {
      const hydrated = loadVaultCredentials(activeWallet);

      if (!cancelled) {
        setSharedCredentials(hydrated.filter(item => item.status === 'verified'));
        // Only mark viewed if the link is still active
        if (shareRecord && shareRecord.status === 'active') {
          markShareLinkViewed(shareRecord.walletAddress, shareRecord.token);
        }
      }
    };

    hydrate();

    return () => {
      cancelled = true;
    };
  }, [activeWallet, isSharedView, shareRecord]);

  if (shareDenied) {
    return (
      <div className={styles.page}>
        <div className={styles.watermark}>ACCESS DENIED</div>

        <div className={styles.contentArea}>
          <div className={styles.deniedCard}>
            <div className={styles.deniedTitle}>Access Denied</div>
            <p className={styles.deniedText}>
              This public profile link has been revoked or is no longer valid.
            </p>
            <p className={styles.deniedMeta}>
              {requestedWallet && <span>Wallet: {formatShortWallet(requestedWallet)}</span>}
              {requestedToken && <span>Token: {requestedToken.slice(0, 12)}…</span>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const publicCredentials = sharedCredentials;

  return (
    <div className={styles.page}>
      <div className={styles.watermark}>{isSharedView ? 'PUBLIC PROFILE' : 'RECRUITER VIEW'}</div>

      <div className={styles.contentArea}>
        <div className={styles.banner}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="6" r="2.5" />
            <path d="M3 13c0-2.5 2.2-4 5-4s5 1.5 5 4" />
          </svg>
          {isSharedView
            ? `Shared access for ${shareRecord?.recipientName ?? 'your recipient'}.`
            : 'You are viewing your public profile as a recruiter would see it.'}
        </div>

        <div className={styles.topbar}>
          <h2 className={styles.heading}>
            {isSharedView
              ? `${user?.name ?? 'Student'} · Public Profile`
              : `${user?.name ?? 'Your Profile'} · Verified Profile`}
          </h2>
        </div>

        <div className={styles.grid}>
          {publicCredentials.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              {isSharedView ? 'No verified credentials are available for this link.' : 'No verified credentials yet.'}
            </p>
          ) : (
            publicCredentials.map(cred => (
              <article key={cred.id} className={styles.publicCard}>
                <div className={styles.publicCardTop}>
                  <div>
                    <div className={styles.publicName}>{cred.name}</div>
                    <div className={styles.publicInst}>{cred.institution} · {cred.year}</div>
                  </div>
                  <StatusBadge status={cred.status} />
                </div>
                <div className={styles.publicMeta}>{cred.issuedDate}</div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}