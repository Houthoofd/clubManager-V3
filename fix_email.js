const fs = require('fs');
let c = fs.readFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', 'utf8');
c = c.replace(/await emailService\.sendCustomEmail\(u\.email, subject, htmlContent\);/g, "await emailService.sendCustomEmail([u.email], subject, htmlContent);");
fs.writeFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', c, 'utf8');
