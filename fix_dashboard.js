const fs = require('fs');

let content = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

// 1. Add imports for apiClient
const importRegex = /import { superAdminApi } from '\.\.\/api\/superAdminApi';/;
content = content.replace(importRegex, "import { superAdminApi } from '../api/superAdminApi';\nimport { setAccessToken, setUserData, getAccessToken, getUserData } from '../../../shared/api/apiClient';");

// 2. Modify handleImpersonate
const handleImpersonateRegex = /const handleImpersonate = async \(clubId: number\) => {[\s\S]*?toast\.error\("Erreur lors de l'impersonation\. VǸrifiez qu'un administrateur existe pour ce club\."\);\s*\}\s*\};/;

const newHandleImpersonate = `const handleImpersonate = async (clubId: number) => {
    try {
      toast.info("Connexion en cours...");
      const response = await superAdminApi.impersonateClub(clubId);
      if (response.success && response.data) {
        
        // Save current super admin tokens for restoring later
        const currentToken = getAccessToken();
        const currentUser = getUserData();
        if (currentToken) localStorage.setItem('superadmin_accessToken', currentToken);
        if (currentUser) localStorage.setItem('superadmin_user', JSON.stringify(currentUser));

        // Set the new club admin credentials
        setAccessToken(response.data.token);
        setUserData(response.data.user);
        
        toast.success("Connecté en tant que club !");
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error) {
      toast.error("Erreur lors de l'impersonation. Vérifiez qu'un administrateur existe pour ce club.");
    }
  };`;

// replace handleImpersonate block completely
// But there is an encoding issue with 'VǸrifiez'. I will just use string replacement carefully.
// Let's use substring replacement to be safe.
const startIdx = content.indexOf('const handleImpersonate = async (clubId: number) => {');
const endIdx = content.indexOf('const handleStatusChange = async');

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + newHandleImpersonate + "\n\n  " + content.substring(endIdx);
} else {
    console.error("Could not find handleImpersonate block");
}

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', content);
