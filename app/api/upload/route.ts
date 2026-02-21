import { type NextRequest, NextResponse } from 'next/server';

import { getSession } from '@/lib/auth/helpers';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.round(Date.now() / 1000);
  const folder = (formData.get('folder') as string) || 'my-bakery';

  const { createHash } = await import('node:crypto');
  const signature = createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  const uploadData = new FormData();
  uploadData.append('file', file);
  uploadData.append('api_key', apiKey);
  uploadData.append('timestamp', String(timestamp));
  uploadData.append('signature', signature);
  uploadData.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: uploadData
  });

  if (!res.ok) {
    const error = await res.text();
    return NextResponse.json({ error }, { status: res.status });
  }

  const result = await res.json();

  return NextResponse.json({
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height
  });
}
