const fs = require('fs');

let content = fs.readFileSync('frontend/src/layouts/SuperAdminLayout.tsx', 'utf8');

const badBlock = `              {Object.entries(groupedNavigation).map(([category, items]) => (
                <li key={category}>
                  {!isCollapsed && (
                    <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left px-4">
                      {category}
                    </div>
                  )}
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

// Let's use regex to be safe
content = content.replace(/<li key=\{category\}>\s*\{!isCollapsed && \(\s*<div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left px-4">\s*\{category\}\s*<\/div>\s*\)\}\s*<li key=\{category\}>/g, '<li key={category}>');

fs.writeFileSync('frontend/src/layouts/SuperAdminLayout.tsx', content);
