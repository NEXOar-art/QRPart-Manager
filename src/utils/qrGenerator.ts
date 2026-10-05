import QRCode from 'qrcode';

export async function generateQrDataUrl(text: string, size = 300): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

/**
 * Encodes piece payload into standardized QR content:
 * e.g. "QRPARTS:DES-0248" or direct link / json
 */
export function formatPartQrPayload(partId: string): string {
  return `QRPARTS:${partId}`;
}

export function formatShelfQrPayload(shelfId: string): string {
  return `QRSHELF:${shelfId}`;
}

export function parseQrPayload(raw: string): { type: 'part' | 'shelf' | 'unknown'; id: string } {
  const trimmed = raw.trim();
  if (trimmed.startsWith('QRPARTS:')) {
    return { type: 'part', id: trimmed.replace('QRPARTS:', '').trim() };
  }
  if (trimmed.startsWith('QRSHELF:')) {
    return { type: 'shelf', id: trimmed.replace('QRSHELF:', '').trim() };
  }
  // Check if it's already an ID like DES-0248
  if (/^DES-\d+/i.test(trimmed)) {
    return { type: 'part', id: trimmed.toUpperCase() };
  }
  if (/^Estante/i.test(trimmed)) {
    return { type: 'shelf', id: trimmed };
  }
  return { type: 'unknown', id: trimmed };
}
