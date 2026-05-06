/**
 * FamilyController
 * Controller pour gérer les endpoints de gestion des familles
 */

import type { Request, Response, NextFunction } from "express";
import type { AddFamilyMemberDto } from "@clubmanager/types";
import { AddFamilyMemberUseCase } from "../../application/use-cases/AddFamilyMemberUseCase.js";
import { GetMyFamilyUseCase } from "../../application/use-cases/GetMyFamilyUseCase.js";
import { RemoveFamilyMemberUseCase } from "../../application/use-cases/RemoveFamilyMemberUseCase.js";
import { GetFamiliesUseCase } from "../../application/use-cases/GetFamiliesUseCase.js";
import { AdminGetFamilyByIdUseCase } from "../../application/use-cases/AdminGetFamilyByIdUseCase.js";
import { UpdateFamilyUseCase } from "../../application/use-cases/UpdateFamilyUseCase.js";
import { DeleteFamilyUseCase } from "../../application/use-cases/DeleteFamilyUseCase.js";
import { AdminGetFamilyMembersUseCase } from "../../application/use-cases/AdminGetFamilyMembersUseCase.js";
import { AdminAddFamilyMemberUseCase } from "../../application/use-cases/AdminAddFamilyMemberUseCase.js";
import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";

export class FamilyController {
  private addFamilyMemberUseCase: AddFamilyMemberUseCase;
  private getMyFamilyUseCase: GetMyFamilyUseCase;
  private removeFamilyMemberUseCase: RemoveFamilyMemberUseCase;
  private getFamiliesUseCase: GetFamiliesUseCase;
  private adminGetFamilyByIdUseCase: AdminGetFamilyByIdUseCase;
  private updateFamilyUseCase: UpdateFamilyUseCase;
  private deleteFamilyUseCase: DeleteFamilyUseCase;
  private adminGetFamilyMembersUseCase: AdminGetFamilyMembersUseCase;
  private adminAddFamilyMemberUseCase: AdminAddFamilyMemberUseCase;
  private familyRepo: IFamilyRepository;

  constructor(familyRepository: IFamilyRepository) {
    this.addFamilyMemberUseCase = new AddFamilyMemberUseCase(familyRepository);
    this.getMyFamilyUseCase = new GetMyFamilyUseCase(familyRepository);
    this.removeFamilyMemberUseCase = new RemoveFamilyMemberUseCase(
      familyRepository,
    );
    this.getFamiliesUseCase = new GetFamiliesUseCase(familyRepository);
    this.adminGetFamilyByIdUseCase = new AdminGetFamilyByIdUseCase(
      familyRepository,
    );
    this.updateFamilyUseCase = new UpdateFamilyUseCase(familyRepository);
    this.deleteFamilyUseCase = new DeleteFamilyUseCase(familyRepository);
    this.adminGetFamilyMembersUseCase = new AdminGetFamilyMembersUseCase(
      familyRepository,
    );
    this.adminAddFamilyMemberUseCase = new AdminAddFamilyMemberUseCase(
      familyRepository,
    );
    this.familyRepo = familyRepository;
  }

  /**
   * POST /api/families/members
   * Ajoute un membre (enfant ou autre) à la famille du parent connecté
   */
  addMember = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parentId = (req as AuthRequest).user!.userId;

