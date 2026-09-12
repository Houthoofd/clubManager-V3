const fs = require('fs');
let content = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

const importStatement = "import { getAccessToken, setAccessToken, getUserData, setUserData } from '../../../shared/api/apiClient';\n";

if (!content.includes('getAccessToken,')) {
    content = content.replace(
        "import { superAdminApi, ClubInfo } from '../api/superAdminApi';",
        importStatement + "import { superAdminApi, ClubInfo } from '../api/superAdminApi';"
    );
    fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', content);
    console.log("Patched successfully!");
} else {
    console.log("Already patched.");
}
