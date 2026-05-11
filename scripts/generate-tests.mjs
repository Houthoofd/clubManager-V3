#!/usr/bin/env node
/**
 * generate-tests.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Point d'entrée CLI de @clubmanager/test-generator.
 *
 * Ce fichier est le wrapper CLI thin : il parse les arguments, fusionne les
 * options avec la config du projet, puis délègue tout à l'engine.
 *
 * Quand @clubmanager/test-generator devient un package npm, ce fichier
 * reste dans le projet consommateur (avec generate-tests.config.mjs).
 *
 * Usage :
 *   node scripts/generate-tests.mjs [options]
 *   pnpm generate:tests
 *   pnpm generate:tests:dry
 *
 * Options :
 *   --workspace=backend|frontend|all   (défaut: all)
 *   --module=<nom>                     (ex: --module=alerts)
 *   --sprint=1|2|all                   (défaut: all)
 *   --dry-run                          Simulation sans écriture
 *   --force                            Écrase les tests existants
 *   --verbose                          Logs détaillés
 *   --help, -h                         Affiche l'aide
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { parseArgs, printHelp } from './core/cli.mjs';
import { generateTests }        from './core/engine.mjs';
import { config as baseConfig } from './generate-tests.config.mjs';

// ─── Parse les arguments CLI ──────────────────────────────────────────────────

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

// ─── Fusion config + options CLI ─────────────────────────────────────────────
//
// Les options CLI ont la priorité sur les valeurs de la config de base.
// Les propriétés backend/frontend viennent de la config — jamais du CLI.

/** @type {import('./core/types.mjs').GeneratorConfig} */
const config = {
  ...baseConfig,
  workspace:    options.workspace,
  module:       options.module,
  sprint:       options.sprint,
  dryRun:       options.dryRun,
  force:        options.force,
  skipExisting: options.skipExisting,
  verbose:      options.verbose,
};

// ─── Exécution ────────────────────────────────────────────────────────────────

try {
  await generateTests(config);
} catch (err) {
  console.error('\n❌ Erreur fatale :', err.message);
  if (options.verbose) console.error(err.stack);
  process.exit(1);
}
