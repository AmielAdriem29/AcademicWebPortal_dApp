import { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Credential } from '../../../shared/types';
import { CREDENTIALS } from '../../../shared/data/mockData';

// ─── Contract (Issue 1 will implement this with IndexedDB) ───────────────────
export interface CredentialContextType {
  credentials: Credential[];
  isLoading: boolean;
  addCredential: (credential: Credential) => Promise<void>;
  updateCredential: (id: string, updates: Partial<Credential>) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;
}

export const CredentialContext = createContext<CredentialContextType | null>(null);

// ─── Lightweight mock implementation (swap for IndexedDB when Issue 1 lands) ─
export function CredentialProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<Credential[]>(CREDENTIALS);
  const [isLoading] = useState(false);

  const addCredential = useCallback(async (credential: Credential) => {
    setCredentials(prev => [credential, ...prev]);
  }, []);

  const updateCredential = useCallback(async (id: string, updates: Partial<Credential>) => {
    setCredentials(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCredential = useCallback(async (id: string) => {
    setCredentials(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <CredentialContext.Provider value={{ credentials, isLoading, addCredential, updateCredential, deleteCredential }}>
      {children}
    </CredentialContext.Provider>
  );
}
