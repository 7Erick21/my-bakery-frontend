const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

interface TransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
}

export function cloudinaryUrl(publicIdOrUrl: string, options: TransformOptions = {}): string {
  const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options;

  // If it's already a full URL, extract the public ID
  const isUrl = publicIdOrUrl.startsWith('http');
  if (!isUrl && !CLOUD_NAME) return publicIdOrUrl;

  if (isUrl) {
    // For full URLs, insert transformations
    const transforms: string[] = [];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (width || height) transforms.push(`c_${crop}`);
    transforms.push(`q_${quality}`);
    transforms.push(`f_${format}`);

    const transformStr = transforms.join(',');
    return publicIdOrUrl.replace('/upload/', `/upload/${transformStr}/`);
  }

  // Build URL from public ID
  const transforms: string[] = [];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);

  const transformStr = transforms.join(',');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}/${publicIdOrUrl}`;
}
