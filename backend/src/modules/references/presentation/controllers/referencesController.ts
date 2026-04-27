/**
 * ReferencesController
 * Controller pour les données de référence de l'application
 * Données publiques avec cache côté client (Cache-Control: public, max-age=3600)
 */

import type { Request, Response } from "express";
import { ReferencesRepository } from "../../infrastructure/referencesRepository.js";
import { GetReferencesUseCase } from "../../application/getReferences.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const repo = new ReferencesRepository();
const uc = new GetReferencesUseCase(repo);

// ==================== CONTROLLER ====================

export class ReferencesController {
  /**
   * GET /api/references
   * Retourne toutes les données de référence en une seule requête
   * Cache public 1 heure (données stables)
   */
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const data = await uc.execute();
      res.set("Cache-Control", "public, max-age=3600");
      res.json({
        success: true,
        data,
      });
    } catch (error: unknown) {
      console.error("[ReferencesController.getAll]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * GET /api/references/methodes-paiement
   * Retourne uniquement les méthodes de paiement actives
   */
  async getMethodesPaiement(_req: Request, res: Response): Promise<void> {
    try {
      const data = await uc.getMethodesPaiement();
      res.set("Cache-Control", "public, max-age=3600");
      res.json({
        success: true,
        data,
      });
    } catch (error: unknown) {
      console.error("[ReferencesController.getMethodesPaiement]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * GET /api/references/statuts-commande
   * Retourne uniquement les statuts de commande actifs
   */
  async getStatutsCommande(_req: Request, res: Response): Promise<void> {
    try {
      const data = await uc.getStatutsCommande();
      res.set("Cache-Control", "public, max-age=3600");
      res.json({
        success: true,
        data,
      });
    } catch (error: unknown) {
      console.error("[ReferencesController.getStatutsCommande]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * GET /api/references/types-cours
   * Retourne uniquement les types de cours actifs
   */
  async getTypesCours(_req: Request, res: Response): Promise<void> {
    try {
      const data = await uc.getTypesCours();
      res.set("Cache-Control", "public, max-age=3600");
      res.json({
        success: true,
        data,
      });
    } catch (error: unknown) {
      console.error("[ReferencesController.getTypesCours]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }
}
