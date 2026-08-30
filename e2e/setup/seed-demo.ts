/**
 * seed-demo.ts
 * Script autonome — crée des données réalistes (Faker.js) pour la démo.
 *
 * Usage :
 *   pnpm --filter @clubmanager/e2e seed:demo
 */

import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { faker } from "@faker-js/faker/locale/fr";
import { ROLE_DB_MAP, type E2ERole } from "./e2e-credentials.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  database: process.env.DB_NAME ?? "clubmanager",
};

const SALT_ROUNDS = 10;

async function seedDemo(): Promise<void> {
  console.log("📌 Lancement de la génération des données de démo...");
  const connection = await mysql.createConnection(DB_CONFIG);
  
  try {
    const passwordHash = await bcrypt.hash("Demo123!", SALT_ROUNDS);
    
    // 1. UTILISATEURS (50 faux utilisateurs)
    console.log("🔧 Insertion de 50 utilisateurs...");
    const userIds: number[] = [];
    
    for (let i = 1; i <= 50; i++) {
      const num = String(i).padStart(4, "0");
      const userIdStr = `U-9000-${num}`;
      
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();
      
      const [result] = await connection.execute<mysql.ResultSetHeader>(
        `INSERT INTO utilisateurs
           (userId, email, password, first_name, last_name,
            role_app, status_id, genre_id, grade_id,
            email_verified, active, peut_se_connecter)
         VALUES (?, ?, ?, ?, ?, 'member', 1, 1, 1, 1, 1, 1)
         ON DUPLICATE KEY UPDATE active = 1`,
        [userIdStr, email, passwordHash, firstName, lastName]
      );
      
      // Récupérer l'ID généré ou existant
      let insertedId = result.insertId;
      if (insertedId === 0) {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
          `SELECT id FROM utilisateurs WHERE userId = ?`, [userIdStr]
        );
        if (rows.length > 0) insertedId = rows[0].id;
      }
      
      if (insertedId > 0) {
        userIds.push(insertedId);
      }
    }
    console.log(`   ✓ ${userIds.length} utilisateurs ajoutés/mis à jour.`);

    // 2. COURS (5 cours cette semaine)
    console.log("🔧 Insertion de cours...");
    const coursIds: number[] = [];
    for (let i = 0; i < 5; i++) {
      const isPast = faker.datatype.boolean();
      const dateCours = faker.date.recent({ days: 3 });
      if (!isPast) {
         dateCours.setDate(dateCours.getDate() + 5);
      }
      
      const types = ['karate', 'judo', 'taekwondo', 'aikido'];
      const typeCours = types[Math.floor(Math.random() * types.length)];
      
      const formattedDate = dateCours.toISOString().split('T')[0];
      
      const [result] = await connection.execute<mysql.ResultSetHeader>(
        `INSERT INTO cours (date_cours, type_cours, heure_debut, heure_fin)
         VALUES (?, ?, '18:00:00', '19:30:00')`,
        [formattedDate, typeCours]
      );
      coursIds.push(result.insertId);
    }
    console.log(`   ✓ ${coursIds.length} cours créés.`);

    // 3. INSCRIPTIONS
    console.log("🔧 Inscription des utilisateurs aux cours...");
    let inscriptionsCount = 0;
    for (const coursId of coursIds) {
      // Inscrire 10 à 25 utilisateurs par cours
      const participants = faker.helpers.arrayElements(userIds, faker.number.int({ min: 10, max: 25 }));
      
      for (const uid of participants) {
        await connection.execute(
          `INSERT INTO inscriptions (user_id, cours_id, status_id) VALUES (?, ?, 1)`,
          [uid, coursId]
        );
        inscriptionsCount++;
      }
    }
    console.log(`   ✓ ${inscriptionsCount} inscriptions générées.`);

    // 4. PAIEMENTS & FACTURES
    console.log("🔧 Création de paiements...");
    let paiementsCount = 0;
    for (const uid of faker.helpers.arrayElements(userIds, 20)) {
      // statuts_paiement id (souvent 1=payé, 2=en attente) -> check exact if possible, using 1 for paye, 2 for pending
      const statutId = faker.datatype.boolean() ? 1 : 2; 
      
      await connection.execute(
        `INSERT INTO paiements (user_id, plan_tarifaire_id, montant, methode_paiement_id, statut_id, description)
         VALUES (?, NULL, 29.99, 1, ?, 'Cotisation mensuelle générée')`,
        [uid, statutId]
      );
      paiementsCount++;
    }
    console.log(`   ✓ ${paiementsCount} paiements générés.`);

    // 5. ALERTES
    // Il faut s'assurer que alertes_types contient des données, on insère un type 'Rappel' basique si absent.
    await connection.execute(
       `INSERT IGNORE INTO alertes_types (id, code, nom, description, priorite, actif) 
        VALUES (999, 'DEMO_RAPPEL', 'Rappel de paiement (Démo)', 'Alerte générée', 'haute', 1)`
    );

    console.log("🔧 Création d'alertes...");
    let alertesCount = 0;
    for (const uid of faker.helpers.arrayElements(userIds, 10)) {
      await connection.execute(
        `INSERT INTO alertes_utilisateurs (user_id, alerte_type_id, statut, notes)
         VALUES (?, 999, 'active', 'Merci de régulariser votre cotisation.')`,
        [uid]
      );
      alertesCount++;
    }
    console.log(`   ✓ ${alertesCount} alertes générées.`);

    console.log("─".repeat(60));
    console.log("✅ Seed Démo (Faker.js) terminé avec succès !");
    console.log("─".repeat(60));
    
  } catch (err) {
    console.error("❌ Erreur :", err);
  } finally {
    await connection.end();
  }
}

seedDemo();
