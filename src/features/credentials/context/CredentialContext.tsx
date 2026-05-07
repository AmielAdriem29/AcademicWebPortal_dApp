import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Credential } from '../../../shared/types';
import { CREDENTIALS } from '../../../shared/data/mockData';
import { useAuth } from '../../auth/context/useAuth';
import { CredentialContext } from './credentialContext';

const VAULT_KEY_PREFIX = 'chaincred_vault_';

function vaultKey(walletAddress: string): string {
  return `${VAULT_KEY_PREFIX}${walletAddress}`;
}

function loadCredentials(walletAddress: string): Credential[] {
  try {
    const raw = localStorage.getItem(vaultKey(walletAddress));
    if (raw) return JSON.parse(raw) as Credential[];
    localStorage.setItem(vaultKey(walletAddress), JSON.stringify(CREDENTIALS));
    return CREDENTIALS;
  } catch {
    return CREDENTIALS;
  }
}

function saveCredentials(walletAddress: string, credentials: Credential[]): void {
  try {
    localStorage.setItem(vaultKey(walletAddress), JSON.stringify(credentials));
  } catch {
    console.error('Failed to persist credentials to localStorage.');
  }
}

export function CredentialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [credentials, setCredentials] = useState<Credential[]>(() =>
    user ? loadCredentials(user.walletAddress) : []
  );
  const [isLoading] = useState(false);

  // Re-sync credentials when another tab (e.g. the verify page) updates localStorage
  useEffect(() => {
    if (!user) return;
    const key = vaultKey(user.walletAddress);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setCredentials(JSON.parse(e.newValue) as Credential[]);
        } catch {
          // ignore malformed data
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user]);

  const persist = useCallback((updater: (prev: Credential[]) => Credential[]) => {
    if (!user) return;
    setCredentials(prev => {
      const next = updater(prev);
      saveCredentials(user.walletAddress, next);
      return next;
    });
  }, [user]);

  const addCredential = useCallback(async (credential: Credential) => {
    persist(prev => [credential, ...prev]);
  }, [persist]);

  const updateCredential = useCallback(async (id: string, updates: Partial<Credential>) => {
    persist(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [persist]);

  const deleteCredential = useCallback(async (id: string) => {
    persist(prev => prev.filter(c => c.id !== id));
  }, [persist]);

  return (
    <CredentialContext.Provider value={{ credentials, isLoading, addCredential, updateCredential, deleteCredential }}>
      {children}
    </CredentialContext.Provider>
  );
}