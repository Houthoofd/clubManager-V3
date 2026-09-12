const fs = require('fs');
let content = fs.readFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', 'utf8');

const oldCatch = `    } catch (error) {
      toast.error("Erreur lors de l'impersonation. V\xE9rifiez qu'un administrateur existe pour ce club.");
    }`;

const newCatch = `    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || "Erreur inconnue";
      toast.error("Erreur d'impersonation: " + msg);
    }`;

content = content.replace(oldCatch, newCatch);
fs.writeFileSync('frontend/src/features/superadmin/pages/SuperAdminDashboard.tsx', content);
