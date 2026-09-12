import { JwtService } from '../../../../shared/services/JwtService.js';
import { Request, Response } from 'express';
import { tenantManager } from '../../../../core/database/TenantManager';

export class SuperAdminController {
  
  public getClubs = async (req: Request, res: Response): Promise<void> => {
    try {
      const masterPool = tenantManager.getMasterPool();
      const query = `
        SELECT 
          o.id, 
          o.name, 
          o.slug, 
          o.code, 
          o.db_name, 
          o.contact_email, 
          o.contact_phone, 
          o.status, 
          o.created_at,
          COUNT(m.id) as admin_count
        FROM organizations o
        LEFT JOIN master_users m ON m.organization_id = o.id
        WHERE o.status != 'deleted'
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      const [rows] = await masterPool.query(query);
      res.json({ success: true, data: rows });
    } catch (error: any) {
      console.error('[SuperAdminController] Error fetching clubs:', error);
      res.status(500).json({ success: false, message: 'Erreur' });
    }
  };

  public updateClubStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const masterPool = tenantManager.getMasterPool();
      await masterPool.query('UPDATE organizations SET status = ? WHERE id = ?', [status, id]);
      res.json({ success: true, message: 'Statut mis à jour' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Erreur serveur: ' + (error instanceof Error ? error.message : String(error)), stack: (error instanceof Error ? error.stack : undefined) });
    }
  };

  public updateClub = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, code, contact_email, contact_phone } = req.body;
      const masterPool = tenantManager.getMasterPool();
      
      await masterPool.query(
        'UPDATE organizations SET name = ?, code = ?, contact_email = ?, contact_phone = ? WHERE id = ?',
        [name, code, contact_email, contact_phone, id]
      );
      
      res.json({ success: true, message: 'Organisation mise à jour avec succès' });
    } catch (error: any) {
      console.error('[SuperAdminController] Error updating club:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  public deleteClub = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const masterPool = tenantManager.getMasterPool();
      
      // Soft Delete: on passe le statut à "deleted" au lieu de détruire la base
      await masterPool.query('UPDATE organizations SET status = ? WHERE id = ?', ['deleted', id]);
      
      res.json({ success: true, message: 'Organisation supprimée (Soft delete)' });
    } catch (error: any) {
      console.error('[SuperAdminController] Error deleting club:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur lors de la suppression' });
    }
  };

  public inviteClub = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: 'Email requis' });
        return;
      }
      const masterPool = tenantManager.getMasterPool();
      const token = require('crypto').randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Valide 7 jours

      await masterPool.query(
        'INSERT INTO organization_invitations (email, token, expires_at) VALUES (?, ?, ?)',
        [email, token, expiresAt]
      );
      
      const inviteLink = `http://localhost:5173/onboarding?token=${token}`;
      
      res.json({ 
        success: true, 
        message: 'Invitation générée avec succès', 
        data: { inviteLink, token } 
      });
    } catch (error: any) {
      console.error('[SuperAdminController] Error inviting club:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };


public impersonateClub = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const masterPool = tenantManager.getMasterPool();
      const [admins] = await masterPool.query(
        'SELECT mu.id, mu.email, o.db_name FROM master_users mu JOIN organizations o ON mu.organization_id = o.id WHERE mu.organization_id = ? AND mu.global_role = ? LIMIT 1',
        [id, 'org_admin']
      ) as any;

      if (!admins || admins.length === 0) {
        res.status(404).json({ success: false, message: 'Aucun administrateur trouvé pour ce club' });
        return;
      }
      const admin = admins[0];
      const tokens = JwtService.generateTokenPair({
        userId: admin.id,
        email: admin.email,
        userIdString: `ADMIN-${admin.id}`,
        role_app: 'admin', // Use valid role
        tenantDbName: admin.db_name,
        isImpersonating: true
      } as any);

      res.json({
        success: true,
        message: 'Impersonation réussie',
        data: {
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: admin.id,
            email: admin.email,
            first_name: 'Admin',
            last_name: 'Club',
            role_app: 'admin',
            tenantDbName: admin.db_name
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Erreur serveur: ' + String(error) + ' ' + (error.stack || '') });
    }
  };


  public extendTrial = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const masterPool = tenantManager.getMasterPool();
      
      // Rajouter 1 mois à partir d'aujourd'hui (ou étendre de 1 mois si déjà dans le futur)
      await masterPool.query(
        "UPDATE organizations SET trial_ends_at = DATE_ADD(GREATEST(COALESCE(trial_ends_at, NOW()), NOW()), INTERVAL 1 MONTH), status = 'trial' WHERE id = ?",
        [id]
      );
      
      res.json({ success: true, message: 'Essai prolongé de 1 mois avec succès.' });
    } catch (error: any) {
      console.error('[SuperAdminController] Error extending trial:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

}
