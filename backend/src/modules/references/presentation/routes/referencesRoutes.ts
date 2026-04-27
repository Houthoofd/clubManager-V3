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

// GET /statuts-paiement — Statuts de paiement actifs
router.get("/statuts-paiement", (req, res) =>
  referencesCtrl.getStatutsPaiement(req, res),
);

// GET /statuts-echeance — Statuts d'échéance actifs
router.get("/statuts-echeance", (req, res) =>
  referencesCtrl.getStatutsEcheance(req, res),
);

// GET /roles-utilisateur — Rôles utilisateur actifs
router.get("/roles-utilisateur", (req, res) =>
  referencesCtrl.getRolesUtilisateur(req, res),
);

// GET /roles-familial — Rôles familiaux actifs
router.get("/roles-familial", (req, res) =>
  referencesCtrl.getRolesFamilial(req, res),
);

// GET /genres — Genres actifs
router.get("/genres", (req, res) => referencesCtrl.getGenres(req, res));

export default router;
