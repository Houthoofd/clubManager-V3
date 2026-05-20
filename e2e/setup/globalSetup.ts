/**
 * globalSetup.ts
 * Exécuté UNE FOIS avant tous les tests Playwright.
 *
 * Responsabilités :
 *   1. Charger les variables d'env depuis backend/.env
 *   2. Créer le dossier setup/.auth/ si nécessaire
 *   3. Appeler POST /api/auth/login pour chaque compte E2E
 *   4. Persister le storageState (cookies + localStorage) dans setup/.auth/*.json
 *
 * ⚠️  Pré-requis avant d'exécuter :
 *   - Backend démarré sur http://localhost:3000
 *   - Frontend démarré sur http://localhost:5173
 *   - Comptes E2E créés en DB via : pnpm --filter @clubmanager/e2e seed
 *
 * Format storageState généré :
 *   {
 *     cookies: [],
 *     origins: [{
 *       origin: "http://localhost:5173",
 *       localStorage: [
 *         { name: "accessToken",   value: "<jwt>" },
 *         { name: "user",          value: "<JSON>" },
 *         { name: "auth-storage",  value: "<zustand JSON>" }
 *       ]
 *     }]
 *   }
 */

import { type FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { E2E_DB_USER_IDS } from './e2e-credentials.js';

// ============================================================
// 1. Charger les variables d'environnement
// ============================================================
const envPath = path.resolve(__dirname, '../../backend/.env');
dotenv.config({ path: envPath });

// ============================================================
// Constantes
// ============================================================
const BACKEND_URL  = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';
const AUTH_DIR     = path.join(__dirname, '.auth');

// Credentials : on utilise les userId au format U-9999-XXXX (valides pour le LoginUseCase)
// et les mots de passe définis dans e2e-credentials.ts
const ACCOUNTS = [
  {
    role:     'admin'     as const,
    userId:   E2E_DB_USER_IDS.admin,
    password: 'Admin@E2E2024!',
  },
  {
    role:     'member'    as const,
    userId:   E2E_DB_USER_IDS.member,
    password: 'Member@E2E2024!',
  },
  {
    role:     'professor' as const,
    userId:   E2E_DB_USER_IDS.professor,
    password: 'Prof@E2E2024!',
  },
] as const;

// ============================================================
// Helper : login + construction du storageState
// ============================================================
async function loginAndSaveState(
  role: 'admin' | 'member' | 'professor',
  userId: string,
  password: string,
): Promise<void> {
  // Appel API login (fetch natif Node 18+)
  const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ userId, password }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '(pas de body)');
    throw new Error(
      `❌ Login ${userId} failed (HTTP ${response.status}) — ` +
      `run \`pnpm --filter @clubmanager/e2e seed\` first.\n` +
      `   Réponse serveur : ${body}`,
    );
  }

  // Extraire accessToken + user depuis response.data
  const json = await response.json() as {
    success: boolean;
    data: {
      user: Record<string, unknown>;
      tokens: { accessToken: string; refreshToken: string };
    };
  };

  const { accessToken } = json.data.tokens;
  const user            = json.data.user;

  // Construire le storageState Playwright
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: FRONTEND_URL,
        localStorage: [
          {
            name:  'accessToken',
            value: accessToken,
          },
          {
            name:  'user',
            value: JSON.stringify(user),
          },
          {
            // Zustand persist : clé "auth-storage"
            // Format : { state: { user, isAuthenticated: true }, version: 0 }
            name:  'auth-storage',
            value: JSON.stringify({
              state:   { user, isAuthenticated: true },
              version: 0,
            }),
          },
        ],
      },
    ],
  };

  // Écrire dans setup/.auth/{role}.json
  const outPath = path.join(AUTH_DIR, `${role}.json`);
  fs.writeFileSync(outPath, JSON.stringify(storageState, null, 2), 'utf-8');
  console.log(`   ✓ storageState écrit : setup/.auth/${role}.json`);
}

// ============================================================
// Export par défaut — exécuté par Playwright avant tous les tests
// ============================================================
export default async function globalSetup(_config: FullConfig): Promise<void> {
  console.log('\n🚀 E2E Global Setup — authentification des comptes de test\n');

  // 2. Créer le dossier .auth s'il n'existe pas
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  // 3. Login pour chaque compte
  for (const account of ACCOUNTS) {
    console.log(`🔐 Login pour le rôle "${account.role}" (userId: ${account.userId})...`);
    try {
      await loginAndSaveState(account.role, account.userId, account.password);
    } catch (err) {
      // Afficher le message d'erreur clair et propager
      console.error((err as Error).message);
      throw err;
    }
  }

  // 4. Confirmation finale
  console.log('\n✅ E2E auth state saved for admin, member, professor\n');
}
