/**
 * ReferencesRepository
 * Accès base de données pour les données de référence de l'application
 * (méthodes de paiement, statuts commande, types de cours)
 */

import { pool } from "@/core/database/connection.js";
import type { RowDataPacket } from "mysql2/promise";
import type {
  MethodePaiement,
  StatutCommande,
  TypeCours,
  ReferencesData,
} from "../domain/types.js";

// ==================== DB ROW INTERFACES ====================

interface MethodePaiementRow extends RowDataPacket {
  id: number;
  code: string;
  nom: string;
  nom_en: string;
  description: string | null;
  icone: string | null;
  couleur: string;
  ordre: number;
  actif: number | boolean;
  visible_frontend: number | boolean;
}

interface StatutCommandeRow extends RowDataPacket {
  id: number;
  code: string;
  nom: string;
  nom_en: string;
  description: string | null;
  couleur: string;
  ordre: number;
  est_final: number | boolean;
  peut_modifier: number | boolean;
  peut_annuler: number | boolean;
  actif: number | boolean;
}

interface TypeCoursRow extends RowDataPacket {
  id: number;
  code: string;
  nom: string;
  nom_en: string;
  description: string | null;
  couleur: string;
  duree_defaut_minutes: number;
  ordre: number;
  actif: number | boolean;
}

// ==================== REPOSITORY ====================

export class ReferencesRepository {
  /**
   * Récupère toutes les méthodes de paiement actives, triées par ordre
   */
  async getMethodesPaiement(): Promise<MethodePaiement[]> {
    const [rows] = await pool.query<MethodePaiementRow[]>(
      `SELECT * FROM methodes_paiement WHERE actif = true ORDER BY ordre ASC`,
    );

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      nom: row.nom,
      nom_en: row.nom_en,
      description: row.description ?? undefined,
      icone: row.icone ?? undefined,
      couleur: row.couleur,
      ordre: row.ordre,
      actif: Boolean(row.actif),
      visible_frontend: Boolean(row.visible_frontend),
    }));
  }

  /**
   * Récupère tous les statuts de commande actifs, triés par ordre
   */
  async getStatutsCommande(): Promise<StatutCommande[]> {
    const [rows] = await pool.query<StatutCommandeRow[]>(
      `SELECT * FROM statuts_commande WHERE actif = true ORDER BY ordre ASC`,
    );

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      nom: row.nom,
      nom_en: row.nom_en,
      description: row.description ?? undefined,
      couleur: row.couleur,
      ordre: row.ordre,
      est_final: Boolean(row.est_final),
      peut_modifier: Boolean(row.peut_modifier),
      peut_annuler: Boolean(row.peut_annuler),
      actif: Boolean(row.actif),
    }));
  }

  /**
   * Récupère tous les types de cours actifs, triés par ordre
   */
  async getTypesCours(): Promise<TypeCours[]> {
    const [rows] = await pool.query<TypeCoursRow[]>(
      `SELECT * FROM types_cours WHERE actif = true ORDER BY ordre ASC`,
    );

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      nom: row.nom,
      nom_en: row.nom_en,
      description: row.description ?? undefined,
      couleur: row.couleur,
      duree_defaut_minutes: row.duree_defaut_minutes,
      ordre: row.ordre,
      actif: Boolean(row.actif),
    }));
  }

  /**
   * Récupère toutes les références en parallèle
   */
  async getAllReferences(): Promise<ReferencesData> {
    const [methodes_paiement, statuts_commande, types_cours] =
      await Promise.all([
        this.getMethodesPaiement(),
        this.getStatutsCommande(),
        this.getTypesCours(),
      ]);

    return {
      methodes_paiement,
      statuts_commande,
      types_cours,
    };
  }
}
