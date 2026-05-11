/**
 * AlertController
 * Contrôleur pour gérer les endpoints du module alerts
 * Délègue la logique métier aux use cases correspondants
 */

import type { Response } from 'express';
import type { AuthRequest } from '@/shared/middleware/authMiddleware.js';
import { MySQLAlertRepository } from '../../infrastructure/repositories/MySQLAlertRepository.js';
import { GetAlertTypesUseCase } from '../../application/use-cases/GetAlertTypesUseCase.js';
import { CreateAlertTypeUseCase } from '../../application/use-cases/CreateAlertTypeUseCase.js';
import { UpdateAlertTypeUseCase } from '../../application/use-cases/UpdateAlertTypeUseCase.js';
import { DeleteAlertTypeUseCase } from '../../application/use-cases/DeleteAlertTypeUseCase.js';
import { GetUserAlertsUseCase } from '../../application/use-cases/GetUserAlertsUseCase.js';
import { CreateUserAlertUseCase } from '../../application/use-cases/CreateUserAlertUseCase.js';
import { ResolveAlertUseCase } from '../../application/use-cases/ResolveAlertUseCase.js';
import { IgnoreAlertUseCase } from '../../application/use-cases/IgnoreAlertUseCase.js';
import { GetAdminAlertsUseCase } from '../../application/use-cases/GetAdminAlertsUseCase.js';
import { AddAlertActionUseCase } from '../../application/use-cases/AddAlertActionUseCase.js';
import { GetAlertActionsUseCase } from '../../application/use-cases/GetAlertActionsUseCase.js';
import type { AlertStatut, AlertPriorite, AlertActionType } from '../../domain/types.js';

// ==================== INSTANTIATION DES USE CASES ====================

const repo = new MySQLAlertRepository();
const getAlertTypesUC = new GetAlertTypesUseCase(repo);
const createAlertTypeUC = new CreateAlertTypeUseCase(repo);
const updateAlertTypeUC = new UpdateAlertTypeUseCase(repo);
const deleteAlertTypeUC = new DeleteAlertTypeUseCase(repo);
const getUserAlertsUC = new GetUserAlertsUseCase(repo);
const createUserAlertUC = new CreateUserAlertUseCase(repo);
const resolveAlertUC = new ResolveAlertUseCase(repo);
const ignoreAlertUC = new IgnoreAlertUseCase(repo);
const getAdminAlertsUC = new GetAdminAlertsUseCase(repo);
const addAlertActionUC = new AddAlertActionUseCase(repo);
const getAlertActionsUC = new GetAlertActionsUseCase(repo);

// ==================== CONTROLLER ====================

export class AlertController {
  // ─── Admin : Types d'alertes ──────────────────────────────────────────────

