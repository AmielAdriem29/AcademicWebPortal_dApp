import { useEffect, useMemo, useState } from 'react';
import { useCredentials } from '../../credentials/context/useCredentials';
import { createShareUrl, saveShareLink } from '../../../shared/utils/shareLinks';
import styles from './ShareModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ isOpen, onClose }: Props) {
  const { wallet } = useCredentials();
  const [recipientName, setRecipientName] = useState('');
  const [shareToken, setShareToken] = useState(() => crypto.randomUUID());
  const [error, setError] = useState('');
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = useMemo(() => {
    if (!wallet) return '';
    if (!recipientName.trim()) return '';
    return createShareUrl(wallet, shareToken);
  }, [wallet, shareToken, recipientName]);

  useEffect(() => {
    if (!isOpen) return;
    setShareToken(crypto.randomUUID());
    setRecipientName('');
    setError('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setError('');
    if (!wallet) {
      setError('Connect a wallet before generating a share link.');
      return;
    }

    if (!recipientName.trim()) {
      setError('Recipient Name is required.');
      return;
    }

    saveShareLink({
      walletAddress: wallet,
      token: shareToken,
      recipientName: recipientName.trim(),
      createdAt: new Date().toISOString(),
      status: 'active',
    });

    setShowLinkPopup(true);
  };

  const handlePopupCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1500);
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3 className={styles.title}>Generate Verification Link</h3>

        <div className={styles.row}>
          <span className={styles.label}>Recipient Name</span>
          <input
            className={styles.input}
            value={recipientName}
            onChange={e => setRecipientName(e.target.value)}
            placeholder="Google HR"
          />
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Wallet Address</span>
          <div className={styles.walletPill}>{wallet ?? 'Connect wallet to continue'}</div>
        </div>

        <div className={styles.linkBox}>{'Enter a recipient name and press Confirm to generate the share link.'}</div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button className={styles.btnOutline} onClick={onClose}>Cancel</button>
          <button
            className={styles.btnPrimary}
            onClick={handleConfirm}
            disabled={!wallet || !recipientName.trim()}
            aria-disabled={!wallet || !recipientName.trim()}
          >
            Confirm
          </button>
        </div>
      </div>
      </div>
      {showLinkPopup && (
      <div className={styles.backdrop} onClick={() => setShowLinkPopup(false)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <h3 className={styles.title}>Share link generated</h3>
          <div className={styles.row}>
            <div className={styles.label}>Recipient</div>
            <div>{recipientName}</div>
          </div>
          <div className={styles.linkBox}>{shareUrl}</div>
          <div className={styles.actions}>
            <button className={styles.btnOutline} onClick={() => setShowLinkPopup(false)}>Close</button>
            <button className={styles.btnOutline} onClick={handlePopupCopy}>{copiedLink ? 'Copied!' : 'Copy link'}</button>
            <button className={styles.btnPrimary}>Add to LinkedIn</button>
          </div>
        </div>
      </div>
      )}
    </>
  );
}