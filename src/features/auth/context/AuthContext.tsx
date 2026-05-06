import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface UserProfile {
  walletAddress: string;
  name: string;
  email: string;
  institution: string;
  registeredAt: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  login: (address: string) => UserProfile | null;
  register: (profile: UserProfile) => void;
  logout: () => void;
  isRegistered: (address: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'chaincred_users';
const SESSION_KEY = 'chaincred_session';

function getUsers(): Record<string, UserProfile> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  });

  const isRegistered = (address: string) => !!getUsers()[address];

  const login = (address: string): UserProfile | null => {
    const profile = getUsers()[address] ?? null;
    if (profile) {
      setUser(profile);
      localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    }
    return profile;
  };

  const register = (profile: UserProfile) => {
    const users = getUsers();
    users[profile.walletAddress] = profile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    setUser(profile);
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isRegistered }}>
      {children}
    </AuthContext.Provider>
  );
}