const fs = require('fs');
const file = 'frontend/src/features/messaging/components/ComposeModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// The exact string we want to replace
const targetStr = `{canBroadcast && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="envoye-par-email"
                className={FORM.checkbox}
                checked={envoyeParEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEnvoyeParEmail(e.target.checked)
                }
              />
              <span className="text-sm text-gray-700">
                {t("compose.sendByEmail")}
              </span>
            </label>
          )}`;

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

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementHTML);
    console.log("Successfully replaced exact target string.");
} else {
    console.log("EXACT TARGET STRING NOT FOUND, FALLING BACK TO INDEXOF");
    // We will do index based substring replacement
    const startIdx = content.indexOf('{canBroadcast && (');
    const endFormIdx = content.indexOf('</form>', startIdx);
    if (startIdx > -1 && endFormIdx > -1) {
       const before = content.substring(0, startIdx);
       const after = content.substring(endFormIdx);
       content = before + replacementHTML + '\n        ' + after;
       console.log("Replaced using indexOf");
    } else {
       console.log("Failed to find start or end index");
    }
}

fs.writeFileSync(file, content, 'utf8');
