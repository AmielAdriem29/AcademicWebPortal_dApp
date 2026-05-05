import { useNavigation } from './hooks/useNavigation';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { VaultPage } from './pages/VaultPage.tsx';
import { SharePage } from './pages/SharePage.tsx';
import { ProofPage } from './pages/ProofPage.tsx';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { SettingsPage } from './pages/SettingsPage.tsx';
import styles from './App.module.css';

export default function App() {
  const { active, navigate } = useNavigation('vault');

  return (
    <div className={styles.app}>
      <Sidebar active={active} onNavigate={navigate} />
      <main className={styles.content}>
        {active === 'vault'    && <VaultPage />}
        {active === 'share'    && <SharePage />}
        {active === 'proof'    && <ProofPage />}
        {active === 'public'   && <PublicProfilePage />}
        {active === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}