/**
 * MySQLPaymentRepository
 * Implémentation MySQL du repository paiements (Infrastructure Layer)
 * Gère les opérations sur la table paiements avec JOINs vers utilisateurs et plans_tarifaires
 * Les montants DECIMAL sont castés en number via Number()
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type {
  IPaymentRepository,
  PaymentRow,
  CreatePaymentInput,
  PaymentQuery,
  PaginatedPayments,
} from "../../domain/repositories/IPaymentRepository.js";

// ==================== DB ROW INTERFACE ====================

interface PaymentDbRow extends RowDataPacket {
  id: number;
  user_id: number;
  plan_tarifaire_id: number | null;
  montant: string; // DECIMAL retourné en string par MySQL
  methode_paiement: "stripe" | "especes" | "virement" | "autre";
  statut: "en_attente" | "valide" | "echoue" | "rembourse";
  description: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  date_paiement: Date | null;
  created_at: Date;
  updated_at: Date;
  // Champs issus des JOINs
  user_first_name: string | null;
  user_last_name: string | null;
  user_email: string | null;
  plan_nom: string | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

// ==================== BASE SELECT ====================

const BASE_SELECT = `
  SELECT
    p.id,
    p.plan_tarifaire_id,
    p.montant,
    p.methode_paiement,
    p.statut,
    p.description,
    p.stripe_payment_intent_id,
    p.stripe_charge_id,
    p.date_paiement,
    p.created_at,
    p.updated_at,
    p.utilisateur_id AS user_id,
    u.first_name  AS user_first_name,
    u.last_name   AS user_last_name,
    u.email       AS user_email,
    pt.nom        AS plan_nom
  FROM paiements p
  LEFT JOIN utilisateurs     u  ON u.id  = p.utilisateur_id
  LEFT JOIN plans_tarifaires pt ON pt.id = p.plan_tarifaire_id
`;

// ==================== REPOSITORY ====================

export class MySQLPaymentRepository implements IPaymentRepository {
  /**
   * Récupère la liste paginée des paiements avec filtres dynamiques
   * Joint les tables utilisateurs et plans_tarifaires pour enrichir les données
   */
  async findAll(query: PaymentQuery): Promise<PaginatedPayments> {
    const {
      user_id,
      statut,
      methode,
      date_debut,
      date_fin,
      page = 1,
      limit = 20,
    } = query;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (user_id !== undefined) {
      conditions.push("p.utilisateur_id = ?");
      params.push(user_id);
    }
    if (statut) {
      conditions.push("p.statut = ?");
      params.push(statut);
    }
    if (methode) {
      conditions.push("p.methode_paiement = ?");
      params.push(methode);
    }
    if (date_debut) {
      conditions.push("p.created_at >= ?");
      params.push(date_debut);
    }
    if (date_fin) {
      conditions.push("p.created_at <= ?");
      params.push(date_fin);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Requête COUNT pour la pagination
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM paiements p ${whereClause}`,
      params,
    );

    const total = countRows[0]?.total ?? 0;
    const offset = (page - 1) * limit;

    // Requête de données avec JOINs et pagination
    const [rows] = await pool.query<PaymentDbRow[]>(
      `${BASE_SELECT} ${whereClause} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return {
      payments: rows.map((row) => this.mapRow(row)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère un paiement par son ID avec les informations enrichies via JOINs
   */
  async findById(id: number): Promise<PaymentRow | null> {
    const [rows] = await pool.query<PaymentDbRow[]>(
      `${BASE_SELECT} WHERE p.id = ? LIMIT 1`,
      [id],
    );

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]!);
  }

  /**
   * Récupère tous les paiements d'un utilisateur, triés par date décroissante
   */
  async findByUserId(userId: number): Promise<PaymentRow[]> {
    const [rows] = await pool.query<PaymentDbRow[]>(
      `${BASE_SELECT} WHERE p.utilisateur_id = ? ORDER BY p.created_at DESC`,
      [userId],
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Trouve un paiement via l'identifiant PaymentIntent Stripe
   * Utilisé par le webhook pour retrouver le paiement après confirmation Stripe
   */
  async findByStripeIntentId(intentId: string): Promise<PaymentRow | null> {
    const [rows] = await pool.query<PaymentDbRow[]>(
      `${BASE_SELECT} WHERE p.stripe_payment_intent_id = ? LIMIT 1`,
      [intentId],
    );

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]!);
  }

  /**
   * Crée un nouveau paiement et retourne l'ID généré
   */
  async create(data: CreatePaymentInput): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO paiements
         (utilisateur_id, plan_tarifaire_id, montant, methode_paiement, statut,
          description, stripe_payment_intent_id, date_paiement)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.plan_tarifaire_id ?? null,
        data.montant,
        data.methode_paiement,
        data.statut ?? "en_attente",
        data.description ?? null,
        data.stripe_payment_intent_id ?? null,
        data.date_paiement ?? null,
      ],
    );

    return result.insertId;
  }

  /**
   * Met à jour le statut d'un paiement
   * Si un stripeChargeId est fourni, met également à jour la date de paiement
   */
  async updateStatus(
    id: number,
    statut: string,
    stripeChargeId?: string,
  ): Promise<void> {
    if (stripeChargeId) {
      await pool.query(
        `UPDATE paiements
         SET statut = ?, stripe_charge_id = ?, date_paiement = NOW(), updated_at = NOW()
         WHERE id = ?`,
        [statut, stripeChargeId, id],
      );
    } else {
      await pool.query(
        `UPDATE paiements
         SET statut = ?, updated_at = NOW()
         WHERE id = ?`,
        [statut, id],
      );
    }
  }

  /**
   * Enregistre ou met à jour le PaymentIntent Stripe associé à un paiement
   */
  async updateStripeIntent(id: number, paymentIntentId: string): Promise<void> {
    await pool.query(
      "UPDATE paiements SET stripe_payment_intent_id = ?, updated_at = NOW() WHERE id = ?",
      [paymentIntentId, id],
    );
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convertit une row MySQL brute en objet PaymentRow typé
   * Cast DECIMAL (string) → number pour le champ montant
   */
  private mapRow(row: PaymentDbRow): PaymentRow {
    return {
      id: row.id,
      user_id: row.user_id,
      plan_tarifaire_id: row.plan_tarifaire_id,
      montant: Number(row.montant),
      methode_paiement: row.methode_paiement,
      statut: row.statut,
      description: row.description,
      stripe_payment_intent_id: row.stripe_payment_intent_id,
      stripe_charge_id: row.stripe_charge_id,
      date_paiement: row.date_paiement ? new Date(row.date_paiement) : null,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      user_first_name: row.user_first_name ?? undefined,
      user_last_name: row.user_last_name ?? undefined,
      user_email: row.user_email ?? undefined,
      plan_nom: row.plan_nom ?? undefined,
    };
  }
}
