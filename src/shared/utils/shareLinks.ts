export type ShareLinkStatus = 'active' | 'revoked';

export interface ShareLinkRecord {
  walletAddress: string;
  token: string;
  recipientName: string;
  createdAt: string;
  lastViewedAt?: string;
  status: ShareLinkStatus;
}

const SHARE_LINKS_PREFIX = 'chaincred_share_links_';

function shareLinksKey(walletAddress: string): string {
  return `${SHARE_LINKS_PREFIX}${walletAddress}`;
}

function readShareLinks(walletAddress: string): ShareLinkRecord[] {
  try {
    const raw = localStorage.getItem(shareLinksKey(walletAddress));
    return raw ? (JSON.parse(raw) as ShareLinkRecord[]) : [];
  } catch {
    return [];
  }
}

function writeShareLinks(walletAddress: string, records: ShareLinkRecord[]): void {
  localStorage.setItem(shareLinksKey(walletAddress), JSON.stringify(records));
}

export function createShareUrl(walletAddress: string, token: string): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('wallet', walletAddress);
  url.searchParams.set('token', token);
  return url.toString();
}

export function loadShareLinks(walletAddress: string): ShareLinkRecord[] {
  return readShareLinks(walletAddress).sort((left, right) => {
    return right.createdAt.localeCompare(left.createdAt);
  });
}

export function saveShareLink(record: ShareLinkRecord): ShareLinkRecord {
  const records = readShareLinks(record.walletAddress);
  const index = records.findIndex(item => item.token === record.token);
  const nextRecord: ShareLinkRecord = {
    ...record,
    recipientName: record.recipientName.trim(),
    status: record.status ?? 'active',
  };

  if (index >= 0) {
    records[index] = {
      ...records[index],
      ...nextRecord,
    };
  } else {
    records.unshift(nextRecord);
  }

  writeShareLinks(record.walletAddress, records);
  return nextRecord;
}

export function setShareLinkStatus(
  walletAddress: string,
  token: string,
  status: ShareLinkStatus,
): ShareLinkRecord | null {
  const records = readShareLinks(walletAddress);
  const index = records.findIndex(item => item.token === token);

  if (index < 0) {
    return null;
  }

  const updated: ShareLinkRecord = {
    ...records[index],
    status,
  };

  records[index] = updated;
  writeShareLinks(walletAddress, records);
  return updated;
}

export function markShareLinkViewed(
  walletAddress: string,
  token: string,
): ShareLinkRecord | null {
  const records = readShareLinks(walletAddress);
  const index = records.findIndex(item => item.token === token);

  if (index < 0) {
    return null;
  }

  const updated: ShareLinkRecord = {
    ...records[index],
    lastViewedAt: new Date().toISOString(),
  };

  records[index] = updated;
  writeShareLinks(walletAddress, records);
  return updated;
}

export function findShareLink(
  walletAddress: string,
  token: string,
): ShareLinkRecord | null {
  const records = readShareLinks(walletAddress);
  return records.find(item => item.token === token) ?? null;
}