// contexts/CredentialContext.tsx

import React, { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import {
  getCurrentWallet,
  setCurrentWallet,
  loadCredentialsMeta,
  saveCredentialsMeta,
  saveCredentialFile,
  loadCredentialFile,
  deleteCredentialFile,
  deleteEntireWallet,
} from "../utils/storage";
import { CredentialContext } from "../hooks/useCredentialContext";
import type { Credential } from "../hooks/useCredentialContext";

// ----------------------------------------------------------------------
// Provider
// ----------------------------------------------------------------------
export const CredentialProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ------------------------------------------------------------------
  // 1. HYDRATION: load wallet + credentials from storage on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    const hydrate = async () => {
      setIsLoading(true);
      const savedWallet = getCurrentWallet();
      if (savedWallet) {
        setWallet(savedWallet);
        const meta = loadCredentialsMeta(savedWallet);
        const hydrated: Credential[] = [];
        if (Array.isArray(meta)) {
          for (const item of meta) {
            if (item && typeof item === "object" && "id" in item) {
              const blob = await loadCredentialFile(
                savedWallet,
                (item as Credential).id,
              );
              hydrated.push({
                ...item,
                fileBlob: blob || undefined,
              } as Credential);
            }
          }
        }
        setCredentials(hydrated);
      }
      setIsLoading(false);
    };
    hydrate();
  }, []);

  // ------------------------------------------------------------------
  // 2. AUTO‑SYNC: whenever credentials change, save metadata to storage
  // ------------------------------------------------------------------
  useEffect(() => {
    if (wallet && !isLoading) {
      const meta = credentials.map((cred) => ({
        id: cred.id,
        name: cred.name,
        type: cred.type,
        fileName: cred.fileName,
        fileType: cred.fileType,
        issuanceDate: cred.issuanceDate,
        issuer: cred.issuer,
      }));
      saveCredentialsMeta(wallet, meta);
    }
  }, [credentials, wallet, isLoading]);

  // ------------------------------------------------------------------
  // 3. Connect wallet (used after login / register)
  // ------------------------------------------------------------------
  const connectWallet = useCallback(async (address: string) => {
    setCurrentWallet(address);
    setWallet(address);
    const meta = loadCredentialsMeta(address);
    const hydrated: Credential[] = [];
    if (Array.isArray(meta)) {
      for (const item of meta) {
        if (item && typeof item === "object" && "id" in item) {
          const blob = await loadCredentialFile(
            address,
            (item as Credential).id,
          );
          hydrated.push({ ...item, fileBlob: blob || undefined } as Credential);
        }
      }
    }
    setCredentials(hydrated);
  }, []);

  // ------------------------------------------------------------------
  // 4. Add a new credential (metadata + file blob)
  // ------------------------------------------------------------------
  const addCredential = useCallback(
    async (credData: Omit<Credential, "id" | "fileBlob">, file: File) => {
      if (!wallet) throw new Error("No wallet connected");

      const id = crypto.randomUUID();
      const newCredential: Credential = {
        ...credData,
        id,
        fileName: file.name,
        fileType: file.type,
        fileBlob: file,
        issuanceDate: credData.issuanceDate || new Date().toISOString(),
        issuer: credData.issuer || "Self",
      };

      await saveCredentialFile(wallet, id, file);
      setCredentials((prev) => [...prev, newCredential]);
    },
    [wallet],
  );

  // ------------------------------------------------------------------
  // 5. Remove a credential (metadata + file)
  // ------------------------------------------------------------------
  const removeCredential = useCallback(
    async (id: string) => {
      if (!wallet) return;
      await deleteCredentialFile(wallet, id);
      setCredentials((prev) => prev.filter((c) => c.id !== id));
    },
    [wallet],
  );

  // ------------------------------------------------------------------
  // 6. Logout: wipe all storage for this wallet and reset state
  // ------------------------------------------------------------------
  const logout = useCallback(async () => {
    if (wallet) {
      await deleteEntireWallet(wallet);
    }
    setWallet(null);
    setCredentials([]);
  }, [wallet]);

  const value = {
    wallet,
    credentials,
    isLoading,
    connectWallet,
    addCredential,
    removeCredential,
    logout,
  };

  return (
    <CredentialContext.Provider value={value}>
      {children}
    </CredentialContext.Provider>
  );
};
