import { useCredentials } from '../../credentials/context/useCredentials';
import { useAuth } from '../../auth/context/useAuth';
import { CredentialCard } from '../../vault/components/CredentialCard';
import styles from './PublicProfilePage.module.css';

export function PublicProfilePage() {
  const { credentials } = useCredentials();
  const { user } = useAuth();
  const publicCredentials = credentials.filter(c => c.status === 'verified');

  return (
    <div className={styles.page}>
      <div className={styles.watermark}>RECRUITER VIEW</div>

      <div className={styles.contentArea}>
        <div className={styles.banner}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="6" r="2.5" />
            <path d="M3 13c0-2.5 2.2-4 5-4s5 1.5 5 4" />
          </svg>
          You are viewing your public profile as a recruiter would see it.
        </div>

        <div className={styles.topbar}>
          <h2 className={styles.heading}>{user?.name ?? 'Your Profile'} · Verified Profile</h2>
        </div>

        <div className={styles.grid}>
          {publicCredentials.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>No verified credentials yet.</p>
          ) : (
            publicCredentials.map(cred => (
              <CredentialCard key={cred.id} credential={cred} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}