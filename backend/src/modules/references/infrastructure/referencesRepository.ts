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
  StatutPaiement,
  StatutEcheance,
  RoleUtilisateur,
  RoleFamilial,
  Genre,
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

interface StatutPaiementRow extends RowDataPacket {
  id: number;
  code: string;
  nom: string;
  nom_en: string;
  couleur: string;
  ordre: number;
  compte_dans_revenus: number | boolean;
  est_final: number | boolean;
  actif: number | boolean;
}

interface StatutEcheanceRow extends RowDataPacket {
  id: number;
  code: string;
  nom: string;
  nom_en: string;
  couleur: string;
  ordre: number;
  est_final: number | boolean;
  actif: number | boolean;
}

interface RoleUtilisateurRow extends RowDataPacket {
  id: number;
  code: string;
  nom: string;
  nom_en: string;
  couleur: string;
  niveau_acces: number;
  ordre: number;
  actif: number | boolean;
}

interface RoleFamilialRow extends RowDataPacket {
  id: number;
  code: string;
  nom: string;
  nom_en: string;
  couleur: string;
  ordre: number;
  actif: number | boolean;
}

interface GenreRow extends RowDataPacket {
  id: number;
  code: string;
  nom: string;
  nom_en: string;
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
   * Récupère tous les statuts de paiement actifs, triés par ordre
   */
  async getStatutsPaiement(): Promise<StatutPaiement[]> {
    const [rows] = await pool.query<StatutPaiementRow[]>(
      `SELECT * FROM statuts_paiement WHERE actif = true ORDER BY ordre ASC`,
    );

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      nom: row.nom,
      nom_en: row.nom_en,
      couleur: row.couleur,
      ordre: row.ordre,
      compte_dans_revenus: Boolean(row.compte_dans_revenus),
      est_final: Boolean(row.est_final),
      actif: Boolean(row.actif),
    }));
  }

  /**
   * Récupère tous les statuts d'échéance actifs, triés par ordre
   */
  async getStatutsEcheance(): Promise<StatutEcheance[]> {
    const [rows] = await pool.query<StatutEcheanceRow[]>(
      `SELECT * FROM statuts_echeance WHERE actif = true ORDER BY ordre ASC`,
    );

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      nom: row.nom,
      nom_en: row.nom_en,
      couleur: row.couleur,
      ordre: row.ordre,
      est_final: Boolean(row.est_final),
      actif: Boolean(row.actif),
    }));
  }

  /**
   * Récupère tous les rôles utilisateur actifs, triés par ordre
   */
  async getRolesUtilisateur(): Promise<RoleUtilisateur[]> {
    const [rows] = await pool.query<RoleUtilisateurRow[]>(
      `SELECT * FROM roles_utilisateur WHERE actif = true ORDER BY ordre ASC`,
    );

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      nom: row.nom,
      nom_en: row.nom_en,
      couleur: row.couleur,
      niveau_acces: row.niveau_acces,
      ordre: row.ordre,
      actif: Boolean(row.actif),
    }));
  }

  /**
   * Récupère tous les rôles familiaux actifs, triés par ordre
   */
  async getRolesFamilial(): Promise<RoleFamilial[]> {
    const [rows] = await pool.query<RoleFamilialRow[]>(
      `SELECT * FROM roles_familial WHERE actif = true ORDER BY ordre ASC`,
    );

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      nom: row.nom,
      nom_en: row.nom_en,
      couleur: row.couleur,
      ordre: row.ordre,
      actif: Boolean(row.actif),
    }));
  }

  /**
   * Récupère tous les genres actifs, triés par ordre
   */
  async getGenres(): Promise<Genre[]> {
    const [rows] = await pool.query<GenreRow[]>(
      `SELECT * FROM genres WHERE actif = true ORDER BY ordre ASC`,
    );

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      nom: row.nom,
      nom_en: row.nom_en,
      ordre: row.ordre,
      actif: Boolean(row.actif),
    }));
  }

  /**
   * Récupère toutes les références en parallèle
   */
  async getAllReferences(): Promise<ReferencesData> {
    const [
      methodes_paiement,
      statuts_commande,
      types_cours,
      statuts_paiement,
      statuts_echeance,
      roles_utilisateur,
      roles_familial,
      genres,
    ] = await Promise.all([
      this.getMethodesPaiement(),
      this.getStatutsCommande(),
      this.getTypesCours(),
      this.getStatutsPaiement(),
      this.getStatutsEcheance(),
      this.getRolesUtilisateur(),
      this.getRolesFamilial(),
      this.getGenres(),
    ]);

    return {
      methodes_paiement,
      statuts_commande,
      types_cours,
      statuts_paiement,
      statuts_echeance,
      roles_utilisateur,
      roles_familial,
      genres,
    };
  }
}
