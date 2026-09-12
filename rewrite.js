const fs = require('fs');

let content = fs.readFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', 'utf8');

const oldFn = `public impersonateClub = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Ensure caller is superadmin
      if ((req.user as any)?.role_app !== 'super_admin' && (req.user as any)?.global_role !== 'super_admin') {
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
        userIdString: \`ADMIN-\${admin.id}\`,
        role_app: 'admin',
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
            role_app: 'admin',
            tenantDbName: admin.db_name
          }
        }
      });
    } catch (error: any) {
      console.error('[SuperAdminController] Error impersonating club:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };`;

// Use regex to replace the function robustly
content = content.replace(/public impersonateClub[\s\S]*?catch \(error: any\) \{[\s\S]*?\};/m, `public impersonateClub = async (req: Request, res: Response): Promise<void> => {
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
        userIdString: \`ADMIN-\${admin.id}\`,
        role_app: 'org_admin', // Use valid role
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
            role_app: 'org_admin',
            tenantDbName: admin.db_name
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Erreur serveur: ' + String(error) + ' ' + (error.stack || '') });
    }
  };`);

fs.writeFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', content);
