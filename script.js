const fs = require('fs');
let c = fs.readFileSync('frontend/src/features/events/pages/EventsPage.tsx', 'utf8');

c = c.replace(
  "import { MessageEventMembersModal } from '../components/MessageEventMembersModal';",
  "import { MessageEventMembersModal } from '../components/MessageEventMembersModal';\nimport { AnnounceEventModal } from '../components/AnnounceEventModal';"
);

c = c.replace(/  const announceMutation = useMutation\(\{\s*mutationFn: \(id: number\) => eventsService\.announceEvent\(id\),\s*onSuccess: \(\) => alert\("Annonce envoyée à tous les membres !"\),\s*onError: \(err: any\) => alert\("Erreur: " \+ err\.message\)\s*\}\);\s*/, '');

c = c.replace(
  "const [messageModalEventId, setMessageModalEventId] = useState<number | null>(null);",
  "const [messageModalEventId, setMessageModalEventId] = useState<number | null>(null);\n  const [announceModalEventId, setAnnounceModalEventId] = useState<number | null>(null);"
);

c = c.replace(/if \(window\.confirm\("Voulez-vous annoncer cet événement à tous les membres du club \?"\)\) announceMutation\.mutate\(evt\.id\);/g, "setAnnounceModalEventId(evt.id);");

c = c.replace(
  "      {messageModalEventId && (",
  "      {announceModalEventId && (\n        <AnnounceEventModal\n          eventId={announceModalEventId}\n          isOpen={!!announceModalEventId}\n          onClose={() => setAnnounceModalEventId(null)}\n        />\n      )}\n      {messageModalEventId && ("
);

fs.writeFileSync('frontend/src/features/events/pages/EventsPage.tsx', c);
