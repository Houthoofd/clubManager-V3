import { Request, Response } from 'express';
import { tenantManager } from '../../../../core/database/TenantManager';

export class SaaSBillingController {
  public getPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      const masterPool = tenantManager.getMasterPool();
      const [rows] = await masterPool.query('SELECT * FROM saas_plans ORDER BY created_at ASC');
      res.json({ success: true, data: rows });
    } catch (error: any) {
      console.error('[SaaSBillingController] Error fetching plans:', error);
      res.status(500).json({ success: false, message: 'Erreur' });
    }
  };

  public createPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, price, billing_cycle, max_members, features, is_active } = req.body;
      const masterPool = tenantManager.getMasterPool();
      const featuresJson = typeof features === 'string' ? features : JSON.stringify(features);
      const query = `
        INSERT INTO saas_plans (name, description, price, billing_cycle, max_members, features, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await masterPool.query(query, [
        name,
        description,
        price,
        billing_cycle || 'monthly',
        max_members,
        featuresJson,
        is_active !== undefined ? is_active : true
      ]) as any;

      res.json({ success: true, data: { id: result.insertId } });
    } catch (error: any) {
      console.error('[SaaSBillingController] Error creating plan:', error);
      res.status(500).json({ success: false, message: 'Erreur' });
    }
  };

  public updatePlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, price, billing_cycle, max_members, features, is_active } = req.body;
      const masterPool = tenantManager.getMasterPool();
      const featuresJson = typeof features === 'string' ? features : JSON.stringify(features);
      const query = `
        UPDATE saas_plans 
        SET name = ?, description = ?, price = ?, billing_cycle = ?, max_members = ?, features = ?, is_active = ?
        WHERE id = ?
      `;
      await masterPool.query(query, [
        name,
        description,
        price,
        billing_cycle,
        max_members,
        featuresJson,
        is_active,
        id
      ]);

      res.json({ success: true, message: 'Plan mis à jour' });
    } catch (error: any) {
      console.error('[SaaSBillingController] Error updating plan:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  public deletePlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const masterPool = tenantManager.getMasterPool();
      await masterPool.query('DELETE FROM saas_plans WHERE id = ?', [id]);
      res.json({ success: true, message: 'Plan supprimé' });
    } catch (error: any) {
      console.error('[SaaSBillingController] Error deleting plan:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  public getAllSubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const masterPool = tenantManager.getMasterPool();
      const [rows] = await masterPool.query('SELECT * FROM saas_subscriptions ORDER BY created_at DESC');
      res.json({ success: true, data: rows });
    } catch (error: any) {
      console.error('[SaaSBillingController] Error fetching subscriptions:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  public getAllInvoices = async (req: Request, res: Response): Promise<void> => {
    try {
      const masterPool = tenantManager.getMasterPool();
      const [rows] = await masterPool.query('SELECT * FROM saas_invoices ORDER BY created_at DESC');
      res.json({ success: true, data: rows });
    } catch (error: any) {
      console.error('[SaaSBillingController] Error fetching invoices:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  public cancelSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const masterPool = tenantManager.getMasterPool();
      await masterPool.query('UPDATE saas_subscriptions SET status = ? WHERE id = ?', ['canceled', id]);
      res.json({ success: true, message: 'Abonnement annulé' });
    } catch (error: any) {
      console.error('[SaaSBillingController] Error canceling subscription:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };
}
