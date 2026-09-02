const fs = require('fs');
let c = fs.readFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', 'utf8');

const regex = /const activeUsers = usersRes\.users;\s*const emails = activeUsers\.map\(u => u\.email\)\.filter\(e => e\);/m;
const replacement = `const activeUsers = usersRes.users;
      const emails = activeUsers.map(u => u.email).filter(e => e);
      console.log("ACTIVE USERS COUNT:", activeUsers.length);
      console.log("EMAILS COUNT:", emails.length);
      if (emails.length > 0) {
        console.log("FIRST EMAIL:", emails[0]);
      }`;

c = c.replace(regex, replacement);
fs.writeFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', c, 'utf8');
