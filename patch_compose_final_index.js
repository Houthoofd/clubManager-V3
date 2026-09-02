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

const searchStr = '{/* \uD83D\uDCE7 Envoi par email (admin/professor seulement) \uD83D\uDCE7 */}';

let startIdx = content.indexOf('Envoi par email (admin/professor seulement)');
if (startIdx === -1) {
  startIdx = content.indexOf('Envoi par email');
}

// Find the {canBroadcast that comes AFTER Envoi par email
const canBroadcastIdx = content.indexOf('{canBroadcast && (', startIdx);
const labelCloseIdx = content.indexOf('</label>', canBroadcastIdx);
const endBlockIdx = content.indexOf(')}', labelCloseIdx) + 2; // include )}

// Look back from startIdx to find the actual start of the comment
const commentStartIdx = content.lastIndexOf('{/*', startIdx);

if (commentStartIdx !== -1 && endBlockIdx !== -1) {
    const before = content.substring(0, commentStartIdx);
    const after = content.substring(endBlockIdx);
    content = before + replacementHTML + after;
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed exactly!');
} else {
    console.log('Could not find indices properly');
}
