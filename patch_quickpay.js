const fs = require('fs');
let content = fs.readFileSync('frontend/src/features/payments/pages/QuickPayPage.tsx', 'utf8');
content = content.replace(
  `setStripeClientSecret((intent as any).clientSecret || (intent as any).client_secret);`,
  `setStripeClientSecret((intent as any).data?.clientSecret || (intent as any).clientSecret || (intent as any).client_secret);`
);
content = content.replace(
  `{item.type === "cotisation" ? "Cotisation" : "Boutique"}`,
  `{item.type === "cotisation" ? "Cotisation" : item.type === "evenement" ? "Événement" : "Boutique"}`
);
fs.writeFileSync('frontend/src/features/payments/pages/QuickPayPage.tsx', content, 'utf8');
