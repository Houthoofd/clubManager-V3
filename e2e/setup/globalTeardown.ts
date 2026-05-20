import { FullConfig } from '@playwright/test';

export default async function globalTeardown(_config: FullConfig) {
  console.log('🧹 E2E teardown complete.');
  // Les fichiers .auth/*.json sont conservés pour debug.
  // Les supprimer ici si on veut forcer un re-login à chaque run :
  // import fs from 'fs';
  // import path from 'path';
  // fs.rmSync(path.join(__dirname, '.auth'), { recursive: true, force: true });
}
