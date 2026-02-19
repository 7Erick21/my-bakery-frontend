/**
 * Delete images from Cloudinary by their URLs.
 * Best-effort: silently continues if any deletion fails.
 */
export async function deleteCloudinaryImages(urls: string[]) {
  if (urls.length === 0) return;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return;

  const { createHash } = await import('node:crypto');

  for (const url of urls) {
    try {
      // Extract public_id from Cloudinary URL
      // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{filename}.{ext}
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
      if (!match) continue;

      const publicId = match[1];
      const timestamp = Math.round(Date.now() / 1000);
      const signature = createHash('sha1')
        .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
        .digest('hex');

      await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: publicId,
          api_key: apiKey,
          timestamp,
          signature
        })
      });
    } catch {
      // Silently continue — image cleanup is best-effort
    }
  }
}
