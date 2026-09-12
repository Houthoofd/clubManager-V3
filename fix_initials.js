const fs = require('fs');

let content = fs.readFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', 'utf8');

const oldUser = `          user: {
            id: admin.id,
            email: admin.email,
            role_app: 'org_admin',
            tenantDbName: admin.db_name
          }`;

const newUser = `          user: {
            id: admin.id,
            email: admin.email,
            first_name: 'Admin',
            last_name: 'Club',
            role_app: 'org_admin',
            tenantDbName: admin.db_name
          }`;

content = content.replace(oldUser, newUser);
fs.writeFileSync('backend/src/modules/superadmin/presentation/controllers/SuperAdminController.ts', content);

let authContent = fs.readFileSync('frontend/src/shared/hooks/useAuth.ts', 'utf8');
const oldInitials = `  const getInitials = useCallback((): string => {
    if (!user) return "";
    return \`\${user.first_name[0]}\${user.last_name[0]}\`.toUpperCase();
  }, [user]);`;

const newInitials = `  const getInitials = useCallback((): string => {
    if (!user) return "";
    const first = user.first_name || 'A';
    const last = user.last_name || 'C';
    return \`\${first[0]}\${last[0]}\`.toUpperCase();
  }, [user]);`;

authContent = authContent.replace(oldInitials, newInitials);
fs.writeFileSync('frontend/src/shared/hooks/useAuth.ts', authContent);

console.log("Patched backend and frontend!");
