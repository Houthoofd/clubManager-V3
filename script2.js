const fs = require('fs');
let c = fs.readFileSync('frontend/src/features/events/pages/EventsPage.tsx', 'utf8');

c = c.replace(/const announceMutation = useMutation\(\{[\s\S]*?\}\);/, '');
c = c.replace(/if \(window\.confirm\([^)]+\)\)\s*announceMutation\.mutate\(evt\.id\);/g, "setAnnounceModalEventId(evt.id);");

fs.writeFileSync('frontend/src/features/events/pages/EventsPage.tsx', c);
