const fs = require('fs');
const file = 'backend/src/modules/users/presentation/routes/userRoutes.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'router.get("/", requireRole(UserRole.ADMIN, UserRole.PROFESSOR), (req, res) =>',
    'router.get("/", (req, res) =>'
);
content = content.replace(
    '// GET /api/users \u2014 admin + professor',
    '// GET /api/users \u2014 admin + professor + member (for messaging autocomplete)'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed userRoutes.ts');
