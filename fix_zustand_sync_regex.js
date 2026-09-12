const fs = require('fs');

let content = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

if (!content.includes('useAuthStore')) {
    content = content.replace(
        "import { superAdminApi, ClubInfo } from '../api/superAdminApi';",
        "import { superAdminApi, ClubInfo } from '../api/superAdminApi';\nimport { useAuthStore } from '../../../shared/stores/authStore';"
    );
}

content = content.replace(
    /setUserData\(response\.data\.user\);[\s\S]*?toast\.success.*?Connect.*?en tant que club.*?;[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?window\.location\.href = '\/dashboard';[\s\S]*?\}, \d+\);/,
    `setUserData(response.data.user);\n          useAuthStore.getState().setUser(response.data.user);\n          \n          toast.success("Connecté en tant que club !");\n          setTimeout(() => {\n              window.location.href = '/dashboard';\n          }, 100);`
);

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', content);
console.log("Patched!");
