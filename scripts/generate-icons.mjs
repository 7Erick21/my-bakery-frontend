import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const source = join(root, 'public', 'my-bakery-logo.jpg');
const outDir = join(root, 'public', 'icons');

await mkdir(outDir, { recursive: true });

const sizes = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

for (const { name, size } of sizes) {
  await sharp(source)
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(join(outDir, name));

  console.log(`Generated ${name} (${size}x${size})`);
}

console.log('Done!');
