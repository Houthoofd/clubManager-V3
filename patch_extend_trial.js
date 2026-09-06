const fs = require('fs');

let controller = fs.readFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', 'utf8');

const newMethod = `
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
`;

controller = controller.replace(/}\s*$/, newMethod + '\n}\n');
fs.writeFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', controller);

let routes = fs.readFileSync('backend/src/modules/superadmin/presentation/routes/superadminRoutes.ts', 'utf8');
routes = routes.replace(
  "export default router;",
  "router.post('/clubs/:id/extend-trial', superAdminController.extendTrial);\nexport default router;"
);
fs.writeFileSync('backend/src/modules/superadmin/presentation/routes/superadminRoutes.ts', routes);
