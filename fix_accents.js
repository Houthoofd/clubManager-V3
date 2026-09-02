const fs = require('fs');
let c = fs.readFileSync('frontend/src/features/events/components/AnnounceEventModal.tsx', 'utf8');

// Replace malformed characters
c = c.replace(/Annoncer l'\ufffdv\ufffdnement/g, "Annoncer l'événement");
c = c.replace(/Annoncer l'.v.nement/g, "Annoncer l'événement"); // regex fallback

c = c.replace(/cet \ufffdv\ufffdnement/g, "cet événement");
c = c.replace(/cet .v.nement/g, "cet événement");

c = c.replace(/\ufffdtous les membres/g, "à tous les membres");
c = c.replace(/.tous les membres/g, "à tous les membres");

c = c.replace(/envoy\ufffd/g, "envoyé");
c = c.replace(/envoy./g, "envoyé");

c = c.replace(/d\ufffdtails/g, "détails");
c = c.replace(/d.tails/g, "détails");

fs.writeFileSync('frontend/src/features/events/components/AnnounceEventModal.tsx', c);
