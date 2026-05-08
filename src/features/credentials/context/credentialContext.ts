import { createContext } from 'react';
import type { Credential } from '../../../shared/types';

export interface CredentialContextType {
  wallet: string | null;
  credentials: Credential[];
  isLoading: boolean;
  addCredential: (credential: Credential) => Promise<void>;
  updateCredential: (id: string, updates: Partial<Credential>) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;
}

export const CredentialContext = createContext<CredentialContextType | null>(null);