const fs = require('fs');
let c = fs.readFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', 'utf8');

c = c.replace(
  "const activeUsers = usersRes.users.filter(u => u.active);",
  "const activeUsers = usersRes.users;"
);

fs.writeFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', c, 'utf8');
