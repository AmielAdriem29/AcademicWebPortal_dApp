import { useState, useEffect } from 'react';
import { useWallet, useWalletList } from '@meshsdk/react';
import { useAuth } from '../context/useAuth';
import type { UserProfile } from '../context/authTypes';
import { getInstitutionByWallet } from '../../../constants/institutions';
import { resolveAddress } from '../../../shared/utils/walletAddress';
import styles from './RegisterPage.module.css';

interface Props {
  onNavigateLogin: () => void;
}

export function RegisterPage({ onNavigateLogin }: Props) {
  const wallets = useWalletList();
  const { connect, connected, wallet } = useWallet();
  const { register, isRegistered } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '' });
  const [detectedInstitution, setDetectedInstitution] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !wallet) return;

    let cancelled = false;

    const detect = async () => {
      try {
        const raw = await wallet.getChangeAddress();
        if (cancelled || !raw) return;
        const address = resolveAddress(raw);
        const institution = getInstitutionByWallet(address);
        if (!cancelled) {
          setDetectedInstitution(institution?.name ?? null);
        }
      } catch {
        // ignore
      }
    };

    detect();
    return () => { cancelled = true; };
  }, [connected, wallet]);

  const handleConnect = async (walletId: string) => {
    setError('');
    setConnecting(true);
    try {
      await connect(walletId);
    } catch {
      setError('Failed to connect wallet.');
    } finally {
      setConnecting(false);
    }
  };

  const handleRegister = async () => {
    if (!connected || !wallet) return;
    if (!form.name || !form.email) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');

    let raw: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        raw = await wallet.getChangeAddress();
        if (raw) break;
      } catch {
        if (attempt < 2) {
          await new Promise(res => setTimeout(res, 500));
        }
      }
    }

    if (!raw) {
      setError('Could not retrieve wallet address. Try reconnecting.');
      return;
    }

    const address = resolveAddress(raw);

    if (isRegistered(address)) {
      setError('This wallet is already registered. Please sign in.');
      return;
    }

    const institution = getInstitutionByWallet(address);
    const profile: UserProfile = {
      walletAddress: address,
      name: form.name,
      email: form.email,
      registeredAt: new Date().toISOString(),
      accountType: institution ? 'institution' : 'holder',
    };
    register(profile);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>⬡ <span>ChainCred</span></div>
        <h1 className={styles.heading}>Create account</h1>
        <p className={styles.sub}>Register using your Cardano wallet as your identity</p>

        {!connected ? (
          <>
            <p className={styles.stepLabel}>Step 1 — Connect your wallet</p>
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
          </>
        ) : (
          <>
            <div className={styles.connectedBadge}>✓ Wallet Connected</div>

            {detectedInstitution && (
              <div className={styles.institutionBadge}>
                🏛 Institution detected: <strong>{detectedInstitution}</strong>
              </div>
            )}

            <p className={styles.stepLabel}>Step 2 — Fill in your profile</p>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <input
                  className={styles.input}
                  placeholder="Juan dela Cruz"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="juan@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>
            <button className={styles.btnPrimary} onClick={handleRegister}>
              Create Account
            </button>
          </>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.footer}>
          Already have an account?{' '}
          <button className={styles.linkBtn} onClick={onNavigateLogin}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}