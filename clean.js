const fs = require('fs');
let c = fs.readFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', 'utf8');

c = c.replace(/      console\.log\("ACTIVE USERS COUNT:", activeUsers\.length\);\n      console\.log\("EMAILS COUNT:", emails\.length\);\n      if \(emails\.length > 0\) \{\n        console\.log\("FIRST EMAIL:", emails\[0\]\);\n      \}\n/, '');
fs.writeFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', c, 'utf8');
