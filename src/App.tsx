import { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react';
import { useNavigation } from './shared/hooks/useNavigation';
import { Sidebar } from './shared/components/layout/Sidebar';
import { AuthProvider } from './features/auth/context/AuthProvider';
import { useAuth } from './features/auth/context/useAuth';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { CredentialProvider } from './features/credentials/context/CredentialContext.tsx';
import { VaultPage } from './features/vault';
import { SharePage } from './features/share';
import { PublicProfilePage } from './features/public-profile';
import { SettingsPage } from './features/settings';
import { VerifyPage } from './features/verify';
import styles from './App.module.css';

type AuthView = 'login' | 'register';

function isVerifyRoute() {
  return window.location.pathname.startsWith('/verify/');
}

function AppContent() {
  const { user } = useAuth();
  const { active, navigate } = useNavigation('vault');
  const { connected, connect } = useWallet();
  const [authView, setAuthView] = useState<AuthView>('login');
  const shareParams = new URLSearchParams(window.location.search);
  const isShareLink = Boolean(shareParams.get('wallet') && shareParams.get('token'));

  useEffect(() => {
    if (user && !connected) {
      const savedWallet = localStorage.getItem('chaincred_wallet');
      if (savedWallet) {
        connect(savedWallet).catch(() => {
          localStorage.removeItem('chaincred_wallet');
        });
      }
    }
  }, [user, connected, connect]);

  if (isVerifyRoute()) return <VerifyPage />;

  if (isShareLink) return <PublicProfilePage />;

  if (!user) {
    return authView === 'login'
      ? <LoginPage onNavigateRegister={() => setAuthView('register')} />
      : <RegisterPage onNavigateLogin={() => setAuthView('login')} />;
  }

  return (
    <CredentialProvider key={user.walletAddress}>
      <div className={styles.app}>
        <Sidebar active={active} onNavigate={navigate} />
        <main className={styles.content}>
          {active === 'vault'    && <VaultPage />}
          {active === 'share'    && <SharePage />}
          {active === 'public'   && <PublicProfilePage />}
          {active === 'settings' && <SettingsPage />}
        </main>
      </div>
    </CredentialProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}