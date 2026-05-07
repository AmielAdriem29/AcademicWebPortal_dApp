import { useState } from 'react';
import type { AccessPermission } from '../../../shared/types/index.ts';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';
import { Toggle } from '../../../shared/components/ui/Toggle';
import styles from './SharePage.module.css';

export function SharePage() {
  const [permissions, setPermissions] = useState<AccessPermission[]>([]);

  const toggle = (id: string, val: boolean) => {
    setPermissions(prev => prev.map(p => p.id === id ? { ...p, enabled: val } : p));
  };

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h2 className={styles.heading}>Share Center · Access Control</h2>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.sectionTitle}>Active access permissions</div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Recruiter / Company</th>
                <th>Date Granted</th>
                <th>Last Viewed</th>
                <th>Status</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map(p => (
                <tr key={p.id}>
                  <td>
                    <strong className={styles.name}>{p.name}</strong>
                    <span className={styles.company}>{p.company}</span>
                  </td>
                  <td>{p.dateGranted}</td>
                  <td>{p.lastViewed}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><Toggle enabled={p.enabled} onChange={val => toggle(p.id, val)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={styles.hint}>Revoking access immediately invalidates the verification link sent to that recruiter.</p>
      </div>
    </div>
  );
}