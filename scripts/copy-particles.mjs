import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(projectRoot, 'node_modules/particles.js/particles.js');
const destinationDirectory = resolve(projectRoot, 'public/vendor');
const destination = resolve(destinationDirectory, 'particles.min.js');

await mkdir(destinationDirectory, { recursive: true });
await copyFile(source, destination);
