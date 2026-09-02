const fs = require('fs');
let c = fs.readFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', 'utf8');

const replacement = `        if (event.price && Number(event.price) > 0) {
          htmlContent += \`<br><p>Cet événement est payant (\${event.price} €). Si vous souhaitez y participer, vous pouvez vous inscrire et régler votre place directement en ligne :</p>\`;
          htmlContent += \`<p><a href="\${eventUrl}" style="display:inline-block;padding:10px 20px;background-color:#9333ea;color:white;text-decoration:none;border-radius:5px;font-weight:bold;">S'inscrire et Payer</a></p>\`;
        } else {
          htmlContent += \`<br><p>Pour plus de détails et pour confirmer votre présence, cliquez ci-dessous :</p>\`;
          htmlContent += \`<p><a href="\${eventUrl}" style="display:inline-block;padding:10px 20px;background-color:#9333ea;color:white;text-decoration:none;border-radius:5px;font-weight:bold;">Voir l'événement</a></p>\`;
        }
        console.log("SENDING HTML:", htmlContent);`;

c = c.replace(/if \(event\.price && event\.price > 0\) \{[\s\S]*?\} else \{[\s\S]*?\}/, replacement);
fs.writeFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', c, 'utf8');
