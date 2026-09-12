const fs = require('fs');

let content = fs.readFileSync('frontend/src/App.tsx', 'utf8');

if (!content.includes('ImpersonationBanner')) {
    const importRegex = /import \{ Toaster \} from "sonner";/;
    content = content.replace(importRegex, 'import { Toaster } from "sonner";\nimport { ImpersonationBanner } from "./shared/components/Navigation/ImpersonationBanner";');
    
    const routerRegex = /<BrowserRouter>/;
    content = content.replace(routerRegex, '<ImpersonationBanner />\n        <BrowserRouter>');
    
    fs.writeFileSync('frontend/src/App.tsx', content);
    console.log("App.tsx patched.");
}
