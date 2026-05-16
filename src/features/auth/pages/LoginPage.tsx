import { useState } from 'react';
import { useWallet, useWalletList } from '@meshsdk/react';
import { useAuth } from '../context/useAuth';
import styles from './LoginPage.module.css';

interface Props {
  onNavigateRegister: () => void;
}

export function LoginPage({ onNavigateRegister }: Props) {
  const wallets = useWalletList();
  const { connect, connected, wallet, disconnect } = useWallet();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async (walletId: string) => {
    setError('');
    setConnecting(true);
    if (connected) await disconnect();
    try {
      await connect(walletId);
      localStorage.setItem('chaincred_wallet', walletId);
    } catch {
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  function hexToBech32(hex: string): string {
    const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

    function polymod(values: number[]): number {
      const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
      let chk = 1;
      for (const v of values) {
        const b = chk >> 25;
        chk = ((chk & 0x1ffffff) << 5) ^ v;
        for (let i = 0; i < 5; i++) chk ^= (b >> i) & 1 ? GEN[i] : 0;
      }
      return chk;
    }

    function hrpExpand(hrp: string): number[] {
      return [...hrp].map(c => c.charCodeAt(0) >> 5)
        .concat([0])
        .concat([...hrp].map(c => c.charCodeAt(0) & 31));
    }

    function convertbits(data: number[], from: number, to: number): number[] {
      let acc = 0, bits = 0;
      const ret: number[] = [];
      const maxv = (1 << to) - 1;
      for (const v of data) {
        acc = ((acc << from) | v);
        bits += from;
        while (bits >= to) { bits -= to; ret.push((acc >> bits) & maxv); }
      }
      if (bits) ret.push((acc << (to - bits)) & maxv);
      return ret;
    }

    const hrp = 'addr_test';
    const raw = Array.from(Buffer.from(hex, 'hex'));
    const data = convertbits(raw, 8, 5);
    const combined = [...data, 0, 0, 0, 0, 0, 0];
    const mod = polymod([...hrpExpand(hrp), ...combined]) ^ 1;
    for (let i = 0; i < 6; i++) combined[combined.length - 6 + i] = (mod >> (5 * (5 - i))) & 31;
    return hrp + '1' + combined.map(d => CHARSET[d]).join('');
  }

  const handleLogin = async () => {
    if (!connected || !wallet) return;
    setError('');

    try {
      const used = await wallet.getUsedAddresses();
      const raw = used && used.length > 0
        ? used[0]
        : await wallet.getChangeAddress();

      if (!raw) {
        setError('Could not retrieve wallet address. Try reconnecting.');
        return;
      }

      // MeshSDK returns CBOR hex — decode to bech32 for localStorage lookup
      const address = raw.startsWith('addr') ? raw : hexToBech32(raw);
      console.log('resolved address:', address);

      const profile = login(address);
      if (!profile) {
        setError('No account found for this wallet. Please register first.');
      }
    } catch (e) {
      console.error(e);
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
                  <span>{connecting ? 'Connecting…' : w.name}</span>
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
            <button className={styles.relinkBtn} onClick={() => disconnect()}>
              Use a different wallet
            </button>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠</span>
            <span>{error}</span>
            <button className={styles.errorDismiss} onClick={() => setError('')} aria-label="Dismiss error">✕</button>
          </div>
        )}

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