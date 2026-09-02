const fs = require('fs');
const file = 'backend/src/modules/messaging/application/use-cases/SendMessageUseCase.ts';
let content = fs.readFileSync(file, 'utf8');

// Add to DTO
content = content.replace(
    'envoye_par_email: boolean;\n}',
    'envoye_par_email: boolean;\n  envoye_en_interne?: boolean;\n}'
);

// In CAS 1 (Broadcast)
content = content.replace(
    'const broadcastId = await this.repo.createBroadcast({',
    'if (dto.envoye_en_interne === false && dto.envoye_par_email === false) {\n        throw new Error("Veuillez sélectionner au moins un mode d\'envoi (interne ou email)");\n      }\n\n      let broadcastId = 0;\n      if (dto.envoye_en_interne !== false) {\n        broadcastId = await this.repo.createBroadcast({'
);

content = content.replace(
    '} satisfies BroadcastParams);',
    '} satisfies BroadcastParams);\n      }'
);

content = content.replace(
    /const msgId = await this\.repo\.sendToUser\(\{[\s\S]*?envoye_par_email: dto\.envoye_par_email,[\s\S]*?\}\);\s*messageIds\.push\(msgId\);/g,
    `let msgId = 0;
        if (dto.envoye_en_interne !== false) {
          msgId = await this.repo.sendToUser({
            expediteur_id: dto.expediteur_id,
            destinataire_id: recipient.id,
            sujet: dto.sujet,
            contenu: dto.contenu,
            broadcast_id: broadcastId,
            envoye_par_email: dto.envoye_par_email,
          });
          messageIds.push(msgId);
        }`
);

content = content.replace(
    'await this.repo.updateBroadcastCount(broadcastId, filtered.length);',
    'if (broadcastId > 0) {\n        await this.repo.updateBroadcastCount(broadcastId, filtered.length);\n      }'
);

// In CAS 2 (Individual)
content = content.replace(
    'const msgId = await this.repo.sendToUser({',
    'if (dto.envoye_en_interne === false && dto.envoye_par_email === false) {\n      throw new Error("Veuillez sélectionner au moins un mode d\'envoi (interne ou email)");\n    }\n\n    let msgId = 0;\n    if (dto.envoye_en_interne !== false) {\n      msgId = await this.repo.sendToUser({'
);

content = content.replace(
    'envoye_par_email: dto.envoye_par_email,\n    });',
    'envoye_par_email: dto.envoye_par_email,\n      });\n    }'
);

fs.writeFileSync(file, content, 'utf8');
console.log('SendMessageUseCase patched');
