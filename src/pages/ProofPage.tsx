import { useState, useRef } from 'react';
import styles from './ProofPage.module.css';

type UploadState = 'idle' | 'uploading' | 'done';

export function ProofPage() {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Anchoring to blockchain...');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startUpload = () => {
    if (uploadState === 'uploading') return;
    setUploadState('uploading');
    setProgress(0);
    setProgressLabel('Anchoring to blockchain...');

    let pct = 0;
    intervalRef.current = setInterval(() => {
      pct += 2;
      setProgress(pct);
      if (pct >= 60 && pct < 90) setProgressLabel('Computing hash...');
      if (pct >= 90) setProgressLabel('Confirming block...');
      if (pct >= 100) {
        clearInterval(intervalRef.current!);
        setProgressLabel('Anchored successfully');
        setUploadState('done');
      }
    }, 60);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h2 className={styles.heading}>Proof of Work · Timestamping</h2>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.sectionTitle}>Upload research or project files</div>

        <button className={styles.uploadZone} onClick={startUpload} disabled={uploadState === 'uploading'}>
          <div className={styles.uploadIcon}>📄</div>
          <div className={styles.uploadLabel}>Drag &amp; drop PDF or file here</div>
          <div className={styles.uploadSub}>or click to browse · PDF, DOCX, ZIP up to 50MB</div>

          {uploadState !== 'idle' && (
            <>
              <div className={styles.progressWrap}>
                <div className={styles.progressBar} style={{ width: `${progress}%` }} />
              </div>
              <div className={styles.progressLabel}>{progressLabel}</div>
            </>
          )}
        </button>

        {uploadState === 'done' && (
          <div className={styles.certCard}>
            <div className={styles.certTitle}>Certificate of Existence</div>
            <div className={styles.certRow}>
              <span>File name</span>
              <span className={styles.certVal}>thesis_final_v3.pdf</span>
            </div>
            <div className={styles.certRow}>
              <span>SHA-256</span>
              <span className={styles.certVal}>a3f9…c21b</span>
            </div>
            <div className={styles.certRow}>
              <span>Timestamp</span>
              <span className={styles.certVal}>2025-05-03 14:22:07 UTC</span>
            </div>
            <div className={styles.certRow}>
              <span>Block height</span>
              <span className={styles.certVal}>#19,847,562</span>
            </div>
            <div className={styles.certRow}>
              <span>Transaction</span>
              <span className={styles.certVal}>0xd8a1…9f30</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}