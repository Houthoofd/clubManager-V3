const fs = require('fs');

let content = fs.readFileSync('frontend/src/layouts/SuperAdminLayout.tsx', 'utf8');

// 1. Desktop: Add -mx-2 to inner ul
content = content.replace(/<ul role="list" className="space-y-1">/g, '<ul role="list" className="-mx-2 space-y-1">');

// 2. Desktop & Mobile Category: remove px-4
content = content.replace(/<div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left px-4">/g, '<div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left">');

// 3. Desktop Link padding
const desktopLinkRegex = /"group rounded-lg py-2 text-sm leading-6 font-semibold transition-all " \+\s*\(isActive \? "([^"]+)" : "([^"]+)"\) \+\s*\(isCollapsed \? " flex items-center justify-center px-2" : " flex items-center gap-x-4 px-4"\)/g;
content = content.replace(desktopLinkRegex, '"group rounded-md p-2 text-sm leading-6 font-semibold transition-all " +\n                                (isActive ? "$1" : "$2") + \n                                (isCollapsed ? " flex items-center justify-center" : " flex items-center gap-x-3")');

// 4. Mobile Link padding
const mobileLinkRegex = /"group flex items-center gap-x-4 rounded-lg px-4 py-2 text-sm leading-6 font-semibold transition-all "/g;
content = content.replace(mobileLinkRegex, '"group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all "');

const mobileLinkRegex2 = /"group flex items-center gap-x-4 rounded-lg px-4 py-2\.5 text-sm leading-6 font-semibold transition-all "/g;
content = content.replace(mobileLinkRegex2, '"group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all "');

// 5. Settings block
const settingsOld = `<div className="mt-auto border-t border-gray-100 dark:border-white/10 p-4">
              <Link
                to="/superadmin/settings"
                title={isCollapsed ? "Paramtres" : undefined}
                className={
                  "group rounded-lg py-2 text-sm leading-6 font-semibold transition-all " +
                    (location.pathname.startsWith('/superadmin/settings') ? "bg-brand-green/10 dark:bg-brand-green/20 text-brand-green dark:text-brand-green" : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-brand-dark dark:hover:text-slate-200") + 
                    (isCollapsed ? " flex items-center justify-center px-2" : " flex items-center gap-x-4 px-4")
                }
              >
                <Cog8ToothIcon className={"h-6 w-6 shrink-0 " + (location.pathname.startsWith('/superadmin/settings') ? "text-brand-green" : "text-gray-400 group-hover:text-brand-dark dark:text-slate-400 dark:group-hover:text-slate-200")} />
                {!isCollapsed && <span>Paramtres</span>}
              </Link>
            </div>`;
// the character could be different, so let's just do regex replacing for the Settings container:
const settingsRegex = /<div className="mt-auto border-t border-gray-100 dark:border-white\/10 p-4">\s*<Link\s*to="\/superadmin\/settings"\s*title=\{isCollapsed \? "[^"]+" : undefined\}\s*className=\{\s*"group rounded-lg py-2 text-sm leading-6 font-semibold transition-all " \+\s*\(location\.pathname\.startsWith\('\/superadmin\/settings'\) \? "([^"]+)" : "([^"]+)"\) \+\s*\(isCollapsed \? " flex items-center justify-center px-2" : " flex items-center gap-x-4 px-4"\)\s*\}\s*>\s*<Cog8ToothIcon className=\{"h-6 w-6 shrink-0 " \+ \(location\.pathname\.startsWith\('\/superadmin\/settings'\) \? "text-brand-green" : "text-gray-400 group-hover:text-brand-dark dark:text-slate-400 dark:group-hover:text-slate-200"\)\} \/>\s*\{!isCollapsed && <span>[^<]+<\/span>\}\s*<\/Link>\s*<\/div>/g;

content = content.replace(settingsRegex, `<div className="mt-auto border-t border-gray-100 dark:border-white/10 px-4 py-4">
              <ul role="list" className="-mx-2 space-y-1">
                <li>
                  <Link
                    to="/superadmin/settings"
                    title={isCollapsed ? "Paramètres" : undefined}
                    className={
                      "group rounded-md p-2 text-sm leading-6 font-semibold transition-all " +
                        (location.pathname.startsWith('/superadmin/settings') ? "$1" : "$2") + 
                        (isCollapsed ? " flex items-center justify-center" : " flex items-center gap-x-3")
                    }
                  >
                    <Cog8ToothIcon className={"h-6 w-6 shrink-0 " + (location.pathname.startsWith('/superadmin/settings') ? "text-brand-green" : "text-gray-400 group-hover:text-brand-dark dark:text-slate-400 dark:group-hover:text-slate-200")} />
                    {!isCollapsed && <span>Paramètres</span>}
                  </Link>
                </li>
              </ul>
            </div>`);

fs.writeFileSync('frontend/src/layouts/SuperAdminLayout.tsx', content);
console.log("Replaced!");
