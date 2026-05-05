import type { Credential } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import styles from './CredentialCard.module.css';

interface Props {
  credential: Credential;
}

export function CredentialCard({ credential }: Props) {
  const { name, institution, year, logoText, logoColor, logoTextColor, status, txHash, blockNumber, issuedDate, extra } = credential;

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.meta}>
          <div
            className={styles.logo}
            style={{ background: logoColor, color: logoTextColor }}
          >
            {logoText}
          </div>
          <div>
            <div className={styles.name}>{name}</div>
            <div className={styles.inst}>{institution} · {year}</div>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className={styles.hash}>{txHash}</div>
      <div className={styles.date}>
        {extra
          ? `${issuedDate} · ${extra}`
          : blockNumber
            ? `Issued ${issuedDate} · Block #${blockNumber}`
            : issuedDate}
      </div>
    </div>
  );
}