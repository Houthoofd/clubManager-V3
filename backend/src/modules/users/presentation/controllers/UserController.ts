/**
 * UserController
 * Controller pour gérer les endpoints de gestion des utilisateurs (admin)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { UserRole } from "@clubmanager/types";
import { GetUsersUseCase } from "../../application/use-cases/GetUsersUseCase.js";
import { GetUserByIdUseCase } from "../../application/use-cases/GetUserByIdUseCase.js";
import { UpdateUserRoleUseCase } from "../../application/use-cases/UpdateUserRoleUseCase.js";
import { UpdateUserStatusUseCase } from "../../application/use-cases/UpdateUserStatusUseCase.js";
import { SoftDeleteUserUseCase } from "../../application/use-cases/SoftDeleteUserUseCase.js";
import { RestoreUserUseCase } from "../../application/use-cases/RestoreUserUseCase.js";
import { UpdateUserLanguageUseCase } from "../../application/use-cases/UpdateUserLanguageUseCase.js";
import { MySQLUserRepository } from "../../infrastructure/repositories/MySQLUserRepository.js";
import { NotifyUsersUseCase } from "../../application/use-cases/NotifyUsersUseCase.js";
import { UpdateUserProfileUseCase } from "../../application/use-cases/UpdateUserProfileUseCase.js";
import { GetUserProfileUseCase } from "../../application/use-cases/GetUserProfileUseCase.js";

const repo = new MySQLUserRepository();
const getUsersUC = new GetUsersUseCase(repo);
const getUserByIdUC = new GetUserByIdUseCase(repo);
const updateRoleUC = new UpdateUserRoleUseCase(repo);
const updateStatusUC = new UpdateUserStatusUseCase(repo);
const softDeleteUC = new SoftDeleteUserUseCase(repo);
const restoreUC = new RestoreUserUseCase(repo);
const updateLanguageUC = new UpdateUserLanguageUseCase(repo);
const notifyUsersUC = new NotifyUsersUseCase(repo);
const updateProfileUC = new UpdateUserProfileUseCase(repo);
const getProfileUC = new GetUserProfileUseCase(repo);

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
        status_id: req.query.status_id
          ? Number(req.query.status_id)
          : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };
      const result = await getUsersUC.execute(query);
      res.json({ success: true, message: "Users retrieved", data: result });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
        error: "INTERNAL_ERROR",
      });
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
   * GET /api/users/:id/profile
   * Retourne le profil complet d'un utilisateur
   * Un utilisateur peut consulter son propre profil ; l'admin peut consulter n'importe lequel
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const targetId = Number(req.params.id);
      const requesterId = req.user!.userId;
      const requesterRole = req.user!.role_app;
      // Only own profile or admin
      if (targetId !== requesterId && requesterRole !== "admin") {
        res.status(403).json({ success: false, message: "Accès refusé" });
        return;
      }
      const profile = await getProfileUC.execute(targetId);
      res.json({ success: true, message: "Profil récupéré", data: profile });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /api/users/:id/profile
   * Met à jour le profil d'un utilisateur
   * Un utilisateur peut modifier son propre profil ; l'admin peut modifier n'importe lequel
   */
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const targetId = Number(req.params.id);
      const requesterId = req.user!.userId;
      const requesterRole = req.user!.role_app ?? "";
      const profile = await updateProfileUC.execute(
        targetId,
        requesterId,
        requesterRole,
        req.body,
      );
      res.json({ success: true, message: "Profil mis à jour", data: profile });
    } catch (error: any) {
      const status = error.message.includes("introuvable")
        ? 404
        : error.message.includes("refusé")
          ? 403
          : 400;
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
      await updateStatusUC.execute(
        targetId,
        Number(req.body.status_id),
        requesterId,
      );
      res.json({ success: true, message: "Statut mis à jour" });
    } catch (error: any) {
      const status = error.message.includes("introuvable") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /api/users/:id/language
   * Met à jour la langue préférée d'un utilisateur
   * Note : Un utilisateur ne peut modifier que sa propre langue (sauf admin)
   */
  async updateLanguage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const targetUserId = Number(req.params.id);
      const currentUserId = req.user!.userId;
      const currentUserRole = req.user!.role_app;

      // Vérification de sécurité : un utilisateur ne peut modifier que sa propre langue (sauf admin)
      if (
        targetUserId !== currentUserId &&
        currentUserRole !== UserRole.ADMIN
      ) {
        res.status(403).json({
          success: false,
          message: "Vous ne pouvez modifier que votre propre langue préférée",
        });
        return;
      }

      await updateLanguageUC.execute({
        userId: targetUserId,
        langue_preferee: req.body.langue_preferee,
      });
      res.json({ success: true, message: "Langue préférée mise à jour" });
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
   * Envoie un message à une sélection d'utilisateurs (admin + professor)
   */
  async notifyBulk(req: AuthRequest, res: Response): Promise<void> {
    try {
      const expediteur_id = req.user!.userId;
      const { user_ids, sujet, contenu, envoye_par_email } = req.body;

      if (!Array.isArray(user_ids) || user_ids.length === 0) {
        res.status(400).json({
          success: false,
          message: "user_ids doit être un tableau non vide",
        });
        return;
      }

      const result = await notifyUsersUC.execute({
        expediteur_id,
        user_ids: (user_ids as unknown[]).map(Number),
        sujet:
          typeof sujet === "string" ? sujet.trim() || undefined : undefined,
        contenu,
        envoye_par_email: Boolean(envoye_par_email),
      });

      res.json({
        success: true,
        message:
          result.errors > 0
            ? `${result.sent} notification(s) envoyée(s), ${result.errors} erreur(s)`
            : `${result.sent} notification(s) envoyée(s)`,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
