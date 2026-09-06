const fs = require('fs');

let c = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

const oldDrawer = `{isDetailsDrawerOpen && selectedClubForDetails && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 transition-opacity" onClick={() => setIsDetailsDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-xl h-full flex flex-col transform transition-transform duration-300 ease-in-out z-10 border-l border-gray-200">`;

const newDrawer = `<div className={\`fixed inset-0 z-50 flex justify-end transition-all duration-300 \${isDetailsDrawerOpen && selectedClubForDetails ? 'pointer-events-auto' : 'pointer-events-none'}\`}>
          <div className={\`fixed inset-0 bg-black/30 transition-opacity duration-300 \${isDetailsDrawerOpen && selectedClubForDetails ? 'opacity-100' : 'opacity-0'}\`} onClick={() => setIsDetailsDrawerOpen(false)} />
          <div className={\`relative w-full max-w-md bg-white shadow-xl h-full flex flex-col transform transition-transform duration-300 ease-in-out z-10 border-l border-gray-200 \${isDetailsDrawerOpen && selectedClubForDetails ? 'translate-x-0' : 'translate-x-full'}\`}>`;

c = c.replace(oldDrawer, newDrawer);

// Also need to remove the closing condition `)}` at the end of the file.
// Let's find where the drawer ends.
const endOld = `              </div>
            </div>
          </div>
        </div>
      )}
    </div>`;

const endNew = `              </div>
            </div>
          </div>
        </div>
    </div>`;

c = c.replace(endOld, endNew);

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', c);
