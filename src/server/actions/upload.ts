'use server';

import { requireRole } from '@/lib/auth/helpers';

export async function getUploadSignature() {
  await requireRole(['admin', 'super_admin', 'marketing']);

  const timestamp = Math.round(Date.now() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

  // Create signature for Cloudinary upload
  const params = `timestamp=${timestamp}&upload_preset=my_bakery`;
  const { createHash } = await import('node:crypto');
  const signature = createHash('sha1').update(`${params}${apiSecret}`).digest('hex');

  return {
    signature,
    timestamp,
    apiKey,
    cloudName
  };
}
