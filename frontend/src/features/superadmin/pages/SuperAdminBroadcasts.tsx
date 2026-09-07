import React from 'react';
import { MegaphoneIcon } from '@heroicons/react/24/outline';

export const SuperAdminBroadcasts: React.FC = () => {
  return (
    <div className="w-full relative">
      <div className="flex items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-brand-green/10 p-3">
            <MegaphoneIcon className="h-8 w-8 text-brand-green" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
              Communications Globales
            </h1>
            <p className="mt-1 text-sm text-gray-500">Envoyez des annonces et des emails à tous vos locataires.</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
        Chargement de l'interface de communication...
      </div>
    </div>
  );
};
