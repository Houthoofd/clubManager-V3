/**
 * familyRoutes
 * Routes pour la gestion des familles
 */

import { Router } from "express";
import { FamilyController } from "../controllers/FamilyController.js";
import { MySQLFamilyRepository } from "../../infrastructure/repositories/MySQLFamilyRepository.js";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";

// Créer le router
const router: Router = Router();

// Initialiser le repository et le controller
const familyRepository = new MySQLFamilyRepository();
const familyController = new FamilyController(familyRepository);

/**
 * @route   POST /api/families/members
 * @desc    Ajoute un membre (enfant) à la famille du parent connecté
 * @access  Private (nécessite authentification)
 */
router.post("/members", authMiddleware, familyController.addMember);

/**
 * @route   GET /api/families/my-family
 * @desc    Récupère la famille de l'utilisateur connecté avec tous ses membres
 * @access  Private (nécessite authentification)
 */
router.get("/my-family", authMiddleware, familyController.getMyFamily);

/**
 * @route   DELETE /api/families/members/:userId
 * @desc    Retire un membre de la famille (réservé aux responsables)
 * @access  Private (nécessite authentification)
 */
router.delete(
  "/members/:userId",
  authMiddleware,
  familyController.removeMember,
);

// ==================== ADMIN ROUTES (ADMIN only) ====================

/**
 * @route   GET /api/families
 * @desc    [ADMIN] Liste toutes les familles (paginée + filtrée)
 */
router.get(
  "/",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  familyController.getFamilies,
);

/**
 * @route   GET /api/families/:id
 * @desc    [ADMIN] Récupère une famille par son ID
 */
router.get(
  "/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  familyController.getFamilyById,
);

/**
 * @route   PUT /api/families/:id
 * @desc    [ADMIN] Renomme une famille
 */
router.put(
  "/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  familyController.updateFamily,
);

/**
 * @route   DELETE /api/families/:id
 * @desc    [ADMIN] Supprime une famille (CASCADE membres)
 */
router.delete(
  "/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  familyController.deleteFamily,
);

/**
 * @route   GET /api/families/:id/members
 * @desc    [ADMIN] Récupère les membres d'une famille
 */
router.get(
  "/:id/members",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  familyController.adminGetMembers,
);

/**
 * @route   POST /api/families/:id/members
 * @desc    [ADMIN] Ajoute un utilisateur existant à une famille
 */
router.post(
  "/:id/members",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  familyController.adminAddMember,
);

/**
 * @route   DELETE /api/families/:id/members/:userId
 * @desc    [ADMIN] Retire un utilisateur d'une famille
 */
router.delete(
  "/:id/members/:userId",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  familyController.adminRemoveMember,
);

export default router;
