import React from 'react';
import { ChartBarSquareIcon } from '@heroicons/react/24/outline';

export const SuperAdminAnalytics: React.FC = () => {
  return (
    <div className="w-full relative">
      <div className="flex items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-brand-green/10 p-3">
            <ChartBarSquareIcon className="h-8 w-8 text-brand-green" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
              Analytics & Usage
            </h1>
            <p className="mt-1 text-sm text-gray-500">Analysez l'engagement et les statistiques globales de la plateforme.</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
        Interface en cours de construction...
      </div>
    </div>
  );
};
