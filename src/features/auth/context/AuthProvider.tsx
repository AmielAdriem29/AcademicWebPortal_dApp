import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './authContext';
import type { UserProfile } from './authTypes';

const STORAGE_KEY = 'chaincred_users';
const SESSION_KEY = 'chaincred_session';
const WALLET_KEY = 'chaincred_wallet';

function getUsers(): Record<string, UserProfile> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      // sessionStorage clears automatically when the tab is closed
      const session = sessionStorage.getItem(SESSION_KEY);
      // Also clear any stale session that may be left in localStorage from before
      localStorage.removeItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  });

  const isRegistered = (address: string) => {
    return Object.prototype.hasOwnProperty.call(getUsers(), address);
  };

  const login = (address: string): UserProfile | null => {
    const profile = getUsers()[address] || null;
    if (profile) {
      setUser(profile);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    }
    return profile;
  };

  const register = (profile: UserProfile) => {
    const users = getUsers();
    users[profile.walletAddress] = profile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    setUser(profile);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(WALLET_KEY);
  };

  const value = useMemo(() => ({
    user,
    login,
    register,
    logout,
    isRegistered
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}