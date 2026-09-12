const fs = require('fs');

let content = fs.readFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', 'utf8');

const newTokenGen = `        // Générer un token pour cet admin
        const tokens = JwtService.generateTokenPair({
          userId: admin.id,
          email: admin.email,
          userIdString: 'IMPERSONATED',
          role_app: 'admin' as any,
          global_role: 'org_admin' as any,
          tenantDbName: admin.db_name,
          isImpersonating: true
        } as any);`;

content = content.replace(/[\s\S]*?(const tokens = JwtService\.generateTokenPair\(\{[\s\S]+?dbName: admin\.db_name\s+\}\);)/, (match, p1) => {
    return match.replace(p1, newTokenGen);
});

fs.writeFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', content);
