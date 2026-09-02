const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/payments/presentation/controllers/PaymentController.ts', 'utf8');

// The block starts with `if (intent.status === "succeeded") {`
// Let's place the event registration right after checking the payment.

const target = `if (payment && payment.statut_code !== "valide") {`;

const replacement = `if (item_type === "evenement" && item_id && payment?.user_id) {
            console.log("[verifyPublicPayment] Registering user to event:", item_id);
            try {
              const eventRepo = new MySQLEventRepository();
              const registerUC = new RegisterToEventUseCase(eventRepo);
              await registerUC.execute({
                event_id: Number(item_id),
                user_id: payment.user_id,
                price_paid: payment.montant
              });
              console.log("[verifyPublicPayment] User registered to event successfully.");
            } catch (err: any) {
              if (err.message && err.message.includes('409')) {
                console.log("[verifyPublicPayment] User already registered, ignoring.");
              } else {
                console.error("[verifyPublicPayment] Failed to register user to event:", err);
              }
            }
          }

          if (payment && payment.statut_code !== "valide") {`;

// Normalize line endings to avoid CRLF / LF issues
const normalizedContent = content.replace(/\r\n/g, '\n');
if (normalizedContent.includes(target)) {
  content = normalizedContent.replace(target, replacement);
  
  // also remove the old one inside the block if it exists
  const oldPatch = `// Register user to event if item_type === "evenement"
          if (item_type === "evenement" && item_id && payment.user_id) {
            console.log("[verifyPublicPayment] Registering user to event:", item_id);
            try {
              const eventRepo = new MySQLEventRepository();
              const registerUC = new RegisterToEventUseCase(eventRepo);
              await registerUC.execute({
                event_id: Number(item_id),
                user_id: payment.user_id,
                price_paid: payment.montant
              });
              console.log("[verifyPublicPayment] User registered to event successfully.");
            } catch (err) {
              console.error("[verifyPublicPayment] Failed to register user to event:", err);
            }
          }`;
  content = content.replace(oldPatch, '');
  
  fs.writeFileSync('backend/src/modules/payments/presentation/controllers/PaymentController.ts', content, 'utf8');
  console.log('Successfully patched verifyPublicPayment');
} else {
  console.log('Could not find patch target');
}
