import { createSimpleFileStorage } from './simpleFileStorage';

/**
 * Opens a credential file in a new browser tab from IndexedDB storage.
 * Used by recruiters to preview verified credentials on public profiles.
 */
export async function previewCredentialFile(
  walletAddress: string,
  credentialId: string,
  fileName: string,
  fileType: string
): Promise<void> {
  try {
    // Get the file from IndexedDB
    const walletDbName = `CredentialFiles_${walletAddress}`;
    const fileStorage = await createSimpleFileStorage(walletDbName);
    
    // Build the storage key using the same pattern as storage.ts
    const fileKey = `credvault_${walletAddress}_file_${credentialId}`;
    const blob = await fileStorage.get(fileKey);

    if (!blob) {
      console.error('File not found in storage');
      alert('File preview is not available.');
      return;
    }

    // Create a blob URL and open in new tab
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    
    // If it's a PDF or image, open in new tab; otherwise download
    if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
      window.open(blobUrl, '_blank');
    } else {
      // For other file types, trigger a download
      link.download = fileName || 'credential-file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Clean up the blob URL after a short delay to allow the browser to use it
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error('Failed to preview credential file:', error);
    alert('Failed to open file preview.');
  }
}
