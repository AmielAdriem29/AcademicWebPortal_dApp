import { useState, useRef, useCallback } from 'react';
import { useCredentials } from '../../credentials/context/useCredentials';
import type { Credential } from '../../../shared/types';
import styles from './IssuanceModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'form' | 'hashing' | 'done';

async function sha256File(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateId(): string {
  return `cred_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function IssuanceModal({ isOpen, onClose }: Props) {
  const { addCredential } = useCredentials();

  const [step, setStep] = useState<Step>('form');
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (f: File) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(f.type)) {
      setError('Only PDF, PNG, JPG, or WebP files are accepted.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File must be under 50 MB.');
      return;
    }
    setError('');
    setFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) acceptFile(f);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
  };

  const handleSubmit = async () => {
    if (!file || !name.trim() || !institution.trim() || !issueDate) {
      setError('Please fill in all fields and upload a file.');
      return;
    }
    setError('');
    setStep('hashing');

    try {
      const fullHash = await sha256File(file);
      const shortHash = `${fullHash.slice(0, 4)}…${fullHash.slice(-4)}`;
      setHash(fullHash);

      const logoText = institution.trim().slice(0, 3).toUpperCase();
      const dateStr = new Date(issueDate).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });

      const newCredential: Credential = {
        id: generateId(),
        name: name.trim(),
        institution: institution.trim(),
        year: new Date(issueDate).getFullYear(),
        logoText,
        status: 'pending',
        txHash: `sha256:${shortHash}`,
        issuedDate: dateStr,
        extra: 'Awaiting admin verification',
      };

      await addCredential(newCredential);
      setStep('done');
    } catch {
      setError('Failed to hash file. Please try again.');
      setStep('form');
    }
  };

  const handleClose = () => {
    setStep('form');
    setFile(null);
    setName('');
    setInstitution('');
    setIssueDate('');
    setHash('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Issue a Credential</div>
            <div className={styles.subtitle}>Upload a document and fill in the details to add it to your vault</div>
          </div>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">✕</button>
        </div>

        {step === 'form' && (
          <>
            {/* Drop zone */}
            <div
              className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''} ${file ? styles.hasFile : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
              {file ? (
                <div className={styles.fileInfo}>
                  <div className={styles.fileIcon}>📄</div>
                  <div className={styles.fileName}>{file.name}</div>
                  <div className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB · Click to replace</div>
                </div>
              ) : (
                <div className={styles.dropHint}>
                  <div className={styles.dropIcon}>⬆</div>
                  <div className={styles.dropLabel}>Drag & drop your credential document</div>
                  <div className={styles.dropSub}>PDF, PNG, JPG, WebP · up to 50 MB</div>
                </div>
              )}
            </div>

            {/* Fields */}
            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label}>Credential name</label>
                <input
                  className={styles.input}
                  placeholder="e.g. B.Sc. Computer Science"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Issuing institution</label>
                <input
                  className={styles.input}
                  placeholder="e.g. University of Cebu"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Issue date</label>
                <input
                  className={styles.input}
                  type="date"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                />
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button className={styles.btnCancel} onClick={handleClose}>Cancel</button>
              <button className={styles.btnPrimary} onClick={handleSubmit}>
                Issue Credential →
              </button>
            </div>
          </>
        )}

        {step === 'hashing' && (
          <div className={styles.processing}>
            <div className={styles.spinner} />
            <div className={styles.processingLabel}>Computing SHA-256 hash…</div>
            <div className={styles.processingSub}>This only takes a moment</div>
          </div>
        )}

        {step === 'done' && (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <div className={styles.successTitle}>Credential issued</div>
            <div className={styles.successSub}>Your credential has been added to your vault with a <span className={styles.badge}>Pending</span> status. An admin will review and anchor it to Cardano.</div>
            <div className={styles.hashRow}>
              <span className={styles.hashLabel}>SHA-256</span>
              <span className={styles.hashValue}>{hash.slice(0, 12)}…{hash.slice(-12)}</span>
            </div>
            <button className={styles.btnPrimary} onClick={handleClose}>Back to vault</button>
          </div>
        )}
      </div>
    </div>
  );
}
