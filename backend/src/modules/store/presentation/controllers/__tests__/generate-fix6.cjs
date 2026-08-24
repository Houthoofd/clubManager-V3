const fs = require('fs');
const targetFile = 'c:\\Users\\Oxfam\\Documents\\clubManager-V3\\backend\\src\\modules\\store\\presentation\\controllers\\__tests__\\StoreController.test.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// Replace the literal `\n` with an actual newline!
content = content.replace(/\\n/g, '\n');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Fixed \\n');
