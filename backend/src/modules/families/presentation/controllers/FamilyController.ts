/**
 * FamilyController
 * Controller pour gérer les endpoints de gestion des familles
 */

import type { Request, Response, NextFunction } from "express";
import type { AddFamilyMemberDto } from "@clubmanager/types";
import { AddFamilyMemberUseCase } from "../../application/use-cases/AddFamilyMemberUseCase.js";
import { GetMyFamilyUseCase } from "../../application/use-cases/GetMyFamilyUseCase.js";
import { RemoveFamilyMemberUseCase } from "../../application/use-cases/RemoveFamilyMemberUseCase.js";
import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";

export class FamilyController {
  private addFamilyMemberUseCase: AddFamilyMemberUseCase;
  private getMyFamilyUseCase: GetMyFamilyUseCase;
  private removeFamilyMemberUseCase: RemoveFamilyMemberUseCase;

  constructor(familyRepository: IFamilyRepository) {
    this.addFamilyMemberUseCase = new AddFamilyMemberUseCase(familyRepository);
    this.getMyFamilyUseCase = new GetMyFamilyUseCase(familyRepository);
    this.removeFamilyMemberUseCase = new RemoveFamilyMemberUseCase(
      familyRepository,
    );
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
}
