import { writeFileSync, cpSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });
cpSync(join(__dirname, 'game'), join(OUTPUT_DIR, 'game'), { recursive: true });

try {
  cpSync(join(__dirname, 'screenshots'), join(OUTPUT_DIR, 'screenshots'), { recursive: true });
} catch {}

const dossier = buildDossier(OUTPUT_DIR, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
console.log('Dossier generated.');