      const dto: AddFamilyMemberDto = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        date_of_birth: req.body.date_of_birth,
        genre_id: req.body.genre_id,
        role: req.body.role,
      };

      const result = await this.addFamilyMemberUseCase.execute(dto, parentId);

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/families/my-family
   * Récupère la famille de l'utilisateur connecté et ses membres
   */
  getMyFamily = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req as AuthRequest).user!.userId;

      const result = await this.getMyFamilyUseCase.execute(userId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/families/members/:userId
   * Retire un membre de la famille (réservé aux responsables)
   */
  removeMember = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const requesterId = (req as AuthRequest).user!.userId;
      // req.params est toujours Record<string, string> en Express — cast explicite pour satisfaire TS
      const membreUserIdString = req.params["userId"] as string;

      if (!membreUserIdString) {
        res.status(400).json({
          success: false,
          message: "L'identifiant du membre est requis",
        });
        return;
      }

      const result = await this.removeFamilyMemberUseCase.execute({
        requesterId,
        membreUserIdString,
      });

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== ADMIN HANDLERS ====================

  /**
   * GET /api/families
   * [ADMIN] Retourne la liste paginée de toutes les familles avec leur nombre de membres.
   */
  getFamilies = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = {
        search: req.query.search as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };
      const result = await this.getFamiliesUseCase.execute(query);
      res.status(200).json({
        success: true,
        message: "Familles récupérées",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/families/:id
   * [ADMIN] Retourne une famille par son ID.
   */
  getFamilyById = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const family = await this.adminGetFamilyByIdUseCase.execute(id);
      res.status(200).json({
        success: true,
        message: "Famille récupérée",
        data: family,
      });
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status = message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message });
    }
  };

  /**
   * PUT /api/families/:id
   * [ADMIN] Renomme une famille.
   */
  updateFamily = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const family = await this.updateFamilyUseCase.execute({
        ...req.body,
        id,
      });
      res.status(200).json({
        success: true,
        message: "Famille mise à jour",
        data: family,
      });
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status = message.includes("introuvable")
        ? 404
        : message.includes("au moins") || message.includes("dépasser")
          ? 400
          : 500;
      res.status(status).json({ success: false, message });
    }
  };

  /**
   * DELETE /api/families/:id
   * [ADMIN] Supprime une famille et tous ses membres (CASCADE).
   */
  deleteFamily = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.deleteFamilyUseCase.execute(id);
      res.status(200).json({
        success: true,
        message: "Famille supprimée",
      });
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status = message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message });
    }
  };

  /**
   * GET /api/families/:id/members
   * [ADMIN] Retourne les membres d'une famille.
   */
  adminGetMembers = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    try {
      const familleId = Number(req.params.id);
      const members =
        await this.adminGetFamilyMembersUseCase.execute(familleId);
      res.status(200).json({
        success: true,
        message: "Membres récupérés",
        data: members,
      });
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status = message.includes("introuvable") ? 404 : 500;
      res.status(status).json({ success: false, message });
    }
  };

  /**
   * POST /api/families/:id/members
   * [ADMIN] Ajoute un utilisateur existant à une famille.
   */
  adminAddMember = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    try {
      const familleId = Number(req.params.id);
      const userId = Number(req.body.user_id);

      if (!userId || isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "user_id est requis et doit être un nombre valide",
        });
        return;
      }

      const role = req.body.role ?? "autre";
      const estResponsable = Boolean(req.body.est_responsable ?? false);
      const estTuteurLegal = Boolean(req.body.est_tuteur_legal ?? false);

      await this.adminAddFamilyMemberUseCase.execute({
        familleId,
        userId,
        role,
        estResponsable,
        estTuteurLegal,
      });

      res.status(201).json({
        success: true,
        message: "Membre ajouté à la famille",
      });
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "Erreur interne";
      const status = message.includes("introuvable")
        ? 404
        : message.includes("déjà membre")
          ? 409
          : 500;
      res.status(status).json({ success: false, message });
    }
  };

  /**
   * DELETE /api/families/:id/members/:userId
   * [ADMIN] Retire un utilisateur d'une famille (sans vérification de responsabilité).
   */
  adminRemoveMember = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const familleId = Number(req.params.id);
      const userId = Number(req.params.userId);

      if (!familleId || isNaN(familleId) || !userId || isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "famille_id et user_id sont requis",
        });
        return;
      }

      const family = await this.familyRepo.findById(familleId);
      if (!family) {
        res
          .status(404)
          .json({ success: false, message: "Famille introuvable" });
        return;
      }

      await this.familyRepo.removeMembre(familleId, userId);
      res
        .status(200)
        .json({ success: true, message: "Membre retiré de la famille" });
    } catch (error) {
      next(error);
    }
  };
}
