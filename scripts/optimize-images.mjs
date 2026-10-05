import { mkdir, readdir } from 'node:fs/promises';
import { extname, join, parse } from 'node:path';
import sharp from 'sharp';

const source = new URL('../public/uploads/', import.meta.url);
const destination = new URL('../public/images/', import.meta.url);

await mkdir(destination, { recursive: true });

for (const file of await readdir(source)) {
  if (!['.jpg', '.jpeg', '.png'].includes(extname(file).toLowerCase())) continue;
  const output = `${parse(file).name}.webp`;
  await sharp(join(source.pathname, file))
    .rotate()
    .resize({ width: file.startsWith('about-') ? 1000 : 1800, withoutEnlargement: true })
    .webp({ quality: 84, effort: 5 })
    .toFile(join(destination.pathname, output));
  console.log(`${file} → ${output}`);
}
