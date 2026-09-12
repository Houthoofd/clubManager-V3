const fs = require('fs');

let content = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

if (!content.includes('useAuthStore')) {
    content = content.replace(
        "import { superAdminApi, ClubInfo } from '../api/superAdminApi';",
        "import { superAdminApi, ClubInfo } from '../api/superAdminApi';\nimport { useAuthStore } from '../../../shared/stores/authStore';"
    );
}

const oldLogic = `          setUserData(response.data.user);
          
          toast.success("Connect\\xE9 en tant que club !");
          setTimeout(() => {
              window.location.href = '/dashboard';
          }, 1000);`;

const newLogic = `          setUserData(response.data.user);
          useAuthStore.getState().setUser(response.data.user);
          
          toast.success("Connecté en tant que club !");
          setTimeout(() => {
              window.location.href = '/dashboard';
          }, 100);`;

content = content.replace(oldLogic, newLogic);
// Just in case there is no setTimeout
const oldLogic2 = `          setUserData(response.data.user);
          
          toast.success("Connect\\xE9 en tant que club !");
          setTimeout(() => {
              window.location.href = '/dashboard';
          }, 1000);`;

content = content.replace(oldLogic2, newLogic); // Try both encodings if needed

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', content);
