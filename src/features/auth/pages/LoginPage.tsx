import { useState } from 'react';
import { useWallet, useWalletList } from '@meshsdk/react';
import { useAuth } from '../context/useAuth';
import styles from './LoginPage.module.css';

interface Props {
  onNavigateRegister: () => void;
}

export function LoginPage({ onNavigateRegister }: Props) {
  const wallets = useWalletList();
  const { connect, connected, wallet } = useWallet();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);

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

  const handleLogin = async () => {
    if (!connected || !wallet) return;
    setError('');
    
    try {
      const address = await wallet.getChangeAddress();
      if (!address) {
        setError('Could not retrieve wallet address. Try reconnecting.');
        return;
      }
      const profile = login(address);
      if (!profile) {
        setError('No account found for this wallet. Please register first.');
      }
    } catch {
      setError('Could not retrieve wallet address. Try reconnecting.');
    }
  };

  return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>⬡ <span>ChainCred</span></div>
          <h1 className={styles.heading}>Welcome back</h1>
          <p className={styles.sub}>Connect your Cardano wallet to sign in</p>

          {!connected ? (
              <div className={styles.walletList}>
                {wallets.length === 0 ? (
                    <p className={styles.empty}>
                      No Cardano wallets detected.{' '}
                      <a href="https://namiwallet.io" target="_blank" rel="noreferrer">Install Nami →</a>
                    </p>
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
              <div className={styles.connectedState}>
                <div className={styles.connectedBadge}>✓ Wallet Connected</div>
                <button className={styles.btnPrimary} onClick={handleLogin}>
                  Sign In with Wallet
                </button>
              </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.footer}>
            Don't have an account?{' '}
            <button className={styles.linkBtn} onClick={onNavigateRegister}>
              Register here
            </button>
          </div>
        </div>
      </div>
  );
}