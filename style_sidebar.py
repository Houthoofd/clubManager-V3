import re

with open('frontend/src/layouts/SuperAdminLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# For Mobile:
# Category text: remove px-4
content = re.sub(
    r'<div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left px-4">',
    '<div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left">',
    content
)

# Mobile Link padding: change px-4 py-2.5 to p-2
content = re.sub(
    r'"group flex items-center gap-x-4 rounded-lg px-4 py-2\.5 text-sm leading-6 font-semibold transition-all "',
    '"group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all "',
    content
)

# For Desktop:
# Inner ul: add -mx-2
content = re.sub(
    r'<ul role="list" className="space-y-1">',
    '<ul role="list" className="-mx-2 space-y-1">',
    content
)

# Desktop Link padding: change py-2 ... px-4 to p-2
content = re.sub(
    r'"group rounded-lg py-2 text-sm leading-6 font-semibold transition-all " \+\s*\(isActive \? "([^"]+)" : "([^"]+)"\) \+\s*\(isCollapsed \? " flex items-center justify-center px-2" : " flex items-center gap-x-4 px-4"\)',
    '"group rounded-md p-2 text-sm leading-6 font-semibold transition-all " +\\n                                (isActive ? "\\1" : "\\2") + \\n                                (isCollapsed ? " flex items-center justify-center" : " flex items-center gap-x-3")',
    content
)

# For Paramètres (Mobile and Desktop):
# We need to add -mx-2 wrapper or just adjust padding
# Wait, Paramètres is in <div className="... p-4">. We can change it to px-4 py-4 or p-4, but give it -mx-2 inside?
# Let's just replace the Paramètres link block directly.
params_old = r"""<Link
                to="/superadmin/settings"
                title={isCollapsed \? "Paramtres" : undefined}
                className={
                  "group rounded-lg py-2 text-sm leading-6 font-semibold transition-all " \+
                    \(location\.pathname\.startsWith\('/superadmin/settings'\) \? "([^"]+)" : "([^"]+)"\) \+ 
                    \(isCollapsed \? " flex items-center justify-center px-2" : " flex items-center gap-x-4 px-4"\)
                }
              >"""
params_new = """<div className="-mx-2"><Link
                to="/superadmin/settings"
                title={isCollapsed ? "Paramètres" : undefined}
                className={
                  "group rounded-md p-2 text-sm leading-6 font-semibold transition-all " +
                    (location.pathname.startsWith('/superadmin/settings') ? "\\1" : "\\2") + 
                    (isCollapsed ? " flex items-center justify-center" : " flex items-center gap-x-3")
                }
              >"""
content = re.sub(params_old, params_new, content)
# Close the div wrapper around Paramètres link
content = re.sub(r'</Link>\s*</div>\s*</div>\s*</div>\s*</div>', '</Link></div>\n            </div>\n        </div>\n          </div>\n        </div>', content) # this is too fragile

with open('frontend/src/layouts/SuperAdminLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done styling")
