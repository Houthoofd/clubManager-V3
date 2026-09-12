const fs = require('fs');
let content = fs.readFileSync('backend/src/shared/middleware/authMiddleware.ts', 'utf8');

if (!content.includes('tenantContext')) {
    content = "import { tenantContext } from '@/core/context/tenantContext.js';\n" + content;
}

// 1. Add tenantDbName to AuthRequest interface
content = content.replace(
    /role_app\?: UserRole;\n    \};/,
    "role_app?: UserRole;\n      tenantDbName?: string;\n    };"
);

// 2. Add tenantDbName to req.user assignments
content = content.replace(
    /role_app: decoded\.role_app,\n      \};\n/g,
    "role_app: decoded.role_app,\n        tenantDbName: decoded.tenantDbName,\n      };\n"
);

// 3. Wrap next() in tenantContext.run() for both places where next() is called
const replaceNext1 = `      (req as AuthRequest).user = {
        userId: decoded.userId,
        email: decoded.email,
        userIdString: decoded.userIdString,
        role_app: decoded.role_app,
        tenantDbName: decoded.tenantDbName,
      };

      const contextData = {
        tenantId: null,
        dbName: decoded.tenantDbName || null,
        isMaster: !decoded.tenantDbName || decoded.role_app === 'super_admin'
      };

      tenantContext.run(contextData, () => {
        next();
      });
    } catch (error: any) {`;

content = content.replace(/      \(req as AuthRequest\)\.user = \{\n        userId: decoded\.userId,\n        email: decoded\.email,\n        userIdString: decoded\.userIdString,\n        role_app: decoded\.role_app,\n        tenantDbName: decoded\.tenantDbName,\n      \};\n\n      next\(\);\n    \} catch \(error: any\) \{/, replaceNext1);

const replaceNext2 = `        (req as AuthRequest).user = {
          userId: decoded.userId,
          email: decoded.email,
          userIdString: decoded.userIdString,
          role_app: decoded.role_app,
          tenantDbName: decoded.tenantDbName,
        };

        const contextData = {
          tenantId: null,
          dbName: decoded.tenantDbName || null,
          isMaster: !decoded.tenantDbName || decoded.role_app === 'super_admin'
        };

        tenantContext.run(contextData, () => {
          next();
        });
      } catch (error: any) {`;

content = content.replace(/        \(req as AuthRequest\)\.user = \{\n          userId: decoded\.userId,\n          email: decoded\.email,\n          userIdString: decoded\.userIdString,\n          role_app: decoded\.role_app,\n          tenantDbName: decoded\.tenantDbName,\n        \};\n\n        next\(\);\n      \} catch \(error: any\) \{/, replaceNext2);

fs.writeFileSync('backend/src/shared/middleware/authMiddleware.ts', content);
console.log("Patched authMiddleware.ts");
