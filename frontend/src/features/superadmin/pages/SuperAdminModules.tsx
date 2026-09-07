import React, { useState } from 'react';
import { 
  PuzzlePieceIcon, 
  ShoppingCartIcon, 
  CalendarIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  DevicePhoneMobileIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react'; // Assuming headless UI is installed, if not, I will use a custom switch. I'll use a custom one to be safe.

// Let's use custom tailwind switch since I'm not 100% sure Headless UI is imported.
// Actually, HeadlessUI is heavily used in this project (Dialog, Transition, etc.), but I will just build a raw Tailwind toggle.

type ModuleStatus = 'active' | 'beta' | 'deprecated';
type ModuleType = 'core' | 'addon' | 'integration';

interface SaasModule {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: ModuleStatus;
  type: ModuleType;
  pricing: 'free' | 'paid' | 'plan_restricted';
  clubsUsingCount: number;
  isEnabledGlobally: boolean;
  colorClass: string;
}

const MOCK_MODULES: SaasModule[] = [
  {
    id: 'm_shop',
    name: 'Boutique en Ligne',
    description: 'Permet aux clubs de vendre des équipements et abonnements directement en ligne via Stripe.',
    icon: ShoppingCartIcon,
    status: 'active',
    type: 'addon',
    pricing: 'paid',
    clubsUsingCount: 84,
    isEnabledGlobally: true,
    colorClass: 'text-brand-blue bg-brand-blue/10 dark:bg-blue-500/10 dark:text-blue-400'
  },
  {
    id: 'm_booking',
    name: 'Réservation de Terrains',
    description: 'Moteur de réservation complet avec règles complexes, invités et paiement partagé.',
    icon: CalendarIcon,
    status: 'active',
    type: 'core',
    pricing: 'plan_restricted',
    clubsUsingCount: 132,
    isEnabledGlobally: true,
    colorClass: 'text-brand-green bg-brand-green/10 dark:bg-emerald-500/10 dark:text-emerald-400'
  },
  {
    id: 'm_chat',
    name: 'Messagerie Interne',
    description: 'Système de messagerie instantanée entre les membres et les administrateurs du club.',
    icon: ChatBubbleLeftRightIcon,
    status: 'beta',
    type: 'addon',
    pricing: 'free',
    clubsUsingCount: 12,
    isEnabledGlobally: false,
    colorClass: 'text-purple-600 bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400'
  },
  {
    id: 'm_accounting',
    name: 'Comptabilité Avancée',
    description: 'Génération automatique de journaux comptables, rapprochement bancaire et exports FEC.',
    icon: DocumentTextIcon,
    status: 'active',
    type: 'addon',
    pricing: 'paid',
    clubsUsingCount: 45,
    isEnabledGlobally: true,
    colorClass: 'text-orange-600 bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400'
  },
  {
    id: 'm_hr',
    name: 'Gestion RH & Coachs',
    description: 'Planning des coachs, pointage des heures, contrats et fiches de paie simplifiées.',
    icon: UserGroupIcon,
    status: 'active',
    type: 'core',
    pricing: 'plan_restricted',
    clubsUsingCount: 67,
    isEnabledGlobally: true,
    colorClass: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400'
  },
  {
    id: 'm_whitelabel',
    name: 'App Mobile Marque Blanche',
    description: 'Application iOS et Android personnalisée aux couleurs du club et publiée sur les stores.',
    icon: DevicePhoneMobileIcon,
    status: 'active',
    type: 'integration',
    pricing: 'paid',
    clubsUsingCount: 8,
    isEnabledGlobally: true,
    colorClass: 'text-pink-600 bg-pink-100 dark:bg-pink-500/10 dark:text-pink-400'
  }
];

export const SuperAdminModules: React.FC = () => {
  const [modules, setModules] = useState<SaasModule[]>(MOCK_MODULES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const toggleModule = (id: string) => {
    setModules(modules.map(mod => 
      mod.id === id ? { ...mod, isEnabledGlobally: !mod.isEnabledGlobally } : mod
    ));
  };

  const filteredModules = modules.filter(mod => {
    const matchesSearch = mod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          mod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || mod.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: ModuleStatus) => {
    switch(status) {
      case 'active':
        return <span className="inline-flex items-center rounded-md bg-brand-green/10 dark:bg-brand-green/20 px-2 py-1 text-xs font-medium text-brand-green ring-1 ring-inset ring-brand-green/20">Actif</span>;
      case 'beta':
        return <span className="inline-flex items-center rounded-md bg-yellow-100 dark:bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-500 ring-1 ring-inset ring-yellow-600/20 dark:ring-yellow-500/20">Bêta</span>;
      case 'deprecated':
        return <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-500/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/20">Déprécié</span>;
    }
  };

  const getPricingBadge = (pricing: string) => {
    switch(pricing) {
      case 'free': return <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md">Inclus (Gratuit)</span>;
      case 'paid': return <span className="text-xs font-medium text-brand-blue dark:text-brand-blue bg-brand-blue/10 dark:bg-brand-blue/20 px-2 py-1 rounded-md">Option Payante</span>;
      case 'plan_restricted': return <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-1 rounded-md">Restreint par Plan</span>;
    }
  };

  return (
    <div className="w-full relative pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-brand-green/10 dark:bg-emerald-500/10 p-3">
            <PuzzlePieceIcon className="h-8 w-8 text-brand-green dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark dark:text-white">
              Gestion des Modules
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez les fonctionnalités optionnelles de la plateforme (Feature Flags) et leurs accès.</p>
          </div>
        </div>
        
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-green/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green transition-all">
          <PlusIcon className="h-5 w-5" />
          Nouveau Module
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-white/10 p-4 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex items-center w-full sm:w-96">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher un module..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:ring-brand-blue focus:border-brand-blue bg-white dark:bg-white/5 dark:text-slate-300 dark:placeholder-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="relative flex items-center w-full sm:w-auto">
          <FunnelIcon className="h-4 w-4 text-gray-400 absolute left-3 pointer-events-none" />
          <select
            className="pl-9 pr-8 py-2 w-full sm:w-auto border border-gray-300 dark:border-white/10 rounded-lg text-sm focus:ring-brand-blue focus:border-brand-blue appearance-none bg-white dark:bg-white/5 dark:text-slate-400"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option className="bg-white dark:bg-slate-800 dark:text-slate-300" value="all">Tous les types</option>
            <option className="bg-white dark:bg-slate-800 dark:text-slate-300" value="core">Fonctionnalités Coeur</option>
            <option className="bg-white dark:bg-slate-800 dark:text-slate-300" value="addon">Extensions (Add-ons)</option>
            <option className="bg-white dark:bg-slate-800 dark:text-slate-300" value="integration">Intégrations</option>
          </select>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <div key={module.id} className="bg-white dark:bg-white/5 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-white/10 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
            
            {/* Card Header */}
            <div className="p-6 pb-4 border-b border-gray-100 dark:border-white/10 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${module.colorClass}`}>
                  <module.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{module.name}</h3>
                  <div className="mt-1">
                    {getStatusBadge(module.status)}
                  </div>
                </div>
              </div>
              
              {/* Custom Tailwind Toggle */}
              <button 
                onClick={() => toggleModule(module.id)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${module.isEnabledGlobally ? 'bg-brand-green' : 'bg-gray-200 dark:bg-slate-600'}`}
                role="switch"
                aria-checked={module.isEnabledGlobally}
              >
                <span className="sr-only">Activer le module</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${module.isEnabledGlobally ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
            
            {/* Card Body */}
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {module.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {getPricingBadge(module.pricing)}
                </div>
              </div>
              
              {/* Stats & Actions */}
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  <UserGroupIcon className="h-4 w-4" />
                  <span>{module.clubsUsingCount} clubs</span>
                </div>
                <button className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue dark:text-blue-400 hover:text-brand-dark dark:hover:text-blue-300 transition-colors">
                  <Cog6ToothIcon className="h-4 w-4" />
                  Configurer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredModules.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-white/5 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-white/10">
          <PuzzlePieceIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Aucun module trouvé</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Essayez de modifier vos critères de recherche.</p>
        </div>
      )}
    </div>
  );
};
