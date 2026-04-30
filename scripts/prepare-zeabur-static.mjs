import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const distDir = join(rootDir, 'dist');
const h5Dir = join(distDir, 'build', 'h5');

if (!existsSync(h5Dir)) {
  throw new Error(`H5 build output not found: ${h5Dir}`);
}

for (const entry of readdirSync(distDir)) {
  if (entry === 'build') {
    continue;
  }
  rmSync(join(distDir, entry), { recursive: true, force: true });
}

mkdirSync(distDir, { recursive: true });

for (const entry of readdirSync(h5Dir)) {
  cpSync(join(h5Dir, entry), join(distDir, entry), {
    recursive: true,
    force: true
  });
}

console.log('Prepared Zeabur static output in dist/');
