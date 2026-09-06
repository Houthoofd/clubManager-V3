const fs = require('fs');

let c = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

// Add ArrowRightOnRectangleIcon
c = c.replace(/EnvelopeIcon\n}/, 'EnvelopeIcon,\n  ArrowRightOnRectangleIcon\n}');

// Add handleImpersonate logic
const impersonateLogic = `
  const handleImpersonate = async (clubId: number) => {
    try {
      toast.info("Connexion en cours...");
      const response = await superAdminApi.impersonateClub(clubId);
      if (response.success && response.data) {
        // Save the new token
        localStorage.setItem('auth_token', response.data.token);
        if (response.data.refreshToken) {
            localStorage.setItem('auth_refresh', response.data.refreshToken);
        }
        toast.success("Connecté en tant que club !");
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error) {
      toast.error("Erreur lors de l'impersonation. Vérifiez qu'un administrateur existe pour ce club.");
    }
  };
`;

c = c.replace(/const handleStatusChange = async/, impersonateLogic + '\n  const handleStatusChange = async');

// Add the impersonate button to the actions flex container
const actionButtons = `
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleImpersonate(club.id)}
                          className="text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white p-1.5 rounded-md transition-all"
                          title="Se connecter en tant qu'admin"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        </button>
                        <button 
`;
c = c.replace(/<div className="flex justify-end gap-2">\s*<button/, actionButtons);

fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', c);
