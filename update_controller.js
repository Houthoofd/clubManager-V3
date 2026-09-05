const fs = require('fs');

const code = `import { Request, Response } from 'express';
import { tenantManager } from '../../../../core/database/TenantManager';

export class SuperAdminController {
  
  public getClubs = async (req: Request, res: Response): Promise<void> => {
    try {
      const masterPool = tenantManager.getMasterPool();
      const query = \`
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
      \`;
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
      res.status(500).json({ success: false, message: 'Erreur serveur' });
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
}
`;

fs.writeFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', code);
