const fs = require('fs');

let c = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

const oldLogic = `      // Save the new token
      localStorage.setItem('auth_token', response.data.token);
      if (response.data.refreshToken) {
          localStorage.setItem('auth_refresh', response.data.refreshToken);
      }
      toast.success("Connecté en tant que club !");
      setTimeout(() => {
          window.location.href = '/dashboard';
      }, 1000);`;

const newLogic = `      // Save the new token for apiClient
      localStorage.setItem('accessToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Update Zustand Auth Store (it will pick it up on reload or we can just reload)
      toast.success("Connecté en tant que club !");
      setTimeout(() => {
          // Reset auth-storage so Zustand re-reads from the newly set localStorage or defaults
          localStorage.removeItem('auth-storage'); 
          window.location.href = '/dashboard';
      }, 1000);`;

c = c.replace(oldLogic, newLogic);
fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', c);
