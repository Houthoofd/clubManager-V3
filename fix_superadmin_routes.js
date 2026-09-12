const fs = require('fs');

let content = fs.readFileSync('backend/src/modules/superadmin/presentation/routes/superAdminRoutes.ts', 'utf8');

// 1. Import authMiddleware
content = "import { authMiddleware } from '../../../shared/middleware/authMiddleware.js';\n" + content;

// 2. Replace checkSuperAdmin
const oldMiddleware = `const checkSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  next();
};

router.use(checkSuperAdmin);`;

const newMiddleware = `const checkSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user?.role_app !== 'super_admin' && (req as any).user?.global_role !== 'super_admin') {
    res.status(403).json({ success: false, message: 'Accès interdit' });
    return;
  }
  next();
};

router.use(authMiddleware);
router.use(checkSuperAdmin);`;

content = content.replace(oldMiddleware, newMiddleware);

fs.writeFileSync('backend/src/modules/superadmin/presentation/routes/superAdminRoutes.ts', content);
