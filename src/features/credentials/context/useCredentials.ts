import { useContext } from 'react';
import { CredentialContext } from './credentialContext';

export function useCredentials() {
  const ctx = useContext(CredentialContext);
  if (!ctx) throw new Error('useCredentials must be used within CredentialProvider');
  return ctx;
}