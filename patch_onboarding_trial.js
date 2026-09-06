const fs = require('fs');

let c = fs.readFileSync('backend/src/modules/onboarding/application/useCases/ProvisionTenantUseCase.ts', 'utf8');

c = c.replace(
  /INSERT INTO organizations \(uuid, name, slug, code, db_name, contact_email, status\) \n\s*VALUES \(\?, \?, \?, \?, \?, \?, 'trial'\)/,
  "INSERT INTO organizations (uuid, name, slug, code, db_name, contact_email, status, trial_ends_at) \n         VALUES (?, ?, ?, ?, ?, ?, 'trial', DATE_ADD(NOW(), INTERVAL 1 MONTH))"
);

fs.writeFileSync('backend/src/modules/onboarding/application/useCases/ProvisionTenantUseCase.ts', c);
