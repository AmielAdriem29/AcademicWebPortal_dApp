import { useState } from 'react';
import { useNavigation } from './shared/hooks/useNavigation';
import { Sidebar } from './shared/components/layout/Sidebar';
import { useAuth, AuthProvider, LoginPage, RegisterPage } from './features/auth';
import { VaultPage } from './features/vault';
import { SharePage } from './features/share';
import { ProofPage } from './features/proof';
import { PublicProfilePage } from './features/public-profile';
import { SettingsPage } from './features/settings';
import styles from './App.module.css';

type AuthView = 'login' | 'register';

function AppContent() {
  const { user } = useAuth();
  const { active, navigate } = useNavigation('vault');
  const [authView, setAuthView] = useState<AuthView>('login');

  if (!user) {
    return authView === 'login'
      ? <LoginPage onNavigateRegister={() => setAuthView('register')} />
      : <RegisterPage onNavigateLogin={() => setAuthView('login')} />;
  }

  return (
    <div className={styles.app}>
      <Sidebar active={active} onNavigate={navigate} />
      <main className={styles.content}>
        {active === 'vault'        && <VaultPage />}
        {active === 'share'        && <SharePage />}
        {active === 'proof'        && <ProofPage />}
        {active === 'public'       && <PublicProfilePage />}
        {active === 'settings'     && <SettingsPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}