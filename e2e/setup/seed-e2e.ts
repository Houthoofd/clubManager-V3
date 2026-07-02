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

import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import {
  E2E_ADMIN,
  E2E_MEMBER,
  E2E_PROFESSOR,
  ROLE_DB_MAP,
  E2E_DB_USER_IDS,
  type E2ERole,
} from "./e2e-credentials.js";

// ============================================================
// 1. Charger les variables d'environnement depuis backend/.env
// ============================================================
const envPath = path.resolve(__dirname, "../../backend/.env");
dotenv.config({ path: envPath });

const DB_CONFIG = {
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  // On utilise la même DB que le backend (DB_NAME dans backend/.env)
  // Pour isoler les tests E2E, définir DB_NAME=clubmanager_e2e dans backend/.env
  database: process.env.DB_NAME ?? "clubmanager",
};

// ============================================================
// Helpers
// ============================================================
const SALT_ROUNDS = 10;

/** Affiche les paramètres de connexion (sans mot de passe) */
function printConfig(): void {
  console.log("📌 DB Config:", {
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    user: DB_CONFIG.user,
    database: DB_CONFIG.database,
  });
}

// ============================================================
// 2. Script principal
// ============================================================
async function seedE2E(): Promise<void> {
  printConfig();

  const connection = await mysql.createConnection(DB_CONFIG);
  console.log("✅ Connexion MySQL établie\n");

  try {
    // ----------------------------------------------------------
    // 3. Garantir les données FK requises
    //    On utilise INSERT IGNORE pour ne pas écraser l'existant.
    // ----------------------------------------------------------
    console.log("🔧 Vérification des données FK (status, genre, grade)...");

    // status id=1 → "actif"
    await connection.execute(
      `INSERT IGNORE INTO status (id, nom, description) VALUES
       (1, 'actif',     'Compte actif'),
       (2, 'inactif',   'Compte inactif'),
       (3, 'suspendu',  'Compte suspendu temporairement'),
       (4, 'en_attente','En attente de validation'),
       (5, 'archive',   'Compte archivé')`,
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

    // types_cours — nécessaire pour les tests de cours (courses.admin.spec.ts, enrollment-flow.spec.ts)
    await connection.execute(
      `INSERT IGNORE INTO types_cours
         (code, nom, nom_en, description, description_en, couleur, duree_defaut_minutes, ordre, actif)
       VALUES
         ('karate',    'Karaté',    'Karate',    'Art martial japonais traditionnel', 'Traditional Japanese martial art',  'blue',   60, 1,  1),
         ('judo',      'Judo',      'Judo',      'Art martial et sport de combat',    'Martial art and combat sport',      'green',  60, 2,  1),
         ('taekwondo', 'Taekwondo', 'Taekwondo', 'Art martial coréen',                'Korean martial art',                'red',    60, 3,  1),
         ('aikido',    'Aïkido',    'Aikido',    'Art martial japonais défensif',     'Japanese defensive martial art',    'purple', 60, 4,  1),
         ('kendo',     'Kendo',     'Kendo',     'Escrime japonaise',                 'Japanese fencing',                  'orange', 60, 5,  1),
         ('autre',     'Autre',     'Other',     'Autre type de cours',               'Other course type',                 'gray',   60, 99, 1)`,
    );

    console.log("   ✓ FK data OK\n");

    // ----------------------------------------------------------
    // 3b. Migration V4.10 — alertes_utilisateurs.utilisateur_id → user_id
    //     La DB live a été créée avec l'ancienne convention (utilisateur_id).
    //     V4.8 a renommé d'autres tables mais avait oublié alertes_utilisateurs.
    // ----------------------------------------------------------
    console.log(
      "🔧 Migration V4.10 — alertes_utilisateurs.utilisateur_id → user_id...",
    );

    const [colRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME   = 'alertes_utilisateurs'
         AND COLUMN_NAME  = 'utilisateur_id'`,
    );
    const colExists = (colRows[0] as { cnt: number }).cnt > 0;

    if (colExists) {
      // Supprimer la FK si elle existe
      const [fkRows] = await connection.execute<mysql.RowDataPacket[]>(
        `SELECT CONSTRAINT_NAME
         FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME   = 'alertes_utilisateurs'
           AND COLUMN_NAME  = 'utilisateur_id'
           AND REFERENCED_TABLE_NAME IS NOT NULL
         LIMIT 1`,
      );
      if (fkRows.length > 0) {
        const fkName = (fkRows[0] as { CONSTRAINT_NAME: string })
          .CONSTRAINT_NAME;
        await connection.execute(
          `ALTER TABLE alertes_utilisateurs DROP FOREIGN KEY \`${fkName}\``,
        );
      }
      // Renommer la colonne
      await connection.execute(
        `ALTER TABLE alertes_utilisateurs CHANGE COLUMN utilisateur_id user_id INT UNSIGNED NOT NULL`,
      );
      // Recréer la FK
      await connection.execute(
        `ALTER TABLE alertes_utilisateurs
         ADD CONSTRAINT fk_alertes_util_user
         FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
         ON DELETE CASCADE ON UPDATE CASCADE`,
      );
      console.log("   ✓ alertes_utilisateurs.utilisateur_id → user_id : OK\n");
    } else {
      console.log(
        "   ✓ alertes_utilisateurs.user_id déjà correct, rien à faire\n",
      );
    }

    // ----------------------------------------------------------
    // 3c. Données de référence pour les tests store / paiements / utilisateurs
    // ----------------------------------------------------------
    console.log("🔧 Insertion des données de référence pour les tests...");

    // plans_tarifaires — nécessaire pour le test 'assigner un abonnement'
    await connection.execute(
      `INSERT IGNORE INTO plans_tarifaires (nom, description, prix, duree_mois, actif)
       VALUES
         ('Mensuel Classique', 'Abonnement mensuel de base', 29.99, 1, 1),
         ('Trimestriel', 'Abonnement 3 mois', 79.99, 3, 1),
         ('Annuel', 'Abonnement annuel', 249.99, 12, 1)`,
    );

    // tailles — nécessaire pour les stocks
    await connection.execute(
      `INSERT IGNORE INTO tailles (nom, ordre) VALUES
         ('XS', 1), ('S', 2), ('M', 3), ('L', 4), ('XL', 5)`,
    );

    // articles — nécessaire pour les stocks
    await connection.execute(
      `INSERT IGNORE INTO articles (nom, description, prix, actif)
       VALUES ('Kimono E2E', 'Article de test E2E', 49.99, 1)`,
    );

    // stocks — nécessaire pour le test 'ajustement de stock'
    await connection.execute(
      `INSERT IGNORE INTO stocks (article_id, taille_id, quantite, stock_physique, stock_disponible)
       SELECT a.id, t.id, 10, 10, 10
       FROM articles a, tailles t
       WHERE a.nom = 'Kimono E2E' AND t.nom = 'M'
       LIMIT 1`,
    );

    // types_messages_personnalises — nécessaire pour messaging.templates.spec.ts
    await connection.execute(
      `INSERT IGNORE INTO types_messages_personnalises (nom, description, actif)
       VALUES
         ('Bienvenue',          'Message de bienvenue nouveau membre', 1),
         ('Rappel cotisation',  'Rappel de paiement cotisation', 1),
         ('Information',        'Information générale', 1)`,
    );

    console.log(
      "   ✓ Données de référence (plans, tailles, articles, stocks, types_messages_personnalises) OK\n",
    );

    // ----------------------------------------------------------
    // 4. Insérer / mettre à jour les comptes E2E
    // ----------------------------------------------------------
    const accounts = [
      { cred: E2E_ADMIN, dbUserId: E2E_DB_USER_IDS.admin },
      { cred: E2E_MEMBER, dbUserId: E2E_DB_USER_IDS.member },
      { cred: E2E_PROFESSOR, dbUserId: E2E_DB_USER_IDS.professor },
    ] as const;

    for (const { cred, dbUserId } of accounts) {
      console.log(
        `👤 Traitement du compte : ${cred.userId} (DB userId: ${dbUserId})`,
      );

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
          "E2E",
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
    // 4b. Commandes E2E (après création des comptes — dépend de utilisateurs)
    // ----------------------------------------------------------
    console.log("🔧 Insertion de la commande E2E de test...");

    // commandes — nécessaire pour le test 'changer le statut d'une commande'
    // On réinitialise le statut à 'en_attente' si la commande existe déjà (test précédent l'a modifiée)
    await connection.execute(
      `INSERT INTO commandes (unique_id, numero_commande, user_id, total, statut)
       SELECT 'CMD-E2E-SEED-001', 'CMD-E2E-001',
              u.id, 49.99, 'en_attente'
       FROM utilisateurs u
       WHERE u.userId = 'U-9999-0001'
       LIMIT 1
       ON DUPLICATE KEY UPDATE statut = 'en_attente'`,
    );

    console.log("   ✓ Commande E2E insérée / réinitialisée");

    // Insérer un article dans commande_articles si la commande n'en a pas encore
    // (nécessaire pour que OrderDetailModal s'affiche correctement dans les tests)
    await connection.execute(
      `INSERT INTO commande_articles (commande_id, article_id, quantite, prix)
       SELECT c.id, a.id, 1, a.prix
       FROM commandes c
       JOIN articles a ON a.nom LIKE 'Kimono%'
       WHERE c.numero_commande = 'CMD-E2E-001'
         AND NOT EXISTS (
           SELECT 1 FROM commande_articles ca WHERE ca.commande_id = c.id
         )
       LIMIT 1`,
    );

    console.log("   ✓ Article E2E ajouté à la commande (si absent)\n");

    // ----------------------------------------------------------
    // 4c. Utilisateurs de pagination (nécessaire pour pagination.spec.ts)
    //     Le PaginationBar n'apparaît que si totalPages > 1 (> 20 users actifs).
    //     On insère 20 comptes supplémentaires au format U-9998-XXXX (membre).
    //     INSERT IGNORE : pas de doublon si seed relancé plusieurs fois.
    // ----------------------------------------------------------
    console.log("🔧 Insertion des utilisateurs de pagination...");

    for (let i = 1; i <= 20; i++) {
      const num = String(i).padStart(4, "0");
      const userId = `U-9998-${num}`;
      const email = `e2e_pag_${num}@test.local`;
      await connection.execute(
        `INSERT INTO utilisateurs
           (userId, email, password, first_name, last_name,
            role_app, status_id, genre_id, grade_id,
            email_verified, active, peut_se_connecter)
         VALUES (?, ?, '$2b$10$placeholder', 'Pag', ?, 'member', 1, 1, 1, 1, 1, 0)
         ON DUPLICATE KEY UPDATE
           active         = 1,
           deleted_at     = NULL,
           anonymized     = FALSE,
           updated_at     = CURRENT_TIMESTAMP`,
        [userId, email, `Pag${num}`],
      );
    }

    console.log(
      "   ✓ 20 utilisateurs de pagination insérés (U-9998-0001 à U-9998-0020)\n",
    );

    // ----------------------------------------------------------
    // 5. Créer une deuxième session (refresh token) pour le membre E2E
    //    (section exécutée APRES la création des comptes pour garantir
    //    que l'utilisateur existe en DB)
    //    Nécessaire pour security.spec.ts qui requiert count > 1 sessions.
    // ----------------------------------------------------------
    console.log("🔧 Insertion d'une deuxième session pour le membre E2E...");

    await connection.execute(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked, ip_address, user_agent)
       SELECT u.id,
              SHA2(CONCAT('e2e-extra-session-', u.id, '-seed'), 256),
              DATE_ADD(NOW(), INTERVAL 7 DAY),
              FALSE,
              '127.0.0.1',
              'E2E-Extra-Session-Browser'
       FROM utilisateurs u
       WHERE u.userId = ?
       LIMIT 1
       ON DUPLICATE KEY UPDATE
         expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY),
         revoked    = FALSE`,
      [E2E_DB_USER_IDS.member],
    );

    console.log("   ✓ Deuxième session membre insérée / mise à jour\n");

    // ----------------------------------------------------------
    // 6. Résumé
    // ----------------------------------------------------------
    console.log("─".repeat(60));
    console.log("✅ Seed E2E terminé avec succès !");
    console.log("");
    console.log("  Comptes disponibles pour les tests :");
    console.log(
      `  Admin      : ${E2E_DB_USER_IDS.admin}  (${E2E_ADMIN.email})`,
    );
    console.log(
      `  Member     : ${E2E_DB_USER_IDS.member}  (${E2E_MEMBER.email})`,
    );
    console.log(
      `  Professor  : ${E2E_DB_USER_IDS.professor}  (${E2E_PROFESSOR.email})`,
    );
    console.log("");
    console.log(
      "  Données de référence : status, genres, grades, types_cours,",
    );
    console.log(
      "                         plans_tarifaires, tailles, articles, stocks,",
    );
    console.log(
      "                         types_messages_personnalises, commandes,",
    );
    console.log("                         refresh_tokens (2e session membre),");
    console.log(
      "                         utilisateurs de pagination (U-9998-0001..0020)",
    );
    console.log("");
    console.log("  Prochaine étape : lancer les tests avec");
    console.log("  → pnpm --filter @clubmanager/e2e test");
    console.log("─".repeat(60));
  } finally {
    await connection.end();
    console.log("\n🔌 Connexion MySQL fermée.");
  }
}

// ============================================================
// Point d'entrée
// ============================================================
seedE2E().catch((err) => {
  console.error("\n❌ Erreur lors du seed E2E :", err);
  process.exit(1);
});
