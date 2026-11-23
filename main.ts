// Build the make.fun hand-in directory for EMBER HARBOR.
// Node 22 standard library only: copy game/ and screenshots/, then emit dossier.json.

import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier, type DossierCaps } from './vendor/makefun-game.ts';

const here = resolve(fileURLToPath(new URL('.', import.meta.url)));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

// The bounty's published limits, expressed as buildDossier caps.
const caps: DossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

mkdirSync(output, { recursive: true });
cpSync(join(here, 'game'), join(output, 'game'), { recursive: true });
cpSync(join(here, 'screenshots'), join(output, 'screenshots'), { recursive: true });

const dossier = buildDossier(output, caps);
writeFileSync(join(output, 'dossier.json'), dossier);
console.log(`EMBER HARBOR hand-in written to ${output} (${dossier.byteLength} dossier bytes)`);
