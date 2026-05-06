import { useContext } from 'react';
import type { AuthContextType } from './AuthContext';
import { AuthContext } from './AuthContext';

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}