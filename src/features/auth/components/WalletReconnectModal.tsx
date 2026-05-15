import { useState } from 'react';
import { useWallet, useWalletList } from '@meshsdk/react';
import { useAuth } from '../context/useAuth';
import styles from './WalletReconnectModal.module.css';

const WALLET_KEY = 'chaincred_wallet';

export function WalletReconnectModal() {
  const wallets = useWalletList();
  const { connect } = useWallet();
  const { logout, setWalletDisconnected, login } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleReconnect = async (walletId: string) => {
    setError('');
    setConnecting(true);
    try {
      // connect() triggers MeshSDK — this updates useWallet() state everywhere
      await connect(walletId);
      localStorage.setItem(WALLET_KEY, walletId);

      // Give MeshSDK a tick to settle, then get the address and re-login
      setTimeout(async () => {
        try {
          const api = await window.cardano?.[walletId]?.enable();
          if (!api) {
            setError('Wallet extension not found. Please try again.');
            setConnecting(false);
            return;
          }
          const address = await api.getChangeAddress();
          if (address) {
            const profile = login(address);
            if (profile) {
              setWalletDisconnected(false); // hides modal, MeshSDK already updated
            } else {
              setError('No account found for this wallet. Please log in again.');
              setConnecting(false);
            }
          }
        } catch {
          setError('Failed to get wallet address. Please try again.');
          setConnecting(false);
        }
      }, 500);
    } catch {
      setError('Failed to reconnect. Please try again.');
      setConnecting(false);
    }
  };

  const handleDismiss = () => {
    logout();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon}>⚠</div>
        <h2 className={styles.title}>Wallet Disconnected</h2>
        <p className={styles.message}>
          Your wallet session has ended. Reconnect your wallet to continue,
          or log out to return to the login screen.
        </p>

        <div className={styles.walletList}>
          {wallets.map(w => (
            <button
              key={w.id}
              className={styles.walletBtn}
              onClick={() => handleReconnect(w.id)}
              disabled={connecting}
            >
              <img src={w.icon} alt={w.name} className={styles.walletIcon} />
              <span>{connecting ? 'Connecting…' : `Reconnect with ${w.name}`}</span>
            </button>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.logoutBtn} onClick={handleDismiss}>
          Log out instead
        </button>
      </div>
    </div>
  );
}