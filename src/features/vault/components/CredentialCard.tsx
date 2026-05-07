import { useState } from 'react';
import type { Credential } from '../../../shared/types/index.ts';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';
import { useCredentials } from '../../credentials/context/useCredentials';
import styles from './CredentialCard.module.css';

interface Props {
  credential: Credential;
}

export function CredentialCard({ credential }: Props) {
  const { updateCredential, deleteCredential } = useCredentials();
  const { id, name, institution, year, logoText, logoColor, logoTextColor, status, txHash, blockNumber, issuedDate, extra } = credential;

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editInstitution, setEditInstitution] = useState(institution);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    await updateCredential(id, { name: editName.trim(), institution: editInstitution.trim() });
    setEditing(false);
  };

  const handleDelete = async () => {
    await deleteCredential(id);
  };

  if (editing) {
    return (
      <div className={styles.card}>
        <div className={styles.editHeader}>
          <span className={styles.editTitle}>Edit credential</span>
          <StatusBadge status={status} />
        </div>
        <input
          className={styles.editInput}
          value={editName}
          onChange={e => setEditName(e.target.value)}
          placeholder="Credential name"
        />
        <input
          className={styles.editInput}
          value={editInstitution}
          onChange={e => setEditInstitution(e.target.value)}
          placeholder="Institution"
        />
        <div className={styles.cardActions}>
          <button className={styles.actionBtn} onClick={() => setEditing(false)}>Cancel</button>
          <button className={styles.btnSave} onClick={handleSave}>Save changes</button>
        </div>
      </div>
    );
  }

  if (confirmDelete) {
    return (
      <div className={`${styles.card} ${styles.deleteCard}`}>
        <div className={styles.deleteIcon}>⚠</div>
        <div className={styles.deleteName}>Delete "{name}"?</div>
        <div className={styles.deleteSub}>This removes the credential from your vault. On-chain records remain unchanged.</div>
        <div className={styles.cardActions}>
          <button className={styles.actionBtn} onClick={() => setConfirmDelete(false)}>Cancel</button>
          <button className={styles.btnDeleteConfirm} onClick={handleDelete}>Delete</button>
        </div>
      </div>
    );
  }

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

      {status !== 'verified' && (
        <div className={styles.cardActions}>
          {status === 'pending' && (
            <button className={styles.actionBtn} onClick={() => setEditing(true)}>Edit</button>
          )}
          <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setConfirmDelete(true)}>Delete</button>
        </div>
      )}
    </div>
  );
}