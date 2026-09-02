const fs = require('fs');
const file = 'frontend/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Change RoleGuard for /events route from just ADMIN to ADMIN, PROFESSOR, MEMBER
const target = `<Route
                path="/events"
                element={
                    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                      <EventsPage />
                    </RoleGuard>
                }
              />`;

const replacement = `<Route
                path="/events"
                element={
                    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MEMBER]}>
                      <EventsPage />
                    </RoleGuard>
                }
              />`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('App.tsx patched for Events route');
} else {
    // Try with different formatting
    const genericTarget = 'path="/events"';
    console.log('Target block not perfectly matched, checking if generic exists');
    if (content.includes(genericTarget)) {
       // Since it's a small change, we can regex it
       content = content.replace(
           /<Route\s+path="\/events"\s+element=\{\s*<RoleGuard allowedRoles=\{\[UserRole\.ADMIN\]\}>\s*<EventsPage \/>\s*<\/RoleGuard>\s*\}\s*\/>/g,
           replacement
       );
       fs.writeFileSync(file, content, 'utf8');
       console.log('App.tsx patched via regex');
    }
}