  /**
   * GET /api/alerts/types
   * Retourne la liste des types d'alertes
   * Query param optionnel : ?activeOnly=true pour les actifs uniquement
   */
  async getAlertTypes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const onlyActive = req.query.activeOnly === 'true';
      const types = await getAlertTypesUC.execute(onlyActive);
      res.json({ success: true, message: "Types d'alertes récupérés", data: types });
    } catch (error: unknown) {
      console.error('[AlertController.getAlertTypes]', error);
      const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * POST /api/alerts/types
   * Crée un nouveau type d'alerte
   * Body : { code, nom, description?, priorite?, actif? }
   */
  async createAlertType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { code, nom, description, priorite, actif } = req.body as {
        code: unknown;
        nom: unknown;
        description?: unknown;
        priorite?: unknown;
        actif?: unknown;
      };

      if (!code || typeof code !== 'string' || !nom || typeof nom !== 'string') {
        res.status(400).json({ success: false, message: 'code et nom sont requis (chaînes)' });
        return;
      }

      const alertType = await createAlertTypeUC.execute({
        code,
        nom,
        description: typeof description === 'string' ? description : undefined,
        priorite: typeof priorite === 'string' ? (priorite as AlertPriorite) : undefined,
        actif: typeof actif === 'boolean' ? actif : undefined,
      });

      res.status(201).json({ success: true, message: "Type d'alerte créé", data: alertType });
    } catch (error: unknown) {
      console.error('[AlertController.createAlertType]', error);
      const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
      const isBadRequest =
        message.includes('requis') ||
        message.includes('invalide') ||
        message.includes('existe déjà');
      res.status(isBadRequest ? 400 : 500).json({ success: false, message });
    }
  }

  /**
   * PUT /api/alerts/types/:id
   * Modifie un type d'alerte existant
   * Body : { nom?, description?, priorite?, actif? }
   */
  async updateAlertType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Identifiant de type d'alerte invalide" });
        return;
      }

      const { nom, description, priorite, actif } = req.body as {
        nom?: unknown;
        description?: unknown;
        priorite?: unknown;
        actif?: unknown;
      };

      const alertType = await updateAlertTypeUC.execute(id, {
        nom: typeof nom === 'string' ? nom : undefined,
        description: typeof description === 'string' ? description : undefined,
        priorite: typeof priorite === 'string' ? (priorite as AlertPriorite) : undefined,
        actif: typeof actif === 'boolean' ? actif : undefined,
      });

      res.json({ success: true, message: "Type d'alerte mis à jour", data: alertType });
    } catch (error: unknown) {
      console.error('[AlertController.updateAlertType]', error);
      const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
      const status = message.includes('introuvable')
        ? 404
        : message.includes('invalide') || message.includes('vide')
          ? 400
          : 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * DELETE /api/alerts/types/:id
   * Supprime un type d'alerte
   */
  async deleteAlertType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Identifiant de type d'alerte invalide" });
        return;
      }

      const deleted = await deleteAlertTypeUC.execute(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Type d'alerte introuvable" });
        return;
      }

      res.json({ success: true, message: "Type d'alerte supprimé" });
    } catch (error: unknown) {
      console.error('[AlertController.deleteAlertType]', error);
      const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
      res.status(500).json({ success: false, message });
    }
  }

  // ─── Admin : Alertes utilisateurs ────────────────────────────────────────

  /**
   * GET /api/alerts/admin
   * Retourne toutes les alertes avec filtres optionnels (vue admin)
   * Query params : ?statut=active&priorite=haute&userId=123
   */
  async getAdminAlerts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const statut =
        typeof req.query.statut === 'string'
          ? (req.query.statut as AlertStatut)
          : undefined;
      const priorite =
        typeof req.query.priorite === 'string'
          ? (req.query.priorite as AlertPriorite)
          : undefined;
      const userIdRaw =
        typeof req.query.userId === 'string' ? Number(req.query.userId) : undefined;
      const userId =
        userIdRaw !== undefined && !isNaN(userIdRaw) ? userIdRaw : undefined;

      const alerts = await getAdminAlertsUC.execute({ statut, priorite, userId });
      res.json({ success: true, message: 'Alertes récupérées', data: alerts });
    } catch (error: unknown) {
      console.error('[AlertController.getAdminAlerts]', error);
      const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * POST /api/alerts/admin
   * Crée manuellement une alerte pour un utilisateur (admin)
   * Body : { user_id, alerte_type_id, donnees_contexte?, notes? }
   */
  async createUserAlert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { user_id, alerte_type_id, donnees_contexte, notes } = req.body as {
        user_id: unknown;
        alerte_type_id: unknown;
        donnees_contexte?: unknown;
        notes?: unknown;
      };

      if (!user_id || typeof user_id !== 'number') {
        res.status(400).json({ success: false, message: 'user_id est requis (nombre entier)' });
        return;
      }

      if (!alerte_type_id || typeof alerte_type_id !== 'number') {
        res.status(400).json({
          success: false,
          message: 'alerte_type_id est requis (nombre entier)',
        });
        return;
      }

      const contexte =
        donnees_contexte !== null &&
        typeof donnees_contexte === 'object' &&
        !Array.isArray(donnees_contexte)
          ? (donnees_contexte as Record<string, unknown>)
          : undefined;

      const alert = await createUserAlertUC.execute({
        user_id,
        alerte_type_id,
        donnees_contexte: contexte,
        notes: typeof notes === 'string' ? notes : undefined,
      });

      res.status(201).json({ success: true, message: 'Alerte créée', data: alert });
    } catch (error: unknown) {
      console.error('[AlertController.createUserAlert]', error);
      const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
      const isBadRequest =
        message.includes('requis') ||
        message.includes('introuvable') ||
        message.includes('désactivé');
      res.status(isBadRequest ? 400 : 500).json({ success: false, message });
    }
  }

  /**
   * PATCH /api/alerts/admin/:id/resolve
   * Résout une alerte (resolu_par = utilisateur connecté)
   * Body : { notes? }
   */
  async resolveAlert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Identifiant d'alerte invalide" });
        return;
      }

      const resolvedBy = req.user!.userId;
      const { notes } = req.body as { notes?: unknown };

      const alert = await resolveAlertUC.execute(
        id,
        resolvedBy,
        typeof notes === 'string' ? notes : undefined,
      );

      res.json({ success: true, message: 'Alerte résolue', data: alert });
    } catch (error: unknown) {
      console.error('[AlertController.resolveAlert]', error);
      const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
      const status = message.includes('introuvable')
        ? 404
        : message.includes('invalide')
          ? 400
          : 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * PATCH /api/alerts/admin/:id/ignore
   * Ignore une alerte
   */
  async ignoreAlert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Identifiant d'alerte invalide" });
        return;
      }

      const alert = await ignoreAlertUC.execute(id);
      res.json({ success: true, message: 'Alerte ignorée', data: alert });
    } catch (error: unknown) {
      console.error('[AlertController.ignoreAlert]', error);
      const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
      const status = message.includes('introuvable')
        ? 404
        : message.includes('invalide')
          ? 400
          : 500;
      res.status(status).json({ success: false, message });
    }
  }

  /**
   * GET /api/alerts/admin/:id/actions
   * Retourne l'historique des actions d'une alerte
   */
  async getAlertActions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Identifiant d'alerte invalide" });
        return;
      }

      const actions = await getAlertActionsUC.execute(id);
      res.json({ success: true, message: "Actions de l'alerte récupérées", data: actions });
    } catch (error: unknown) {
      console.error('[AlertController.getAlertActions]', error);
      const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
      res.status(500).json({ success: false, message });
    }
  }

  /**
   * POST /api/alerts/admin/:id/actions
   * Ajoute une action à une alerte
   * Body : { action_type, description? }
   */
  async addAlertAction(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ success: false, message: "Identifiant d'alerte invalide" });
        return;
      }

      const { action_type, description } = req.body as {
        action_type: unknown;
        description?: unknown;
      };

      if (!action_type || typeof action_type !== 'string') {
        res.status(400).json({ success: false, message: 'action_type est requis (chaîne)' });
        return;
      }

      const userId = req.user?.userId;

      const action = await addAlertActionUC.execute({
        alerte_user_id: id,
        user_id: userId,
        action_type: action_type as AlertActionType,
        description: typeof description === 'string' ? description : undefined,
      });

      res.status(201).json({ success: true, message: 'Action ajoutée', data: action });
    } catch (error: unknown) {
      console.error('[AlertController.addAlertAction]', error);
      const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
      const isBadRequest = message.includes('requis') || message.includes('invalide');
      res.status(isBadRequest ? 400 : 500).json({ success: false, message });
    }
  }

  // ─── Member : Alertes de l'utilisateur connecté ──────────────────────────

  /**
   * GET /api/alerts/me
   * Retourne les alertes de l'utilisateur connecté
   * Query param optionnel : ?statut=active
   */
  async getMyAlerts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const statut =
        typeof req.query.statut === 'string'
          ? (req.query.statut as AlertStatut)
          : undefined;

      const alerts = await getUserAlertsUC.execute(userId, statut);
      res.json({ success: true, message: 'Mes alertes récupérées', data: alerts });
    } catch (error: unknown) {
      console.error('[AlertController.getMyAlerts]', error);
      const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
      res.status(500).json({ success: false, message });
    }
  }
}
