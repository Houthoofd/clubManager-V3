/**
 * seed-e2e.ts
 * Script autonome — crée les comptes de test E2E dans clubmanager_test.
 *
 * Usage :
 *   pnpm --filter @clubmanager/e2e seed
 *   # ou directement :
 *   npx tsx setup/seed-e2e.ts
 *
 * ⚠️  PRÉREQUIS :
 *   1. Le serveur MySQL doit être démarré.
 *   2. La base `clubmanager_test` doit exister et avoir le schéma appliqué.
 *   3. Les variables d'env DB_HOST, DB_PORT, DB_USER, DB_PASSWORD doivent
 *      être renseignées dans backend/.env (ce script les charge automatiquement).
 *
 * ⚠️  COLONNE userId : Ce script insère les comptes avec le format
 *   U-9999-XXXX (ex: U-9999-0001) qui respecte le CHECK constraint MySQL
 *   et la validation du LoginUseCase (`/^U-\d{4}-\d{4}$/`).
 *   Si votre DB de test n'a pas ce CHECK constraint, vous pouvez adapter
 *   les E2E_DB_USER_IDS dans e2e-credentials.ts.
 */

import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import {
  E2E_ADMIN,
  E2E_MEMBER,
  E2E_PROFESSOR,
  ROLE_DB_MAP,
  E2E_DB_USER_IDS,
  type E2ERole,
} from './e2e-credentials.js';

// ============================================================
// 1. Charger les variables d'environnement depuis backend/.env
// ============================================================
const envPath = path.resolve(__dirname, '../../backend/.env');
dotenv.config({ path: envPath });

const DB_CONFIG = {
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     Number(process.env.DB_PORT ?? 3306),
  user:     process.env.DB_USER     ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: 'clubmanager_test',
};

// ============================================================
// Helpers
// ============================================================
const SALT_ROUNDS = 10;

/** Affiche les paramètres de connexion (sans mot de passe) */
function printConfig(): void {
  console.log('📌 DB Config:', {
    host:     DB_CONFIG.host,
    port:     DB_CONFIG.port,
    user:     DB_CONFIG.user,
    database: DB_CONFIG.database,
  });
}

// ============================================================
// 2. Script principal
// ============================================================
async function seedE2E(): Promise<void> {
  printConfig();

  const connection = await mysql.createConnection(DB_CONFIG);
  console.log('✅ Connexion MySQL établie\n');

  try {
    // ----------------------------------------------------------
    // 3. Garantir les données FK requises
    //    On utilise INSERT IGNORE pour ne pas écraser l'existant.
    // ----------------------------------------------------------
    console.log('🔧 Vérification des données FK (status, genre, grade)...');

    // status id=1 → "actif"
    await connection.execute(
      `INSERT IGNORE INTO status (id, nom, description)
       VALUES (1, 'actif', 'Compte actif')`,
    );

    // genre id=1 → "Non spécifié"
    await connection.execute(
      `INSERT IGNORE INTO genres (id, nom)
       VALUES (1, 'Non spécifié')`,
    );

    // grade id=1 → "Blanche" ordre=0
    await connection.execute(
      `INSERT IGNORE INTO grades (id, nom, ordre, couleur)
       VALUES (1, 'Blanche', 0, 'white')`,
    );

    console.log('   ✓ FK data OK\n');

    // ----------------------------------------------------------
    // 4. Insérer / mettre à jour les comptes E2E
    // ----------------------------------------------------------
    const accounts = [
      { cred: E2E_ADMIN,     dbUserId: E2E_DB_USER_IDS.admin     },
      { cred: E2E_MEMBER,    dbUserId: E2E_DB_USER_IDS.member    },
      { cred: E2E_PROFESSOR, dbUserId: E2E_DB_USER_IDS.professor },
    ] as const;

    for (const { cred, dbUserId } of accounts) {
      console.log(`👤 Traitement du compte : ${cred.userId} (DB userId: ${dbUserId})`);

      // Hash du mot de passe
      const passwordHash = await bcrypt.hash(cred.password, SALT_ROUNDS);
      console.log(`   ✓ Password hashé (bcrypt, ${SALT_ROUNDS} rounds)`);

      // Mapping du rôle E2E vers la valeur ENUM MySQL
      const dbRole = ROLE_DB_MAP[cred.role_app as E2ERole];

      // INSERT ... ON DUPLICATE KEY UPDATE
      // Colonnes :
      //   userId        → identifiant unique format U-YYYY-XXXX (utilisé pour login)
      //   email         → email unique (utilisé pour identifier le compte en DB)
      //   password      → hash bcrypt (NB: colonne "password" et non "password_hash")
      //   first_name    → prénom
      //   last_name     → nom
      //   role_app      → rôle ENUM ('admin' | 'member' | 'professor')
      //   status_id     → FK vers status (1 = actif)
      //   genre_id      → FK vers genres (1 = Non spécifié)
      //   grade_id      → FK vers grades (1 = Blanche)
      //   email_verified → 1 (obligatoire pour pouvoir se connecter via LoginUseCase)
      //   active        → 1
      //   peut_se_connecter → 1
      await connection.execute(
        `INSERT INTO utilisateurs
           (userId, email, password, first_name, last_name,
            role_app, status_id, genre_id, grade_id,
            email_verified, active, peut_se_connecter)
         VALUES (?, ?, ?, ?, ?, ?, 1, 1, 1, 1, 1, 1)
         ON DUPLICATE KEY UPDATE
           userId         = VALUES(userId),
           password       = VALUES(password),
           first_name     = VALUES(first_name),
           last_name      = VALUES(last_name),
           role_app       = VALUES(role_app),
           email_verified = 1,
           active         = 1,
           peut_se_connecter = 1,
           updated_at     = CURRENT_TIMESTAMP`,
        [
          dbUserId,
          cred.email,
          passwordHash,
          'E2E',
          cred.userId, // last_name = identifiant lisible pour le debug
          dbRole,
        ],
      );

      console.log(`   ✓ Compte inséré/mis à jour en DB`);
      console.log(`   → DB userId   : ${dbUserId}`);
      console.log(`   → email       : ${cred.email}`);
      console.log(`   → role_app    : ${dbRole}`);
      console.log(`   → email_verified : 1 (login possible)\n`);
    }

    // ----------------------------------------------------------
    // 5. Résumé
    // ----------------------------------------------------------
    console.log('─'.repeat(60));
    console.log('✅ Seed E2E terminé avec succès !');
    console.log('');
    console.log('  Comptes disponibles pour les tests :');
    console.log(`  Admin      : ${E2E_DB_USER_IDS.admin}  (${E2E_ADMIN.email})`);
    console.log(`  Member     : ${E2E_DB_USER_IDS.member}  (${E2E_MEMBER.email})`);
    console.log(`  Professor  : ${E2E_DB_USER_IDS.professor}  (${E2E_PROFESSOR.email})`);
    console.log('');
    console.log('  Prochaine étape : lancer les tests avec');
    console.log('  → pnpm --filter @clubmanager/e2e test');
    console.log('─'.repeat(60));

  } finally {
    await connection.end();
    console.log('\n🔌 Connexion MySQL fermée.');
  }
}

// ============================================================
// Point d'entrée
// ============================================================
seedE2E().catch((err) => {
  console.error('\n❌ Erreur lors du seed E2E :', err);
  process.exit(1);
});
