const fs = require('fs');

let controller = fs.readFileSync('backend/src/modules/onboarding/presentation/controllers/OnboardingController.ts', 'utf8');

// Insert import at the top
controller = "import { tenantManager } from '../../../../core/database/TenantManager';\n" + controller;

const newCode = `  public provision = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      
      if (!token) {
         res.status(403).json({ message: 'Un jeton d\\'invitation valide est requis pour créer un club.' });
         return;
      }

      const masterPool = tenantManager.getMasterPool();
      const [invitations] = await masterPool.query(
        'SELECT * FROM organization_invitations WHERE token = ? AND status = ? AND expires_at > NOW()',
        [token, 'pending']
      ) as any;

      if (!invitations || invitations.length === 0) {
         res.status(403).json({ message: 'Jeton d\\'invitation invalide ou expiré.' });
         return;
      }

      const result = await this.provisionTenantUseCase.execute(req.body);
      
      // Update invitation status
      await masterPool.query(
        'UPDATE organization_invitations SET status = ?, organization_id = ? WHERE id = ?',
        ['accepted', result.tenant.id, invitations[0].id]
      );

      res.status(201).json({
        message: 'Tenant provisioned successfully',
        data: result
      });`;

controller = controller.replace(
  /public provision = async \(req: Request, res: Response\): Promise<void> => {\s*try {\s*const result = await this\.provisionTenantUseCase\.execute\(req\.body\);\s*res\.status\(201\)\.json\({\s*message: 'Tenant provisioned successfully',\s*data: result\s*}\);/,
  newCode
);

fs.writeFileSync('backend/src/modules/onboarding/presentation/controllers/OnboardingController.ts', controller);
