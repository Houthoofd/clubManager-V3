const fs = require('fs');
let c = fs.readFileSync('backend/src/modules/payments/application/use-cases/payments/GetQuickPayDataUseCase.ts', 'utf8');

c = c.replace(/export interface QuickPayItem \{/, `import { IEventRepository } from "../../../../events/domain/repositories/IEventRepository.js";\nimport { MySQLEventRepository } from "../../../../events/infrastructure/repositories/MySQLEventRepository.js";\n\nexport interface QuickPayItem {`);

c = c.replace(/type: "cotisation" \| "boutique";/, `type: "cotisation" | "boutique" | "evenement";`);

c = c.replace(/async execute\(token: string\): Promise<QuickPayItem\[\]> \{/, `async execute(token: string, itemType?: string, itemId?: number): Promise<QuickPayItem[]> {`);

const newLogic = `
    const items: QuickPayItem[] = [];

    if (itemType === "evenement" && itemId) {
      const eventRepo = new MySQLEventRepository();
      const event = await eventRepo.getEventById(itemId);
      if (event && event.price && Number(event.price) > 0) {
        // Optionnel : vérifier si l'utilisateur est déjà inscrit et payé
        const existing = await eventRepo.getRegistration(itemId, userId);
        if (!existing || existing.payment_status !== 'PAID') {
          items.push({
            id: event.id,
            type: "evenement",
            montant: Number(event.price),
            description: "Inscription : " + event.title,
          });
        }
      }
      return items;
    }
`;

c = c.replace(/const items: QuickPayItem\[\] = \[\];/, newLogic);
fs.writeFileSync('backend/src/modules/payments/application/use-cases/payments/GetQuickPayDataUseCase.ts', c, 'utf8');
