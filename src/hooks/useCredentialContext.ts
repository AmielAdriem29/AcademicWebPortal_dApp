// hooks/useCredentialContext.ts

import { createContext, useContext } from "react";

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export interface Credential {
  id: string;
  name: string;
  type: "diploma" | "certificate" | "image";
  fileName: string;
  fileType: string;
  fileBlob?: Blob; // attached during hydration
  issuanceDate: string;
  issuer: string;
}

export interface CredentialContextValue {
  wallet: string | null;
  credentials: Credential[];
  isLoading: boolean;
  connectWallet: (address: string) => Promise<void>;
  addCredential: (
    credential: Omit<Credential, "id" | "fileBlob">,
    file: File,
  ) => Promise<void>;
  removeCredential: (id: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ----------------------------------------------------------------------
// Context
// ----------------------------------------------------------------------
export const CredentialContext = createContext<
  CredentialContextValue | undefined
>(undefined);

// ----------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------
export const useCredentialContext = () => {
  const ctx = useContext(CredentialContext);
  if (!ctx) {
    throw new Error(
      "useCredentialContext must be used within CredentialProvider",
    );
  }
  return ctx;
};
