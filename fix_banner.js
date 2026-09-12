const fs = require('fs');

let content = fs.readFileSync('frontend/src/shared/components/Navigation/ImpersonationBanner.tsx', 'utf8');

if (!content.includes('useAuthStore')) {
    content = "import { useAuthStore } from '../../stores/authStore';\n" + content;
}

const oldLogic = `    if (superAdminUser) {
      setUserData(JSON.parse(superAdminUser));
    }`;

const newLogic = `    if (superAdminUser) {
      const userObj = JSON.parse(superAdminUser);
      setUserData(userObj);
      useAuthStore.getState().setUser(userObj);
    }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('frontend/src/shared/components/Navigation/ImpersonationBanner.tsx', content);
