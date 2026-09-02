const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/payments/presentation/controllers/PaymentController.ts', 'utf8');

const target = 'if (payment.commande_id) {\n            await markOrderAsPaidUC.execute(payment.commande_id);\n            console.log("[verifyPublicPayment] Marked order as paid:", payment.commande_id);\n          }';

const replacement = `if (payment.commande_id) {
            await markOrderAsPaidUC.execute(payment.commande_id);
            console.log("[verifyPublicPayment] Marked order as paid:", payment.commande_id);
          }

          // Register user to event if item_type === "evenement"
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

// Normalize line endings to avoid CRLF / LF issues
const normalizedContent = content.replace(/\r\n/g, '\n');
if (normalizedContent.includes(target)) {
  content = normalizedContent.replace(target, replacement);
  fs.writeFileSync('backend/src/modules/payments/presentation/controllers/PaymentController.ts', content, 'utf8');
  console.log('Successfully patched verifyPublicPayment');
} else {
  console.log('Could not find patch target');
}
