import { useAuth } from '../../auth/context/useAuth';
import styles from './InstitutionPages.module.css';

// Placeholder — will be wired to Blockfrost in Step 3
export function InstitutionPendingPage() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Pending Queue</h1>
      <p className={styles.sub}>
        Credentials submitted to <strong>{user?.name}</strong> awaiting review.
      </p>

      <section className={styles.section}>
        <p className={styles.empty}>
          No pending credentials. When holders submit credentials to your institution, they will appear here for approval or rejection.
        </p>
      </section>
    </div>
  );
}