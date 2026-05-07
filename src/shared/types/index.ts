export type CredentialStatus = 'verified' | 'pending' | 'revoked';

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

export type NavSection = 'vault' | 'share' | 'public' | 'settings';