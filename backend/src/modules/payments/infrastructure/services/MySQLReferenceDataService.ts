/**
 * MySQLReferenceDataService
 * Implémentation MySQL du service de données de référence
 * Cache en mémoire pour optimiser les performances (tables en lecture seule)
 */

import pool from "../../../../infrastructure/database/db";
import { RowDataPacket } from "mysql2";
import {
  IReferenceDataService,
  MethodePaiement,
  StatutPaiement,
  StatutEcheance,
} from "../../domain/services/IReferenceDataService";

export class MySQLReferenceDataService implements IReferenceDataService {
  // Cache en mémoire
  private methodesPaiement: MethodePaiement[] | null = null;
  private statutsPaiement: StatutPaiement[] | null = null;
  private statutsEcheance: StatutEcheance[] | null = null;

  // ============================================================
  // MÉTHODES DE PAIEMENT
  // ============================================================

  async getAllMethodesPaiement(): Promise<MethodePaiement[]> {
    if (this.methodesPaiement) {
      return this.methodesPaiement;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, code, nom, nom_en, actif
       FROM methodes_paiement
       WHERE actif = 1
       ORDER BY ordre ASC`,
    );

    this.methodesPaiement = rows.map((row) => ({
      id: row.id,
      code: row.code,
      nom: row.nom,
      nom_en: row.nom_en,
      actif: Boolean(row.actif),
    }));

    return this.methodesPaiement;
  }

  async getMethodePaiementByCode(code: string): Promise<MethodePaiement | null> {
    const all = await this.getAllMethodesPaiement();
    return all.find((m) => m.code === code) || null;
  }

  async getMethodePaiementById(id: number): Promise<MethodePaiement | null> {
    const all = await this.getAllMethodesPaiement();
    return all.find((m) => m.id === id) || null;
  }

  // ============================================================
  // STATUTS DE PAIEMENT
  // ============================================================

  async getAllStatutsPaiement(): Promise<StatutPaiement[]> {
    if (this.statutsPaiement) {
      return this.statutsPaiement;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, code, nom, nom_en, couleur, compte_dans_revenus, est_final, actif
       FROM statuts_paiement
       WHERE actif = 1
       ORDER BY ordre ASC`,
    );

    this.statutsPaiement = rows.map((row) => ({
      id: row.id,
      code: row.code,
      nom: row.nom,
      nom_en: row.nom_en,
      couleur: row.couleur,
      compte_dans_revenus: Boolean(row.compte_dans_revenus),
      est_final: Boolean(row.est_final),
      actif: Boolean(row.actif),
    }));

    return this.statutsPaiement;
  }

  async getStatutPaiementByCode(code: string): Promise<StatutPaiement | null> {
    const all = await this.getAllStatutsPaiement();
    return all.find((s) => s.code === code) || null;
  }

  async getStatutPaiementById(id: number): Promise<StatutPaiement | null> {
    const all = await this.getAllStatutsPaiement();
    return all.find((s) => s.id === id) || null;
  }

  // ============================================================
  // STATUTS D'ÉCHÉANCE
  // ============================================================

  async getAllStatutsEcheance(): Promise<StatutEcheance[]> {
    if (this.statutsEcheance) {
      return this.statutsEcheance;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, code, nom, nom_en, couleur, est_final, actif
       FROM statuts_echeance
       WHERE actif = 1
       ORDER BY ordre ASC`,
    );

    this.statutsEcheance = rows.map((row) => ({
      id: row.id,
      code: row.code,
      nom: row.nom,
      nom_en: row.nom_en,
      couleur: row.couleur,
      est_final: Boolean(row.est_final),
      actif: Boolean(row.actif),
    }));

    return this.statutsEcheance;
  }

  async getStatutEcheanceByCode(code: string): Promise<StatutEcheance | null> {
    const all = await this.getAllStatutsEcheance();
    return all.find((s) => s.code === code) || null;
  }

  async getStatutEcheanceById(id: number): Promise<StatutEcheance | null> {
    const all = await this.getAllStatutsEcheance();
    return all.find((s) => s.id === id) || null;
  }

  // ============================================================
  // UTILITAIRES
  // ============================================================

  clearCache(): void {
    this.methodesPaiement = null;
    this.statutsPaiement = null;
    this.statutsEcheance = null;
  }
}

// Instance singleton
export const referenceDataService = new MySQLReferenceDataService();
