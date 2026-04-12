/**
 * UserController
 * Controller pour gérer les endpoints de gestion des utilisateurs (admin)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { GetUsersUseCase } from "../../application/use-cases/GetUsersUseCase.js";
import { GetUserByIdUseCase } from "../../application/use-cases/GetUserByIdUseCase.js";
import { UpdateUserRoleUseCase } from "../../application/use-cases/UpdateUserRoleUseCase.js";
import { UpdateUserStatusUseCase } from "../../application/use-cases/UpdateUserStatusUseCase.js";
import { SoftDeleteUserUseCase } from "../../application/use-cases/SoftDeleteUserUseCase.js";
import { RestoreUserUseCase } from "../../application/use-cases/RestoreUserUseCase.js";
import { MySQLUserRepository } from "../../infrastructure/repositories/MySQLUserRepository.js";
import { NotifyUsersUseCase } from "../../application/use-cases/NotifyUsersUseCase.js";

const repo = new MySQLUserRepository();
const getUsersUC = new GetUsersUseCase(repo);
const getUserByIdUC = new GetUserByIdUseCase(repo);
const updateRoleUC = new UpdateUserRoleUseCase(repo);
const updateStatusUC = new UpdateUserStatusUseCase(repo);
const softDeleteUC = new SoftDeleteUserUseCase(repo);
const restoreUC = new RestoreUserUseCase(repo);
const notifyUsersUC = new NotifyUsersUseCase(repo);

export class UserController {
  /**
   * GET /api/users
   * Retourne la liste paginée des utilisateurs (admin + professor)
   */
  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query = {
        search: req.query.search as string | undefined,
        role_app: req.query.role_app as string | undefined,
        status_id: req.query.status_id ? Number(req.query.status_id) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };
      const result = await getUsersUC.execute(query);
      res.json({ success: true, message: "Users retrieved", data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message, error: "INTERNAL_ERROR" });
    }
  }

  /**
   * GET /api/users/:id
   * Retourne un utilisateur complet par son ID (admin + professor)
   */
  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const user = await getUserByIdUC.execute(id);
      res.json({ success: true, message: "User retrieved", data: user });
    } catch (error: any) {
      const status = error.message === "Utilisateur introuvable" ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /api/users/:id/role
   * Met à jour le rôle applicatif d'un utilisateur (admin seulement)
   */
  async updateRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const targetId = Number(req.params.id);
      const requesterId = req.user!.userId;
      await updateRoleUC.execute(targetId, req.body.role_app, requesterId);
      res.json({ success: true, message: "Rôle mis à jour" });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /api/users/:id/status
   * Met à jour le statut d'un utilisateur (admin seulement)
   */
  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const targetId = Number(req.params.id);
      const requesterId = req.user!.userId;
      await updateStatusUC.execute(targetId, Number(req.body.status_id), requesterId);
      res.json({ success: true, message: "Statut mis à jour" });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/users/:id
   * Suppression logique (soft delete) d'un utilisateur (admin seulement)
   */
  async softDelete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const targetId = Number(req.params.id);
      const deletedBy = req.user!.userId;
      await softDeleteUC.execute(targetId, deletedBy, req.body.reason ?? "");
      res.json({ success: true, message: "Utilisateur supprimé" });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/users/:id/restore
   * Restaure un utilisateur précédemment supprimé (admin seulement)
   */
  async restore(req: AuthRequest, res: Response): Promise<void> {
    try {
      const targetId = Number(req.params.id);
      await restoreUC.execute(targetId);
      res.json({ success: true, message: "Utilisateur restauré" });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/users/notify-bulk
   * Envoie un message à une sélection d’utilisateurs (admin + professor)
   */
  async notifyBulk(req: AuthRequest, res: Response): Promise<void> {
    try {
      const expediteur_id = req.user!.userId;
      const { user_ids, sujet, contenu, envoye_par_email } = req.body;

      if (!Array.isArray(user_ids) || user_ids.length === 0) {
        res.status(400).json({ success: false, message: "user_ids doit être un tableau non vide" });
        return;
      }

      const result = await notifyUsersUC.execute({
        expediteur_id,
        user_ids: (user_ids as unknown[]).map(Number),
        sujet: typeof sujet === "string" ? sujet.trim() || undefined : undefined,
        contenu,
        envoye_par_email: Boolean(envoye_par_email),
      });

      res.json({
        success: true,
        message: result.errors > 0
          ? `${result.sent} notification(s) envoyée(s), ${result.errors} erreur(s)`
          : `${result.sent} notification(s) envoyée(s)`,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}