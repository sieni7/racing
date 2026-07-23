import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../public/icons');
const svg = readFileSync(resolve(outDir, 'icon.svg'));

for (const size of [192, 512]) {
  await sharp(svg).resize(size, size).png().toFile(resolve(outDir, `icon-${size}.png`));
  console.log(`Created icon-${size}.png`);
}
