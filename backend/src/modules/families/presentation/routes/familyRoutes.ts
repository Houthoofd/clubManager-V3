/**
 * familyRoutes
 * Routes pour la gestion des familles
 */

import { Router } from "express";
import { FamilyController } from "../controllers/FamilyController.js";
import { MySQLFamilyRepository } from "../../infrastructure/repositories/MySQLFamilyRepository.js";
import { authMiddleware } from "@/shared/middleware/authMiddleware.js";

// Créer le router
const router = Router();

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
router.delete("/members/:userId", authMiddleware, familyController.removeMember);

export default router;
