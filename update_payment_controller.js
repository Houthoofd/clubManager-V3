const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/payments/presentation/controllers/PaymentController.ts', 'utf8');

const patchTarget = `          if (payment && payment.statut_code !== "valide") {
            const chargeId = typeof intent.latest_charge === "string" ? intent.latest_charge : undefined;
            await repo.updateStatus(payment.id, 2, chargeId);
  
            if (payment.echeance_id) {
              await markScheduleAsPaidUC.execute(payment.echeance_id, payment.id);
              console.log("[verifyPublicPayment] Marked schedule as paid:", payment.echeance_id);
            }
            if (payment.commande_id) {
              await markOrderAsPaidUC.execute(payment.commande_id);
              console.log("[verifyPublicPayment] Marked order as paid:", payment.commande_id);
            }`;

const patchReplacement = `          if (payment && payment.statut_code !== "valide") {
            const chargeId = typeof intent.latest_charge === "string" ? intent.latest_charge : undefined;
            await repo.updateStatus(payment.id, 2, chargeId);
  
            if (payment.echeance_id) {
              await markScheduleAsPaidUC.execute(payment.echeance_id, payment.id);
              console.log("[verifyPublicPayment] Marked schedule as paid:", payment.echeance_id);
            }
            if (payment.commande_id) {
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

if (content.includes(patchTarget)) {
  content = content.replace(patchTarget, patchReplacement);
  fs.writeFileSync('backend/src/modules/payments/presentation/controllers/PaymentController.ts', content, 'utf8');
  console.log('Successfully patched verifyPublicPayment');
} else {
  console.log('Could not find patch target');
}
