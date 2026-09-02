const fs = require('fs');
let c = fs.readFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', 'utf8');

const regex = /async announceEvent[\s\S]*?\}\n\}/;
const newMethod = `async announceEvent(req: Request, res: Response) {
    try {
      const eventId = Number(req.params.id);
      const event = await repository.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Événement introuvable" });
      }

      const userRepo = new MySQLUserRepository();
      const usersRes = await userRepo.findAll({ limit: 10000 });
      const activeUsers = usersRes.users.filter(u => u.active);
      const emails = activeUsers.map(u => u.email).filter(e => e);

      if (emails.length > 0) {
        const subject = "Nouvel événement : " + event.title;
        let htmlContent = \`<p>Un nouvel événement a été créé : <strong>\${event.title}</strong></p>\`;
        htmlContent += \`<p>Date : \${new Date(event.start_date).toLocaleString('fr-FR')}</p>\`;
        if (event.description) {
          htmlContent += \`<p>\${event.description}</p>\`;
        }
        
        const baseUrl = process.env.FRONTEND_URL || "https://club-management.com";
        const eventUrl = \`\${baseUrl}/events/\${event.id}\`;

        if (event.price && event.price > 0) {
          htmlContent += \`<br><p>Cet événement est payant (\${event.price} €). Si vous souhaitez y participer, vous pouvez vous inscrire et régler votre place directement en ligne :</p>\`;
          htmlContent += \`<p><a href="\${eventUrl}" style="display:inline-block;padding:10px 20px;background-color:#9333ea;color:white;text-decoration:none;border-radius:5px;font-weight:bold;">S'inscrire et Payer</a></p>\`;
        } else {
          htmlContent += \`<br><p>Pour plus de détails et pour confirmer votre présence, cliquez ci-dessous :</p>\`;
          htmlContent += \`<p><a href="\${eventUrl}" style="display:inline-block;padding:10px 20px;background-color:#9333ea;color:white;text-decoration:none;border-radius:5px;font-weight:bold;">Voir l'événement</a></p>\`;
        }

        await emailService.sendCustomEmail(emails, subject, htmlContent);
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("[AnnounceEvent Error]:", error);
      res.status(500).json({ error: error.message });
    }
  }
}`;

c = c.replace(regex, newMethod);
fs.writeFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', c, 'utf8');
