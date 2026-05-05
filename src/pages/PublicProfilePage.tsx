import { PUBLIC_CREDENTIALS } from '../data/mockData';
import { CredentialCard } from '../components/vault/CredentialCard';
import styles from './PublicProfilePage.module.css';

export function PublicProfilePage() {
  return (
    <div className={styles.page}>
      <div className={styles.watermark}>RECRUITER VIEW</div>

      <div className={styles.banner}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="6" r="2.5" />
          <path d="M3 13c0-2.5 2.2-4 5-4s5 1.5 5 4" />
        </svg>
        You are viewing your public profile as a recruiter would see it.
      </div>

      <div className={styles.topbar}>
        <h2 className={styles.heading}>Alex Reyes · Verified Profile</h2>
      </div>

      <div className={styles.grid}>
        {PUBLIC_CREDENTIALS.map(cred => (
          <CredentialCard key={cred.id} credential={cred} />
        ))}
      </div>
    </div>
  );
}