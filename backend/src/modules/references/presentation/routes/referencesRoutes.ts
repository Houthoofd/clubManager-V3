/**
 * referencesRoutes
 * Définition des routes du module références
 * Données publiques de l'application — pas d'authentification requise
 */

import { Router } from "express";
import { ReferencesController } from "../controllers/referencesController.js";

const router = Router();

// ==================== INSTANTIATION DU CONTROLLER ====================

const referencesCtrl = new ReferencesController();

// ============================================================
// RÉFÉRENCES
// Toutes les routes sont publiques (données de référence statiques)
// ============================================================

// GET / — Toutes les références en une seule requête
router.get("/", (req, res) => referencesCtrl.getAll(req, res));

// GET /methodes-paiement — Méthodes de paiement actives
router.get("/methodes-paiement", (req, res) =>
  referencesCtrl.getMethodesPaiement(req, res),
);

// GET /statuts-commande — Statuts de commande actifs
router.get("/statuts-commande", (req, res) =>
  referencesCtrl.getStatutsCommande(req, res),
);

// GET /types-cours — Types de cours actifs
router.get("/types-cours", (req, res) =>
  referencesCtrl.getTypesCours(req, res),
);

export default router;
