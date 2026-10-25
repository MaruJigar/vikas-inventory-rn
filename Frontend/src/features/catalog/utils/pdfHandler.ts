import { Platform, Linking, Share } from 'react-native';
import { API_BASE_URL } from '@/api/client';
import { notify } from '@/lib/dialog';

// Use conditionally to avoid bundling issues on web
let FileSystem: any;
let Sharing: any;
if (Platform.OS !== 'web') {
  try {
    FileSystem = require('expo-file-system/legacy');
    Sharing = require('expo-sharing');
  } catch {
    // Graceful fallback if native modules are not linked
  }
}

/** Formats byte counts into readable KB / MB strings. */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Formats ISO dates into local DD/MM/YYYY. */
export function formatDate(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/** Resolves relative PDF URLs against API_BASE_URL (stripping trailing /v1 if already in path). */
export function getAbsolutePdfUrl(relativeOrAbsoluteUrl: string): string {
  if (!relativeOrAbsoluteUrl) return '';
  if (
    relativeOrAbsoluteUrl.startsWith('http://') ||
    relativeOrAbsoluteUrl.startsWith('https://')
  ) {
    return relativeOrAbsoluteUrl;
  }

  // API_BASE_URL usually contains e.g. 'http://localhost:3000/v1'
  // and relativeOrAbsoluteUrl is '/v1/catalogues/:id/file'
  const root = API_BASE_URL.replace(/\/v1\/?$/, '');
  const cleanPath = relativeOrAbsoluteUrl.startsWith('/')
    ? relativeOrAbsoluteUrl
    : `/${relativeOrAbsoluteUrl}`;
  return `${root}${cleanPath}`;
}

/**
 * Open PDF Action:
 * - On Web: Opens PDF in new tab.
 * - On Mobile: Opens in device browser or system PDF viewer via Linking.
 */
export async function openCataloguePdf(
  pdfUrl: string,
  fileName: string,
): Promise<void> {
  const fullUrl = getAbsolutePdfUrl(pdfUrl);
  if (!fullUrl) throw new Error('Invalid PDF URL');

  if (Platform.OS === 'web') {
    const w = globalThis as { open?: (url: string, target?: string) => void };
    if (w.open) {
      w.open(fullUrl, '_blank');
      return;
    }
  }

  const supported = await Linking.canOpenURL(fullUrl);
  if (supported) {
    await Linking.openURL(fullUrl);
  } else {
    // If Linking cannot open directly, attempt download and share/open locally
    await downloadAndSharePdf(fullUrl, fileName, 'open');
  }
}

/**
 * Download PDF Action:
 * - On Web: Triggers anchor download.
 * - On Mobile: Downloads to cache/documents directory and notifies user.
 */
export async function downloadCataloguePdf(
  downloadUrl: string,
  fileName: string,
): Promise<string | null> {
  const fullUrl = getAbsolutePdfUrl(downloadUrl);
  if (!fullUrl) throw new Error('Invalid download URL');

  if (Platform.OS === 'web') {
    const doc = globalThis.document;
    if (doc) {
      const link = doc.createElement('a');
      link.href = fullUrl;
      link.download = fileName || 'catalogue.pdf';
      doc.body.appendChild(link);
      link.click();
      doc.body.removeChild(link);
      return fullUrl;
    }
  }

  if (!FileSystem) {
    await Linking.openURL(fullUrl);
    return fullUrl;
  }

  const safeFileName = (fileName || 'catalogue.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
  const targetDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
  const fileUri = `${targetDir}${safeFileName}`;

  const { uri } = await FileSystem.downloadAsync(fullUrl, fileUri);
  return uri;
}

/**
 * Share PDF Action:
 * - Downloads file locally and opens native share sheet with the actual PDF file.
 * - Falls back to React Native's Share.share with the public URL if native sharing is unavailable.
 */
export async function shareCataloguePdf(
  pdfUrl: string,
  fileName: string,
  manufacturerName: string,
): Promise<void> {
  const fullUrl = getAbsolutePdfUrl(pdfUrl);

  if (Platform.OS === 'web') {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${manufacturerName} Catalogue`,
          text: `Check out the catalogue for ${manufacturerName}`,
          url: fullUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User cancelled
      }
    }
    // Fallback: Copy to clipboard or prompt
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(fullUrl);
      notify('Catalogue URL copied to clipboard');
      return;
    }
    notify(fullUrl, `${manufacturerName} Catalogue URL`);
    return;
  }

  try {
    if (FileSystem && Sharing) {
      const safeFileName = (fileName || 'catalogue.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
      const targetDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
      const localFileUri = `${targetDir}${safeFileName}`;

      const { uri } = await FileSystem.downloadAsync(fullUrl, localFileUri);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${manufacturerName} Catalogue`,
          UTI: 'com.adobe.pdf',
        });
        return;
      }
    }

    // Fallback to React Native Share API with public URL
    await Share.share({
      title: `${manufacturerName} Catalogue`,
      message: `${manufacturerName} Catalogue: ${fullUrl}`,
      url: fullUrl,
    });
  } catch (error: any) {
    if (error?.message?.includes('User did not share')) return;
    throw error;
  }
}

async function downloadAndSharePdf(
  fullUrl: string,
  fileName: string,
  action: 'open' | 'share',
) {
  if (FileSystem && Sharing) {
    const safeFileName = (fileName || 'catalogue.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    const targetDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
    const localFileUri = `${targetDir}${safeFileName}`;
    const { uri } = await FileSystem.downloadAsync(fullUrl, localFileUri);
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    });
  }
}
