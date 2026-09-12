import { Request, Response } from 'express';
import { tenantManager } from '../../../../core/database/TenantManager.js';

export class SaaSModulesController {
  public getAllModules = async (req: Request, res: Response): Promise<void> => {
    try {
      const masterPool = tenantManager.getMasterPool();
      const [rows] = await masterPool.query('SELECT * FROM saas_modules ORDER BY created_at ASC');
      res.json({ success: true, data: rows });
    } catch (error: any) {
      console.error('[SaaSModulesController] Error fetching modules:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  public createModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, name, description, status, type, pricing, isEnabledGlobally, dependencies } = req.body;
      const masterPool = tenantManager.getMasterPool();
      const depsJson = typeof dependencies === 'string' ? dependencies : JSON.stringify(dependencies || []);
      const query = `
        INSERT INTO saas_modules (id, name, description, status, type, pricing, isEnabledGlobally, dependencies)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await masterPool.query(query, [
        id, name, description, status, type, pricing, isEnabledGlobally || false, depsJson
      ]);
      res.json({ success: true, data: { id } });
    } catch (error: any) {
      console.error('[SaaSModulesController] Error creating module:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  public updateModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, status, type, pricing, isEnabledGlobally, dependencies } = req.body;
      const masterPool = tenantManager.getMasterPool();
      const depsJson = typeof dependencies === 'string' ? dependencies : JSON.stringify(dependencies || []);
      const query = `
        UPDATE saas_modules 
        SET name = ?, description = ?, status = ?, type = ?, pricing = ?, isEnabledGlobally = ?, dependencies = ?
        WHERE id = ?
      `;
      await masterPool.query(query, [
        name, description, status, type, pricing, isEnabledGlobally, depsJson, id
      ]);
      res.json({ success: true, message: 'Module mis à jour' });
    } catch (error: any) {
      console.error('[SaaSModulesController] Error updating module:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  public toggleModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const masterPool = tenantManager.getMasterPool();
      const [rows] = await masterPool.query('SELECT isEnabledGlobally FROM saas_modules WHERE id = ?', [id]) as any;
      if (!rows.length) {
        res.status(404).json({ success: false, message: 'Module introuvable' });
        return;
      }
      const newValue = !rows[0].isEnabledGlobally;
      await masterPool.query('UPDATE saas_modules SET isEnabledGlobally = ? WHERE id = ?', [newValue, id]);
      res.json({ success: true, message: 'Statut du module basculé', isEnabledGlobally: newValue });
    } catch (error: any) {
      console.error('[SaaSModulesController] Error toggling module:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };
}
