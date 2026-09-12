const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/superadmin/presentation/routes/superAdminRoutes.ts', 'utf8');

content = content.replace(
    "const checkSuperAdmin = (req: Request, res: Response, next: NextFunction) => {",
    "const checkSuperAdmin = (req: Request, res: Response, next: NextFunction) => {\n  console.log('USER IN CHECK:', (req as any).user);"
);

fs.writeFileSync('backend/src/modules/superadmin/presentation/routes/superAdminRoutes.ts', content);
