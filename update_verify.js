const fs = require('fs');
let c = fs.readFileSync('backend/src/modules/payments/presentation/controllers/PaymentController.ts', 'utf8');

c = c.replace(/export class PaymentController \{/, `import { MySQLEventRepository } from "../../../events/infrastructure/repositories/MySQLEventRepository.js";\nimport { RegisterToEventUseCase } from "../../../events/application/use-cases/RegisterToEventUseCase.js";\nimport jwt from "jsonwebtoken";\n\nexport class PaymentController {`);

const newVerifyLogic = `        if (intent.status === "succeeded") {
          if (item_type === "evenement") {
            const secret = process.env.JWT_SECRET || "fallback_secret";
            const decoded: any = jwt.verify(req.body.token, secret);
            const userId = decoded.id;
            
            const eventRepo = new MySQLEventRepository();
            const registerUseCase = new RegisterToEventUseCase(eventRepo);
            
            try {
              await registerUseCase.execute({
                event_id: Number(item_id),
                user_id: userId,
                payment_intent_id: intent.id
              });
              console.log("[verifyPublicPayment] Registered to event:", item_id);
            } catch (err: any) {
              console.error("[verifyPublicPayment] Event registration error:", err.message);
            }
          }

          const repo = new MySQLPaymentRepository();`;

c = c.replace(/        if \(intent\.status === "succeeded"\) \{[\s]*const repo = new MySQLPaymentRepository\(\);/, newVerifyLogic);

fs.writeFileSync('backend/src/modules/payments/presentation/controllers/PaymentController.ts', c, 'utf8');
