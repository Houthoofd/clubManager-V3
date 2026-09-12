import re

with open('frontend/src/layouts/SuperAdminLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad = """              {Object.entries(groupedNavigation).map(([category, items]) => (
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
                    )}"""

good = """              {Object.entries(groupedNavigation).map(([category, items]) => (
                <li key={category}>
                  {!isCollapsed && (
                    <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2 text-left px-4">
                      {category}
                    </div>
                  )}"""

if bad in content:
    content = content.replace(bad, good)
    with open('frontend/src/layouts/SuperAdminLayout.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed!")
else:
    print("Not found! Here is the block from the file:")
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if "Object.entries(groupedNavigation).map" in line and "isCollapsed" in lines[i+2]:
            print("\n".join(lines[i:i+15]))
            break
