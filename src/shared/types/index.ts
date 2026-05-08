export type CredentialStatus = 'verified' | 'pending' | 'revoked' | 'rejected';

export interface Credential {
  id: string;
  name: string;
  institution: string;
  year: number;
  logoText: string;
  logoColor?: string;
  logoTextColor?: string;
  status: CredentialStatus;
  txHash: string;
  blockNumber?: string;
  issuedDate: string;
  extra?: string;
  // Verification flow fields
  sha256Hash?: string;
  ownerName?: string;
  ownerWallet?: string;
}

export interface AccessPermission {
  id: string;
  name: string;
  company: string;
  dateGranted: string;
  lastViewed: string;
  status: CredentialStatus;
  enabled: boolean;
}

export type ShareLinkStatus = 'active' | 'revoked';

export interface ShareLinkRecord {
  walletAddress: string;
  token: string;
  recipientName: string;
  createdAt: string;
  lastViewedAt?: string;
  status: ShareLinkStatus;
}

export type NavSection = 'vault' | 'share' | 'public' | 'settings';