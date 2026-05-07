import { useContext } from 'react';
import { AuthContext } from './authContext'; 
import type { AuthContextType } from './authTypes'; 

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  
  if (ctx === undefined || ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return ctx;
}