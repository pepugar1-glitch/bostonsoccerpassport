const MAX_SIDE = 1024;
const JPEG_QUALITY = 0.78;

export async function compressImage(file: File): Promise<string> {
  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);
  const { width, height } = scaleDown(img.naturalWidth, img.naturalHeight, MAX_SIDE);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image-load-failed'));
    img.src = src;
  });
}

function scaleDown(w: number, h: number, maxSide: number) {
  if (w <= maxSide && h <= maxSide) return { width: w, height: h };
  const ratio = w > h ? maxSide / w : maxSide / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

export function estimateDataUrlBytes(dataUrl: string) {
  const commaAt = dataUrl.indexOf(',');
  const b64 = commaAt >= 0 ? dataUrl.slice(commaAt + 1) : dataUrl;
  return Math.floor((b64.length * 3) / 4);
}
