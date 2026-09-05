const fs = require('fs');
const crypto = require('crypto');

let controller = fs.readFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', 'utf8');

const newMethods = `
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
      
      const inviteLink = \`http://localhost:5173/onboarding?token=\${token}\`;
      
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
`;

controller = controller.replace(/}\s*$/, newMethods + '\n}\n');

fs.writeFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', controller);

let routes = fs.readFileSync('backend/src/modules/superadmin/presentation/routes/superadminRoutes.ts', 'utf8');
routes = routes.replace(
  "export default router;",
  "router.post('/clubs/invite', superAdminController.inviteClub);\nexport default router;"
);
fs.writeFileSync('backend/src/modules/superadmin/presentation/routes/superadminRoutes.ts', routes);
