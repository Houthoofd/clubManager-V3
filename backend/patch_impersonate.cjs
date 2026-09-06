const fs = require('fs');

let controller = fs.readFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', 'utf8');

const newCode = `
import { JwtService } from '../../../../shared/services/JwtService.js';

  public impersonateClub = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Ensure caller is superadmin
      if ((req.user as any)?.global_role !== 'super_admin') {
        res.status(403).json({ success: false, message: 'Accès interdit' });
        return;
      }

      const masterPool = tenantManager.getMasterPool();
      
      // Find an admin for this club
      const [admins] = await masterPool.query(
        'SELECT mu.id, mu.email, o.db_name FROM master_users mu JOIN organizations o ON mu.organization_id = o.id WHERE mu.organization_id = ? AND mu.global_role = ? LIMIT 1',
        [id, 'org_admin']
      ) as any;

      if (!admins || admins.length === 0) {
        res.status(404).json({ success: false, message: 'Aucun administrateur trouvé pour ce club' });
        return;
      }

      const admin = admins[0];

      // Générer un token pour cet admin
      const tokens = JwtService.generateTokenPair({
        userId: admin.id,
        email: admin.email,
        userIdString: 'IMPERSONATED',
        role_app: 'admin',
        global_role: 'org_admin',
        dbName: admin.db_name
      });

      res.json({
        success: true,
        message: 'Impersonation réussie',
        data: {
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: admin.id,
            email: admin.email,
            role_app: 'admin',
            global_role: 'org_admin'
          }
        }
      });
    } catch (error: any) {
      console.error('[SuperAdminController] Error impersonating club:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };
`;

// Insert the new code before the last closing brace
controller = controller.replace(/}\s*$/, newCode + '\n}\n');

// Make sure to add JwtService import if missing
if (!controller.includes('import { JwtService }')) {
    controller = "import { JwtService } from '../../../../shared/services/JwtService.js';\n" + controller;
}
// Note: we might have duplicated the import in newCode, let's clean it up:
controller = controller.replace(/import \{ JwtService \} from '\.\.\/\.\.\/\.\.\/\.\.\/shared\/services\/JwtService\.js';\s*public impersonateClub/, 'public impersonateClub');

fs.writeFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', controller);

let routes = fs.readFileSync('backend/src/modules/superadmin/presentation/routes/superadminRoutes.ts', 'utf8');
routes = routes.replace(
  "export default router;",
  "router.post('/clubs/:id/impersonate', superAdminController.impersonateClub);\nexport default router;"
);
fs.writeFileSync('backend/src/modules/superadmin/presentation/routes/superadminRoutes.ts', routes);
