const fs = require('fs');
const file = 'frontend/src/features/messaging/components/ComposeModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacementHTML = `
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

const searchRegex = /\{\/\*[\s\S]*?Envoi par email[\s\S]*?\{canBroadcast && \([\s\S]*?<\/label>\s*\)\}/;

content = content.replace(searchRegex, replacementHTML);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed');
