const fs = require('fs');

let content = fs.readFileSync('frontend/src/layouts/SuperAdminLayout.tsx', 'utf8');

const badBlock = `              {Object.entries(groupedNavigation).map(([category, items]) => (
                <li key={category}>
                  {!isCollapsed && (
                    <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left px-4">
                      {category}
                    </div>
                  <li key={category}>
                    {!isCollapsed && (
                      <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left px-4">
                        {category}
                      </div>
                    )}`;

const goodBlock = `              {Object.entries(groupedNavigation).map(([category, items]) => (
                <li key={category}>
                  {!isCollapsed && (
                    <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left px-4">
                      {category}
                    </div>
                  )}`;

if (content.includes(badBlock)) {
    content = content.replace(badBlock, goodBlock);
    fs.writeFileSync('frontend/src/layouts/SuperAdminLayout.tsx', content);
    console.log("Success");
} else {
    console.log("Bad block not found");
}
