const fs = require('fs');

let content = fs.readFileSync('frontend/src/layouts/SuperAdminLayout.tsx', 'utf8');

// For mobile nav
content = content.replace(
    /<nav className="flex flex-1 flex-col mt-4 mb-6 px-6">/g,
    '<nav className="flex flex-1 flex-col justify-center px-6">'
);

// For desktop nav
content = content.replace(
    /<nav className="flex flex-1 flex-col mt-4 mb-6 px-4">/g,
    '<nav className="flex flex-1 flex-col justify-center px-4">'
);

// Add my-auto to the ul
content = content.replace(
    /<ul role="list" className="flex flex-col gap-y-7">/g,
    '<ul role="list" className="flex flex-col gap-y-7 my-auto">'
);

fs.writeFileSync('frontend/src/layouts/SuperAdminLayout.tsx', content);
