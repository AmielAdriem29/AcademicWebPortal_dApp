import { useState } from 'react';
import { useWallet, useWalletList } from '@meshsdk/react';
import type { Credential } from '../../../shared/types/index.ts';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';
import { useCredentials } from '../../credentials/context/useCredentials';
import { useAuth } from '../../auth/context/useAuth';
import { encodeVerifyToken } from '../../../shared/utils/verifyToken';
import { previewCredentialFile } from '../../../shared/utils/filePreview';
import styles from './CredentialCard.module.css';

interface Props {
  credential: Credential;
}

// ── Verify Link Modal ────────────────────────────────────────────────────────
function VerifyLinkModal({ credential, onClose }: { credential: Credential; onClose: () => void }) {
  const { user } = useAuth();
  const [issuedAt] = useState<number>(() => Date.now());
  const token = encodeVerifyToken({
    credentialId: credential.id,
    credentialName: credential.name,
    institution: credential.institution,
    issuedDate: credential.issuedDate,
    sha256Hash: credential.sha256Hash ?? '',
    ownerName: credential.ownerName || user?.name || '',
    ownerWallet: credential.ownerWallet || user?.walletAddress || '',
    issuedAt,
  });

  const link = `${window.location.origin}/verify/${token}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.verifyModal} onClick={e => e.stopPropagation()}>
        <div className={styles.verifyModalHeader}>
          <div>
            <div className={styles.verifyModalTitle}>Send for Verification</div>
            <div className={styles.verifyModalSub}>Share this link with {credential.institution}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.verifyModalBody}>
          <div className={styles.verifyInfo}>
            <span className={styles.verifyInfoIcon}>📋</span>
            <span>The recipient opens this link, fills in their details, draws their signature, and submits. Their confirmation is anchored to Cardano.</span>
          </div>
          <div className={styles.linkBox}>
            <span className={styles.linkText}>{link}</span>
          </div>
          <button className={styles.copyBtn} onClick={handleCopy}>
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
type DeleteStep = 'confirm' | 'wallet' | 'deleting';

function DeleteModal({
  credential,
  onCancel,
  onDeleted,
}: {
  credential: Credential;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const { user } = useAuth();
  const { deleteCredential } = useCredentials();
  const wallets = useWalletList();
  const { connect, connected, wallet } = useWallet();

  const [step, setStep] = useState<DeleteStep>('confirm');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (walletId: string) => {
    setError('');
    setConnecting(true);
    try {
      await connect(walletId);
    } catch {
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const handleWalletConfirm = async () => {
    if (!connected || !wallet) {
      setError('Please connect your wallet first.');
      return;
    }
    setError('');
    try {
      const address = await wallet.getChangeAddress();
      const resolved = Array.isArray(address) ? address[0] : address;
      if (resolved !== user?.walletAddress) {
        setError('Wrong wallet. Please connect the wallet associated with this account.');
        return;
      }
      setStep('deleting');
      await deleteCredential(credential.id);
      onDeleted();
    } catch {
      setError('Could not verify wallet. Make sure it is unlocked and try again.');
      setStep('wallet');
    }
  };

  return (
    <div className={styles.deleteModalBackdrop}>
      <div className={styles.deleteModal} onClick={e => e.stopPropagation()}>

        {step === 'confirm' && (
          <>
            <div className={styles.deleteModalIcon}>⚠</div>
            <div className={styles.deleteModalTitle}>Delete credential?</div>
            <div className={styles.deleteModalCred}>"{credential.name}"</div>
            <div className={styles.deleteModalSub}>
              This permanently removes the credential from your vault.
              On-chain records are unaffected, but you won't be able to
              recover it without re-adding it manually.
            </div>
            {credential.status === 'verified' && (
              <div className={styles.deleteModalWarning}>
                This credential is verified and visible on your public profile.
                Deleting it will remove it from recruiter view.
              </div>
            )}
            <div className={styles.deleteModalActions}>
              <button className={styles.deleteCancelBtn} onClick={onCancel}>Cancel</button>
              <button className={styles.deleteNextBtn} onClick={() => setStep('wallet')}>
                Continue →
              </button>
            </div>
          </>
        )}

        {(step === 'wallet' || step === 'deleting') && (
          <>
            <div className={styles.deleteModalIcon}>🔐</div>
            <div className={styles.deleteModalTitle}>Confirm with your wallet</div>
            <div className={styles.deleteModalSub}>
              Connect your registered wallet to confirm you authorise this deletion.
            </div>

            {error && <div className={styles.deleteModalError}>{error}</div>}

            {!connected ? (
              <div className={styles.walletList}>
                {wallets.length === 0 ? (
                  <p className={styles.noWallets}>No Cardano wallets detected.</p>
                ) : (
                  wallets.map(w => (
                    <button
                      key={w.id}
                      className={styles.walletBtn}
                      onClick={() => handleConnect(w.id)}
                      disabled={connecting}
                    >
                      <img src={w.icon} alt={w.name} className={styles.walletIcon} />
                      <span>{w.name}</span>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className={styles.walletConnectedBadge}>✓ Wallet connected</div>
            )}

            <div className={styles.deleteModalActions}>
              <button
                className={styles.deleteCancelBtn}
                onClick={onCancel}
                disabled={step === 'deleting'}
              >
                Cancel
              </button>
              <button
                className={styles.deleteConfirmBtn}
                onClick={handleWalletConfirm}
                disabled={!connected || step === 'deleting'}
              >
                {step === 'deleting' ? (
                  <span className={styles.deletingInner}>
                    <span className={styles.deleteSpinner} />
                    Deleting…
                  </span>
                ) : (
                  'Delete permanently'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Credential Card ──────────────────────────────────────────────────────────
export function CredentialCard({ credential }: Props) {
  const { updateCredential } = useCredentials();
  const { user } = useAuth();
  const { id, name, institution, year, logoText, logoColor, logoTextColor, status, txHash, blockNumber, issuedDate, extra, fileKey, fileName, fileType } = credential;

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editInstitution, setEditInstitution] = useState(institution);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hashCopied, setHashCopied] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleSave = async () => {
    await updateCredential(id, { name: editName.trim(), institution: editInstitution.trim() });
    setEditing(false);
  };

  const handleViewDocument = async () => {
    if (!fileKey || !fileName || !fileType || !user) return;
    setPreviewLoading(true);
    try {
      await previewCredentialFile(user.walletAddress, id, fileName, fileType);
    } catch (error) {
      console.error('Failed to preview document:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const isFullHash = txHash && !txHash.startsWith('sha256:') && txHash.length > 20;
  const displayHash = isFullHash
    ? `${txHash.slice(0, 16)}…${txHash.slice(-6)}`
    : txHash;

  const handleHashCopy = () => {
    if (!isFullHash) return;
    navigator.clipboard.writeText(txHash);
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
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

  return (
    <>
      {showVerifyModal && (
        <VerifyLinkModal credential={credential} onClose={() => setShowVerifyModal(false)} />
      )}
      {showDeleteModal && (
        <DeleteModal
          credential={credential}
          onCancel={() => setShowDeleteModal(false)}
          onDeleted={() => setShowDeleteModal(false)}
        />
      )}

      <div className={`${styles.card} ${status === 'verified' ? styles.verifiedCard : ''}`}>
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

        <button
          className={`${styles.hash} ${isFullHash ? styles.hashClickable : ''}`}
          onClick={handleHashCopy}
          title={isFullHash ? (hashCopied ? 'Copied!' : 'Click to copy full hash') : undefined}
          disabled={!isFullHash}
        >
          <span className={styles.hashText}>{displayHash}</span>
          {isFullHash && (
            <span className={styles.hashCopyHint}>
              {hashCopied ? '✓ Copied' : 'Copy'}
            </span>
          )}
        </button>

        <div className={styles.date}>
          {extra
            ? `${issuedDate} · ${extra}`
            : blockNumber
              ? `Issued ${issuedDate} · Block #${blockNumber}`
              : issuedDate}
        </div>

        <div className={styles.cardActions}>
          {status === 'pending' && (
            <>
              <button className={styles.actionBtnVerify} onClick={() => setShowVerifyModal(true)}>
                Send for Verification
              </button>
              <button className={styles.actionBtn} onClick={() => setEditing(true)}>Edit</button>
            </>
          )}
          {status === 'verified' && fileKey && fileName && fileType && (
            <button
              className={styles.actionBtn}
              onClick={handleViewDocument}
              disabled={previewLoading}
            >
              {previewLoading ? 'Opening…' : '📄 View Document'}
            </button>
          )}
          <button
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
}