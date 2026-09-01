/**
 * ACEDEP Image Optimizer Utility
 * Automatically compresses, scales, and cleans uploaded images (avatars, banners, gallery photos)
 * so they save cleanly in Firestore (< 200KB) and load instantly across all devices.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number; // target max characters for base64 string
}

export async function optimizeImage(
  input: string | File,
  options: OptimizeImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 900,
    maxHeight = 900,
    quality = 0.70,
    maxSizeBytes = 220 * 1024, // 220 KB safe ceiling for Firestore documents
  } = options;

  // 1. Convert File to Data URL if needed
  let dataUrl: string;
  if (typeof input !== 'string') {
    dataUrl = await fileToDataUrl(input);
  } else {
    dataUrl = input;
  }

  // If not a data URL (e.g. standard http/https link or static path), return as is
  if (!dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scale
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve(dataUrl);
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let currentQuality = quality;
        let result = canvas.toDataURL('image/jpeg', currentQuality);

        // Iterative reduction if base64 size still exceeds target limit
        let attempts = 0;
        while (result.length > maxSizeBytes && attempts < 4) {
          attempts++;
          const scale = 0.8;
          width = Math.max(100, Math.round(width * scale));
          height = Math.max(100, Math.round(height * scale));
          currentQuality = Math.max(0.45, currentQuality - 0.1);

          canvas.width = width;
          canvas.height = height;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          result = canvas.toDataURL('image/jpeg', currentQuality);
        }

        resolve(result);
      } catch (err) {
        console.warn('Image optimization canvas error, returning original:', err);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      console.warn('Image failed to load in optimization, returning input');
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
