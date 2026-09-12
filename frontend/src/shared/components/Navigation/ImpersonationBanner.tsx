import { useAuthStore } from '../../stores/authStore';
import React from 'react';
import { setAccessToken, setUserData } from '../../api/apiClient';

export const ImpersonationBanner = () => {
  const superAdminToken = localStorage.getItem('superadmin_accessToken');
  const superAdminUser = localStorage.getItem('superadmin_user');

  if (!superAdminToken) {
    return null;
  }

  const handleRevert = () => {
    // Restore Super Admin tokens
    setAccessToken(superAdminToken);
    if (superAdminUser) {
      const userObj = JSON.parse(superAdminUser);
      setUserData(userObj);
      useAuthStore.getState().setUser(userObj);
    }
    
    // Clear impersonation data
    localStorage.removeItem('superadmin_accessToken');
    localStorage.removeItem('superadmin_user');

    // Reload the app and go back to superadmin
    window.location.href = '/superadmin';
  };

  return (
    <div className="bg-yellow-500 text-black px-4 py-2 flex items-center justify-between z-[9999] relative shadow-md">
      <div className="flex items-center gap-2 font-semibold">
        <span className="text-xl">⚠️</span>
        <span>Mode Impersonation : Vous êtes connecté en tant qu'administrateur de club.</span>
      </div>
      <button 
        onClick={handleRevert}
        className="bg-black text-white px-4 py-1 rounded hover:bg-gray-800 transition-colors text-sm font-bold"
      >
        Revenir au Super Admin
      </button>
    </div>
  );
};
