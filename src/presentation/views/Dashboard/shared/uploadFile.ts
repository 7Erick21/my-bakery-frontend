/**
 * Upload a file to Cloudinary via /api/upload.
 * Returns the Cloudinary URL.
 */
export async function uploadFile(file: File, folder = 'my-bakery'): Promise<string> {
  const formData = new FormData();
  formData.set('file', file);
  formData.set('folder', folder);

  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');

  const data = await res.json();
  return data.url;
}
