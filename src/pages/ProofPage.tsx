import { useState } from 'react';
import { useWallet } from '@meshsdk/react';
import styles from './ProofPage.module.css';

type UploadState = 'idle' | 'uploading' | 'done';

export function ProofPage() {
  const { wallet, connected } = useWallet();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Anchoring to blockchain...');
  const [txHash, setTxHash] = useState('');
  const [txError, setTxError] = useState('');
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [unsignedTxCbor, setUnsignedTxCbor] = useState('');

  const startUpload = () => {
    if (uploadState === 'uploading') return;
    setUploadState('uploading');
    setProgress(0);
    setProgressLabel('Anchoring to blockchain...');

    // Replaced mock timer progression:
    // let pct = 0;
    // intervalRef.current = setInterval(() => {
    //   pct += 2;
    //   setProgress(pct);
    //   if (pct >= 60 && pct < 90) setProgressLabel('Computing hash...');
    //   if (pct >= 90) setProgressLabel('Confirming block...');
    //   if (pct >= 100) {
    //     clearInterval(intervalRef.current!);
    //     setProgressLabel('Anchored successfully');
    //     setUploadState('done');
    //   }
    // }, 60);

    // Keep a very short UX transition, then enable real chain submit action.
    setProgress(100);
    setProgressLabel('Ready to submit transaction');
    setUploadState('done');
  };

  const submitAnchorTx = async () => {
    if (!connected) {
      setTxError('Connect a Cardano wallet first from Settings.');
      return;
    }

    if (!unsignedTxCbor.trim()) {
      setTxError('Generate or paste unsigned transaction CBOR hex before submitting.');
      return;
    }

    try {
      setIsSubmittingTx(true);
      setTxError('');
      setTxHash('');

      // Replaced auto-builder flow (kept for reference due to SDK type mismatch):
      // const changeAddress = await wallet.getChangeAddress();
      // const tx = new Transaction({ initiator: wallet })
      //   .sendLovelace(changeAddress, '1000000')
      //   .setMetadata(674, {
      //     app: 'ChainCred',
      //     action: 'anchor_credential',
      //     credentialId: 'cred_demo_001',
      //     fileHash: 'a3f9c21b-demo',
      //     createdAt: new Date().toISOString(),
      //   });
      // const unsignedTx = await tx.build();
      // const signedTx = await wallet.signTx(unsignedTx, false);

      const signedTx = await wallet.signTxReturnFullTx(unsignedTxCbor.trim(), false);
      const hash = await wallet.submitTx(signedTx);

      setTxHash(hash);
      setProgressLabel('Anchored successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transaction submission failed.';
      setTxError(message);
    } finally {
      setIsSubmittingTx(false);
    }
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
              {/* Replaced mock transaction value: */}
              {/* <span className={styles.certVal}>0xd8a1…9f30</span> */}
              <span className={styles.certVal}>{txHash || 'Not submitted yet'}</span>
            </div>

              <div style={{ marginTop: '16px', display: 'grid', gap: '12px' }}>
              <textarea
                value={unsignedTxCbor}
                onChange={(e) => setUnsignedTxCbor(e.target.value)}
                placeholder="Paste unsigned CBOR hex here"
                rows={4}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  color: '#e6eef7',
                  padding: '10px 12px',
                  fontSize: '12px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                }}
              />
              <button
                className={styles.uploadZone}
                style={{ maxWidth: '320px', padding: '12px 16px' }}
                onClick={submitAnchorTx}
                disabled={isSubmittingTx}
              >
                <div className={styles.uploadLabel}>
                  {isSubmittingTx ? 'Submitting transaction...' : 'Sign & Submit Transaction'}
                </div>
              </button>
              {txError && <span style={{ color: '#ff8a80' }}>{txError}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}