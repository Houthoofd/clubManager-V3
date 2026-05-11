/**
 * generate-tests.config.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Configuration spécifique à ClubManager V3.
 *
 * Ce fichier EST la colle entre le projet et le core générique.
 * Quand @clubmanager/test-generator devient un package npm, ce fichier
 * reste dans le projet consommateur et importe depuis le package :
 *
 *   import { generateTests } from '@clubmanager/test-generator';
 *   import { config } from './generate-tests.config.mjs';
 *   await generateTests(config);
 *
 * @type {import('./core/types.mjs').GeneratorConfig}
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

/** Racine absolue du projet (un niveau au-dessus de scripts/) */
const ROOT = resolve(__dirname, '..');

export const config = {
  projectRoot: ROOT,

  // ─── Backend ──────────────────────────────────────────────────────────────
  backend: {
    /** Chemin absolu vers backend/src/modules */
    modulesDir: resolve(ROOT, 'backend/src/modules'),

    /** Sous-chemin relatif depuis un module jusqu'au dossier use-cases */
    useCasesGlob: 'application/use-cases',

    /** Sous-chemin relatif depuis un module jusqu'aux interfaces repository */
    repositoriesDir: 'domain/repositories',

    testFramework:     'jest',
    testFileExtension: '.test.ts',

    /**
     * Alias d'imports utilisés dans le backend.
     * Clé = préfixe d'alias, Valeur = chemin absolu de remplacement.
     * Utilisé par les generators pour réécrire les imports dans les stubs.
     */
    importAliases: {
      '@/':               resolve(ROOT, 'backend/src') + '/',
      '@clubmanager/types': resolve(ROOT, 'packages/types/src/index.ts'),
    },
  },

  // ─── Frontend ─────────────────────────────────────────────────────────────
  frontend: {
    /** Chemin absolu vers frontend/src/features */
    featuresDir: resolve(ROOT, 'frontend/src/features'),

    /** Chemin absolu vers frontend/src/shared/components */
    sharedComponentsDir: resolve(ROOT, 'frontend/src/shared/components'),

    hooksPattern:      'hooks',
    componentsPattern: 'components',

    testFramework:          'vitest',
    testFileExtension:      '.test.tsx',
    hookTestFileExtension:  '.test.ts',

    /**
     * Wrapper de rendu injecté dans chaque test de composant.
     * name       = nom de la fonction importée
     * importPath = chemin d'import (relatif ou alias)
     */
    renderHelper: {
      name:       'renderWithProviders',
      importPath: '@/shared/test/renderWithProviders',
    },

    /** Fichier de setup Vitest (sera généré en Sprint Tests 2) */
    setupFile: resolve(ROOT, 'frontend/src/shared/test/setup.ts'),
  },
};
