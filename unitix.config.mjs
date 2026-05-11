/**
 * unitix.config.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Configuration Unitix pour ClubManager V3.
 *
 * Usage :
 *   npx unitix --dry-run
 *   pnpm generate:tests
 *
 * @type {import('@houthoofd/unitix').GeneratorConfig}
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { resolve, dirname } from 'path';
import { fileURLToPath }    from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Racine absolue du projet (ce fichier est à la racine) */
const ROOT = __dirname;

export const config = {
  projectRoot: ROOT,

  // ─── Backend ──────────────────────────────────────────────────────────────
  backend: {
    modulesDir:      resolve(ROOT, 'backend/src/modules'),
    useCasesGlob:    'application/use-cases',
    repositoriesDir: 'domain/repositories',
    testFramework:     'jest',
    testFileExtension: '.test.ts',
    importAliases: {
      '@/':                resolve(ROOT, 'backend/src') + '/',
      '@clubmanager/types': resolve(ROOT, 'packages/types/src/index.ts'),
    },
  },

  // ─── Frontend ─────────────────────────────────────────────────────────────
  frontend: {
    featuresDir:         resolve(ROOT, 'frontend/src/features'),
    sharedComponentsDir: resolve(ROOT, 'frontend/src/shared/components'),
    hooksPattern:        'hooks',
    componentsPattern:   'components',
    testFramework:           'vitest',
    testFileExtension:       '.test.tsx',
    hookTestFileExtension:   '.test.ts',
    renderHelper: {
      name:       'renderWithProviders',
      importPath: '@/shared/test/renderWithProviders',
    },
    setupFile: resolve(ROOT, 'frontend/src/shared/test/setup.ts'),
  },
};
