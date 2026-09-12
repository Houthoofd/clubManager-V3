const fs = require('fs');

let content = fs.readFileSync('backend/src/shared/middleware/authMiddleware.ts', 'utf8');

const oldUserSet = `      (req as AuthRequest).user = {
        userId: decoded.userId,
        email: decoded.email,
        userIdString: decoded.userIdString,
        role_app: decoded.role_app,
      };`;

const newUserSet = `      (req as AuthRequest).user = {
        userId: decoded.userId,
        email: decoded.email,
        userIdString: decoded.userIdString,
        role_app: decoded.role_app,
        tenantDbName: decoded.tenantDbName,
        isImpersonating: decoded.isImpersonating,
      } as any;`;

content = content.replace(oldUserSet, newUserSet);
// In case the second occurrence exists
content = content.replace(oldUserSet, newUserSet);

// Let's also add it to AuthRequest type
const oldType = `  user?: {
    userId: number;
    email: string;
    userIdString: string;
    role_app?: UserRole;
  };`;
const newType = `  user?: {
    userId: number;
    email: string;
    userIdString: string;
    role_app?: UserRole;
    tenantDbName?: string;
    isImpersonating?: boolean;
  };`;

content = content.replace(oldType, newType);

fs.writeFileSync('backend/src/shared/middleware/authMiddleware.ts', content);
