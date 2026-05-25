/**
 * portUtils.ts
 * Utilitaires synchrones de détection de port pour playwright.config.ts.
 *
 * Pourquoi synchrone ?
 *   playwright.config.ts est un fichier de configuration chargé de façon
 *   synchrone par Playwright. On ne peut pas y utiliser await.
 *   On délègue les vérifications réseau à des sous-processus Node.js
 *   via execFileSync, ce qui les rend bloquantes depuis le processus parent.
 *
 * Flux de détection (findBackendPort) :
 *   Pour chaque port candidat (3000, 3001, 3002, 3003) :
 *   1. Le backend ClubManager est-il déjà actif ici ?  → le réutiliser
 *   2. Le port est-il libre ?                          → le backend démarrera ici
 *   3. Occupé par autre chose                          → essayer le suivant
 */

import { execFileSync } from "child_process";

// ─── Vérification de port libre ────────────────────────────────────────────────

/**
 * Vérifie de façon synchrone si un port TCP est libre.
 *
 * Lance un sous-processus Node.js qui tente d'écouter sur le port.
 * Si ça réussit → port libre (exit 0).
 * Si EADDRINUSE  → port occupé (exit 1).
 */
export function isPortFree(port: number): boolean {
  try {
    execFileSync(
      process.execPath,
      [
        "-e",
        // CJS inline : pas besoin de --input-type=module
        `var n=require('net');` +
          `var s=n.createServer();` +
          `s.listen(${port},function(){s.close(function(){process.exit(0)})});` +
          `s.on('error',function(){process.exit(1)});`,
      ],
      { timeout: 2_000, stdio: "ignore" },
    );
    return true; // exit 0 → port disponible
  } catch {
    return false; // exit non-0 ou timeout → port occupé
  }
}

// ─── Identification du backend ClubManager ────────────────────────────────────

/**
 * Vérifie de façon synchrone si le backend ClubManager écoute sur ce port.
 *
 * Identifiant : GET /health → { success: true, message: "…ClubManager…" }
 * (réponse spécifique à ce projet, différente des autres serveurs Express)
 */
export function isClubManagerRunning(port: number): boolean {
  try {
    execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        // ESM inline pour top-level await + fetch natif (Node 18+)
        `const r=await fetch('http://localhost:${port}/health',` +
          `{signal:AbortSignal.timeout(1500)}).catch(()=>null);` +
          `if(!r?.ok)process.exit(1);` +
          `const d=await r.json().catch(()=>null);` +
          `process.exit(` +
          `  d&&d.success===true&&` +
          `  typeof d.message==='string'&&` +
          `  d.message.includes('ClubManager')` +
          `?0:1);`,
      ],
      { timeout: 3_000, stdio: "ignore" },
    );
    return true;
  } catch {
    return false;
  }
}

// ─── Détection d'un port frontend libre ─────────────────────────────────────

/**
 * Détermine automatiquement le port sur lequel le frontend e2e doit démarrer.
 *
 * Priorité : lire process.env.E2E_FRONTEND_PORT si déjà défini (cache workers),
 * sinon chercher le premier port libre à partir de startFrom (5173 par défaut).
 *
 * @param startFrom  Premier port à tester (défaut : 5173)
 */
export function findFrontendPort(startFrom = 5173): number {
  // Cache : défini par playwright.config.ts sur le processus principal,
  // hérité par les workers sans re-détection.
  if (process.env.E2E_FRONTEND_PORT) {
    const cached = parseInt(process.env.E2E_FRONTEND_PORT, 10);
    if (!isNaN(cached)) {
      console.log(`[e2e] 📌 E2E_FRONTEND_PORT déjà défini : ${cached}`);
      return cached;
    }
  }

  const candidates = [startFrom, startFrom + 1, startFrom + 2, startFrom + 3];

  for (const port of candidates) {
    if (isPortFree(port)) {
      console.log(
        `[e2e] ✅ Port frontend ${port} disponible — le frontend démarrera ici`,
      );
      return port;
    }
    console.log(`[e2e] ⚠️  Port frontend ${port} occupé — essai du suivant…`);
  }

  console.warn(
    `[e2e] ⚠️  Tous les ports frontend candidats occupés — repli sur ${
      startFrom + 1
    }`,
  );
  return startFrom + 1;
}

// ─── Sélection du port optimal backend ───────────────────────────────────────

/**
 * Détermine automatiquement le port sur lequel le backend doit démarrer.
 *
 * Permet de coexister avec d'autres serveurs Node.js (ex : autres projets)
 * qui occuperaient déjà le port 3000.
 *
 * Override manuel possible via la variable d'environnement BACKEND_PORT.
 *
 * @returns Numéro de port (ex: 3000, 3001, …)
 */
export function findBackendPort(): number {
  // Override manuel (CI, cas particulier)
  if (process.env.BACKEND_PORT) {
    const forced = parseInt(process.env.BACKEND_PORT, 10);
    if (!isNaN(forced)) {
      console.log(`[e2e] 📌 BACKEND_PORT forcé via env : ${forced}`);
      return forced;
    }
  }

  const candidates = [3000, 3001, 3002, 3003];

  for (const port of candidates) {
    // Priorité 1 : ClubManager déjà actif → réutiliser
    if (isClubManagerRunning(port)) {
      console.log(
        `[e2e] ♻️  Backend ClubManager détecté sur le port ${port} — réutilisation`,
      );
      return port;
    }

    // Priorité 2 : port libre → le backend sera démarré ici par Playwright
    if (isPortFree(port)) {
      console.log(
        `[e2e] ✅ Port ${port} disponible — le backend démarrera ici`,
      );
      return port;
    }

    console.log(
      `[e2e] ⚠️  Port ${port} occupé par un autre processus — essai du suivant…`,
    );
  }

  console.warn(
    "[e2e] ⚠️  Tous les ports candidats (3000-3003) sont occupés — repli sur 3001",
  );
  return 3001;
}
