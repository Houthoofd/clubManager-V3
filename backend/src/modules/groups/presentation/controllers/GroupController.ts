/**
 * GroupController
 * Controller pour gérer les endpoints CRUD des groupes et la gestion des membres (Presentation Layer)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLGroupRepository } from "../../infrastructure/repositories/MySQLGroupRepository.js";
import { GetGroupsUseCase } from "../../application/use-cases/GetGroupsUseCase.js";
import { GetGroupByIdUseCase } from "../../application/use-cases/GetGroupByIdUseCase.js";
import { CreateGroupUseCase } from "../../application/use-cases/CreateGroupUseCase.js";
import { UpdateGroupUseCase } from "../../application/use-cases/UpdateGroupUseCase.js";
import { DeleteGroupUseCase } from "../../application/use-cases/DeleteGroupUseCase.js";
import { GetGroupMembersUseCase } from "../../application/use-cases/GetGroupMembersUseCase.js";
import { AddMemberToGroupUseCase } from "../../application/use-cases/AddMemberToGroupUseCase.js";
import { RemoveMemberFromGroupUseCase } from "../../application/use-cases/RemoveMemberFromGroupUseCase.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const repo = new MySQLGroupRepository();
const getGroupsUC = new GetGroupsUseCase(repo);
const getGroupByIdUC = new GetGroupByIdUseCase(repo);
const createGroupUC = new CreateGroupUseCase(repo);
const updateGroupUC = new UpdateGroupUseCase(repo);
const deleteGroupUC = new DeleteGroupUseCase(repo);
const getGroupMembersUC = new GetGroupMembersUseCase(repo);
const addMemberToGroupUC = new AddMemberToGroupUseCase(repo);
const removeMemberFromGroupUC = new RemoveMemberFromGroupUseCase(repo);

// ==================== CONTROLLER ====================

export class GroupController {
  /**
   * GET /api/groups
   * Retourne la liste paginée des groupes avec leur nombre de membres.
   * Accessible aux administrateurs et professeurs.
   */
  async getGroups(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = {
        search: req.query.search as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };
      const result = await getGroupsUC.execute(query);
      res.json({
        success: true,
        message: "Groupes récupérés",
        data: result,
      });
    } catch (error: unknown) {
      console.error("[GroupController.getGroups]", error);
      const message = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * GET /api/groups/:id
   * Retourne un groupe par son ID (avec membre_count).
   * Accessible aux administrateurs et professeurs.
   */
  async getGroupById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const group = await getGroupByIdUC.execute(id);
      res.json({
        success: true,
        message: "Groupe récupéré",
        data: group,
      });
    } catch (error: unknown) {
      console.error("[GroupController.getGroupById]", error);
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status = message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * POST /api/groups
   * Crée un nouveau groupe.
   * Réservé aux administrateurs.
   */
  async createGroup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const group = await createGroupUC.execute({
        nom: req.body.nom,
        description: req.body.description,
      });
      res.status(201).json({
        success: true,
        message: "Groupe créé",
        data: group,
      });
    } catch (error: unknown) {
      console.error("[GroupController.createGroup]", error);
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status =
        message.includes("requis") || message.includes("au moins")
          ? 400
          : message.includes("Duplicate") || message.includes("déjà")
          ? 409
          : 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * PUT /api/groups/:id
   * Met à jour partiellement un groupe existant.
   * Réservé aux administrateurs.
   * L'id est extrait des paramètres de route et fusionné dans le DTO.
   */
  async updateGroup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const group = await updateGroupUC.execute({ ...req.body, id });
      res.json({
        success: true,
        message: "Groupe mis à jour",
        data: group,
      });
    } catch (error: unknown) {
      console.error("[GroupController.updateGroup]", error);
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status = message.includes("introuvable")
        ? 404
        : message.includes("au moins")
        ? 400
        : message.includes("Duplicate") || message.includes("déjà")
        ? 409
        : 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/groups/:id
   * Supprime un groupe (et ses membres via CASCADE).
   * Réservé aux administrateurs.
   */
  async deleteGroup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await deleteGroupUC.execute(id);
      res.json({
        success: true,
        message: "Groupe supprimé",
      });
    } catch (error: unknown) {
      console.error("[GroupController.deleteGroup]", error);
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status = message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * GET /api/groups/:id/members
   * Retourne la liste des membres d'un groupe avec les données utilisateur jointes.
   * Accessible aux administrateurs et professeurs.
   */
  async getMembers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const groupeId = Number(req.params.id);
      const members = await getGroupMembersUC.execute(groupeId);
      res.json({
        success: true,
        message: "Membres récupérés",
        data: members,
      });
    } catch (error: unknown) {
      console.error("[GroupController.getMembers]", error);
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status = message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * POST /api/groups/:id/members
   * Ajoute un utilisateur à un groupe.
   * Réservé aux administrateurs.
   * L'id du groupe est extrait des paramètres de route, l'user_id du corps de la requête.
   */
  async addMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const groupeId = Number(req.params.id);
      const userId = Number(req.body.user_id);

      if (!userId || isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "user_id est requis et doit être un nombre valide",
        });
        return;
      }

      await addMemberToGroupUC.execute(groupeId, userId);
      res.status(201).json({
        success: true,
        message: "Membre ajouté au groupe",
      });
    } catch (error: unknown) {
      console.error("[GroupController.addMember]", error);
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status = message.includes("introuvable")
        ? 404
        : message.includes("déjà membre")
        ? 409
        : 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/groups/:id/members/:userId
   * Retire un utilisateur d'un groupe.
   * Réservé aux administrateurs.
   * Le groupe_id est extrait de params.id, le user_id de params.userId ou body.user_id.
   */
  async removeMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const groupeId = Number(req.params.id);
      // Support both route param (:userId) and request body (user_id)
      const userId = req.params.userId
        ? Number(req.params.userId)
        : Number(req.body.user_id);

      if (!userId || isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "user_id est requis et doit être un nombre valide",
        });
        return;
      }

      await removeMemberFromGroupUC.execute({
        groupe_id: groupeId,
        user_id: userId,
      });
      res.json({
        success: true,
        message: "Membre retiré du groupe",
      });
    } catch (error: unknown) {
      console.error("[GroupController.removeMember]", error);
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status =
        message.includes("introuvable") || message.includes("Membre introuvable")
          ? 404
          : 500;
      res.status(status).json({ success: false, message });
    }
  }
}
