import React from 'react';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';

export const SuperAdminWorkflows: React.FC = () => {
  return (
    <div className="w-full relative">
      <div className="flex items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-brand-green/10 p-3">
            <ArrowPathRoundedSquareIcon className="h-8 w-8 text-brand-green" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark">
              Gestionnaire de Flux
            </h1>
            <p className="mt-1 text-sm text-gray-500">Personnalisez et modélisez les processus métiers pour chaque organisation.</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
        Interface du moteur de flux (Workflow Builder) en cours de construction...
      </div>
    </div>
  );
};
