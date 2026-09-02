const fs = require('fs');
const file = 'frontend/src/features/messaging/components/ComposeModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add `getUsers` and `UserListItemDto` to imports
if (!content.includes('getUsers')) {
    content = content.replace(
        'import { getTemplates } from "../api/templatesApi";',
        'import { getTemplates } from "../api/templatesApi";\nimport { getUsers, type UserListItemDto } from "../../users/api/usersApi";'
    );
}

// 2. Add the UserSelect component right before the ComposeModal definition
const userSelectComponent = `
// ==================== COMPOSANT DE SELECTION D'UTILISATEUR ====================
const UserSelect = ({
  value,
  onChange,
  error
}: {
  value: string;
  onChange: (id: string, name: string) => void;
  error?: string;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserListItemDto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("messages");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value === "") {
      setSearchTerm("");
    }
  }, [value]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      setIsLoading(true);
      const timer = setTimeout(async () => {
        try {
          const res = await getUsers({ search: searchTerm, limit: 10 });
          setUsers(res.users);
          setIsOpen(true);
        } catch (e) {}
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setUsers([]);
      setIsOpen(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id="destinataire-search"
        type="text"
        placeholder="Rechercher par nom, prnom..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (value !== "") onChange("", "");
        }}
        onFocus={() => {
          if (users.length > 0) setIsOpen(true);
        }}
        className={error ? "border-red-500" : ""}
      />
      {isLoading && <div className="absolute right-3 top-2.5 text-xs text-gray-400">Recherche...</div>}
      
      {isOpen && users.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {users.map((u) => (
            <li
              key={u.id}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
              onMouseDown={(e) => {
                e.preventDefault();
                setSearchTerm(\`\${u.first_name} \${u.last_name}\`);
                onChange(String(u.id), \`\${u.first_name} \${u.last_name}\`);
                setIsOpen(false);
              }}
            >
              <div className="font-medium text-gray-800">{u.first_name} {u.last_name}</div>
              <div className="text-xs text-gray-500">{u.email}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
// ============================================================================

`;

content = content.replace(
    'export const ComposeModal: React.FC<ComposeModalProps> = ({',
    userSelectComponent + 'export const ComposeModal: React.FC<ComposeModalProps> = ({'
);

content = content.replace('import { useState, useEffect, useMemo }', 'import { useState, useEffect, useMemo, useRef }');

// 3. Change states in ComposeModal
content = content.replace(
    'const [envoyeParEmail, setEnvoyeParEmail] = useState(false);',
    'const [sendMethod, setSendMethod] = useState<"internal" | "email" | "both">("internal");'
);
content = content.replace(
    'setEnvoyeParEmail(false);',
    'setSendMethod("internal");'
);

// 4. Update the payload logic
content = content.replace(
    'envoye_par_email: envoyeParEmail,',
    'envoye_par_email: sendMethod === "email" || sendMethod === "both",\n        envoye_en_interne: sendMethod === "internal" || sendMethod === "both",'
);

// 5. Replace <Input type="number" id="destinataire-id" ... />
content = content.replace(
    /<Input\s+id="destinataire-id"\s+type="number"[\s\S]*?\/>/,
    `<UserSelect
                    value={destinataireId}
                    onChange={(id, name) => {
                      setDestinatarioId(id);
                      if (errors.destinataire) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.destinataire;
                          return next;
                        });
                      }
                    }}
                    error={errors.destinataire}
                  />`
);

// 6. Hard-replace the WHOLE old block. I'll use substring to be safe.
const searchStr = '{canBroadcast && (\n            <label className="flex items-center gap-2 cursor-pointer">\n              <input\n                type="checkbox"\n                id="envoye-par-email"';

const modeEnvoiHTML = `
          {/* Mode d'envoi */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">Mode d'envoi</legend>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sendMethod"
                  value="internal"
                  checked={sendMethod === "internal"}
                  onChange={() => setSendMethod("internal")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Messagerie interne uniquement</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sendMethod"
                  value="email"
                  checked={sendMethod === "email"}
                  onChange={() => setSendMethod("email")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Email uniquement</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sendMethod"
                  value="both"
                  checked={sendMethod === "both"}
                  onChange={() => setSendMethod("both")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Les deux (Interne + Email)</span>
              </label>
            </div>
          </fieldset>
`;

// It's safer to use a regex that matches until the closing `</form>`
const regexEnd = /\{\/\*[\s\S]*?Envoi par email[\s\S]*?\{canBroadcast && \([\s\S]*?<\/label>\s*\)\}\s*<\/form>/;
content = content.replace(regexEnd, modeEnvoiHTML + '\n        </form>');

fs.writeFileSync(file, content, 'utf8');
console.log('ComposeModal.tsx patched successfully');
