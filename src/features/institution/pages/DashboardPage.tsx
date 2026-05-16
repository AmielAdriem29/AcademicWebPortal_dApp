import { useAuth } from '../../auth/context/useAuth';
import styles from './InstitutionPages.module.css';

// Placeholder — will be wired to Blockfrost in Step 3
export function InstitutionDashboardPage() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Institution Dashboard</h1>
      <p className={styles.sub}>
        Logged in as <strong>{user?.name}</strong>
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Approved Credentials</h2>
        <p className={styles.empty}>
          No approved credentials yet. Approved credentials will appear here once you verify them from the Pending Queue.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Credential Owners</h2>
        <p className={styles.empty}>
          No credential owners yet.
        </p>
      </section>
    </div>
  );
}