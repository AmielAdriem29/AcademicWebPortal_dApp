import styles from './SettingsPage.module.css';

interface SettingCardProps {
  title: string;
  description: string;
  actionLabel: string;
}

function SettingCard({ title, description, actionLabel }: SettingCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardDesc}>{description}</div>
      <button className={styles.btn}>{actionLabel}</button>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h2 className={styles.heading}>Settings</h2>
      </div>

      <SettingCard
        title="Identity verification"
        description="Connect a government ID to raise your trust score."
        actionLabel="Connect ID →"
      />
      <SettingCard
        title="Wallet connection"
        description="Link a Web3 wallet to sign transactions directly."
        actionLabel="Connect wallet →"
      />
    </div>
  );
}