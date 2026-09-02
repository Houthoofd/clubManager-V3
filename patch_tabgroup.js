const fs = require('fs');
const file = 'frontend/src/shared/components/Navigation/TabGroup.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'scrollable = false,',
    'scrollable = true,'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed TabGroup.tsx');
