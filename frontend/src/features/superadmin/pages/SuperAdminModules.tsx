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
  Cog6ToothIcon,
  XMarkIcon,
  CurrencyEuroIcon,
  ShieldCheckIcon,
  TrashIcon,
  TableCellsIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';

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
    type: 'core',
    pricing: 'free',
    clubsUsingCount: 12,
    isEnabledGlobally: false,
    colorClass: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400'
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
    colorClass: 'text-brand-red bg-brand-red/10 dark:bg-red-500/10 dark:text-red-400'
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
    colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400'
  },
  {
    id: 'm_mobile',
    name: 'App Mobile Marque Blanche',
    description: 'Application iOS et Android personnalisée aux couleurs du club et publiée sur les stores.',
    icon: DevicePhoneMobileIcon,
    status: 'active',
    type: 'integration',
    pricing: 'paid',
    clubsUsingCount: 8,
    isEnabledGlobally: true,
    colorClass: 'text-pink-600 bg-pink-50 dark:bg-pink-500/10 dark:text-pink-400'
  }
];

const MOCK_MODULE_USERS = [
  { id: 1, name: 'FC Paris', plan: 'Pro', status: 'Actif', since: '01/09/2026' },
  { id: 2, name: 'Tennis Club Lyon', plan: 'Enterprise', status: 'Actif', since: '15/08/2026' },
  { id: 3, name: 'Judo Club Lyon', plan: 'Basic', status: 'Suspendu', since: '10/05/2026' }
];

export const SuperAdminModules: React.FC = () => {
  const [modules, setModules] = useState<SaasModule[]>(MOCK_MODULES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'matrix'>('grid');
  const [selectedModule, setSelectedModule] = useState<SaasModule | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newModuleForm, setNewModuleForm] = useState({ name: '', description: '', type: 'core', pricing: 'free' });

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleForm.name.trim()) return;
    
    const newModule: SaasModule = {
      id: 'm_' + Date.now(),
      name: newModuleForm.name,
      description: newModuleForm.description,
      icon: PuzzlePieceIcon,
      status: 'beta',
      type: newModuleForm.type as ModuleType,
      pricing: newModuleForm.pricing as 'free' | 'paid' | 'plan_restricted',
      clubsUsingCount: 0,
      isEnabledGlobally: false,
      colorClass: 'text-gray-600 bg-gray-50 dark:bg-gray-500/10 dark:text-gray-400'
    };
    
    setModules([...modules, newModule]);
    setIsCreateModalOpen(false);
    setNewModuleForm({ name: '', description: '', type: 'core', pricing: 'free' });
  };
  
  const openModuleDrawer = (module: SaasModule) => {
    setSelectedModule(module);
    setIsDrawerOpen(true);
  };
  
  const closeModuleDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedModule(null), 300); // wait for animation
  };

  const toggleModule = (id: string) => {
    setModules(modules.map(mod => 
      mod.id === id ? { ...mod, isEnabledGlobally: !mod.isEnabledGlobally } : mod
    ));
  };

  const filteredModules = modules.filter(mod => {
    const matchesSearch = mod.name.toLowerCase().includes(searchQuery.toLowerCase()) || mod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || mod.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: ModuleStatus) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center rounded-md bg-brand-green/10 dark:bg-brand-green/20 px-2 py-1 text-xs font-medium text-brand-green ring-1 ring-inset ring-brand-green/20">Actif</span>;
      case 'beta':
        return <span className="inline-flex items-center rounded-md bg-yellow-100 dark:bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-500 ring-1 ring-inset ring-yellow-600/20 dark:ring-yellow-500/20">Bêta</span>;
      case 'deprecated':
        return <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-500/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/20">Déprécié</span>;
    }
  };

  const getPricingBadge = (pricing: SaasModule['pricing']) => {
    switch (pricing) {
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
        <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-green/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green transition-all">
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
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-dark dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              title="Vue Grille"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('matrix')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'matrix' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-dark dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              title="Matrice des Permissions"
            >
              <TableCellsIcon className="h-4 w-4" />
            </button>
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
      </div>

      {viewMode === 'matrix' ? (
        <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-200 dark:ring-white/10 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Matrice des Permissions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Définissez quels modules sont inclus dans quels abonnements.</p>
            </div>
            <button className="text-sm font-semibold text-brand-blue hover:text-brand-dark dark:text-blue-400 dark:hover:text-blue-300">
              Enregistrer la matrice
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
              <thead className="bg-gray-50 dark:bg-slate-900/40">
                <tr>
                  <th className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Module</th>
                  <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">Plan Starter</th>
                  <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">Plan Pro</th>
                  <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white">Plan Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10 bg-white dark:bg-transparent">
                {filteredModules.map(module => (
                  <tr key={module.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${module.colorClass}`}>
                        <module.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {module.name}
                          {!module.isEnabledGlobally && <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 px-1.5 py-0.5 rounded">Off</span>}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {module.pricing === 'free' && 'Inclus par défaut'}
                          {module.pricing === 'paid' && 'Option payante (Add-on)'}
                          {module.pricing === 'plan_restricted' && 'Géré par la matrice'}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green dark:border-white/10 dark:bg-slate-800 dark:checked:bg-brand-green cursor-pointer disabled:opacity-50" 
                        defaultChecked={module.type === 'core'} 
                        disabled={!module.isEnabledGlobally || module.pricing === 'paid'}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green dark:border-white/10 dark:bg-slate-800 dark:checked:bg-brand-green cursor-pointer disabled:opacity-50" 
                        defaultChecked={module.type === 'core' || module.pricing !== 'paid'} 
                        disabled={!module.isEnabledGlobally || module.pricing === 'paid'}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green dark:border-white/10 dark:bg-slate-800 dark:checked:bg-brand-green cursor-pointer disabled:opacity-50" 
                        defaultChecked={module.isEnabledGlobally && module.pricing !== 'paid'} 
                        disabled={!module.isEnabledGlobally || module.pricing === 'paid'}
                      />
                    </td>
                  </tr>
                ))}
                {filteredModules.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-gray-500">Aucun module trouvé</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
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
                  
                  {/* Toggle Global */}
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
                  
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>{module.clubsUsingCount} clubs</span>
                    </div>
                    <button onClick={() => openModuleDrawer(module)} className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue dark:text-blue-400 hover:text-brand-dark dark:hover:text-blue-300 transition-colors">
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
        </>
      )}

      {/* Configuration Drawer */}
      <div className={`fixed inset-0 z-[150] flex justify-end transition-all duration-300 ${isDrawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className="fixed inset-0 bg-black/30 transition-opacity" onClick={closeModuleDrawer} />
        <div className={`relative w-full max-w-md bg-white dark:bg-slate-800 shadow-xl h-full flex flex-col transform transition-transform duration-300 ease-in-out z-10 border-l border-gray-200 dark:border-white/10 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {selectedModule && (
            <>
              {/* Drawer Header */}
              <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedModule.colorClass}`}>
                    <selectedModule.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    {selectedModule.name}
                  </h2>
                </div>
                <button 
                  onClick={closeModuleDrawer}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6">
                
                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <textarea 
                    rows={3}
                    className="w-full rounded-lg border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-sm dark:text-white focus:ring-brand-blue focus:border-brand-blue"
                    defaultValue={selectedModule.description}
                  />
                </div>

                {/* Modèle Économique */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CurrencyEuroIcon className="h-5 w-5 text-gray-400" />
                    Modèle Économique
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                      <input type="radio" name="pricing" defaultChecked={selectedModule.pricing === 'free'} className="mt-1 text-brand-blue focus:ring-brand-blue bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Inclus (Gratuit)</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Disponible pour tous les clubs sans surcoût.</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                      <input type="radio" name="pricing" defaultChecked={selectedModule.pricing === 'paid'} className="mt-1 text-brand-blue focus:ring-brand-blue bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600" />
                      <div className="w-full">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Option Payante (Add-on)</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Facturé en supplément de l'abonnement.</p>
                        {selectedModule.pricing === 'paid' && (
                          <div className="flex items-center gap-2">
                            <input type="number" defaultValue="15" className="w-20 rounded-md border-gray-300 dark:border-white/10 bg-white dark:bg-slate-800 text-sm dark:text-white py-1 px-2 focus:ring-brand-blue focus:border-brand-blue" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">€ / mois</span>
                          </div>
                        )}
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                      <input type="radio" name="pricing" defaultChecked={selectedModule.pricing === 'plan_restricted'} className="mt-1 text-brand-blue focus:ring-brand-blue bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Restreint par Plan</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Nécessite de configurer la Matrice des Permissions.</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Clubs Utilisateurs */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                      Clubs Utilisateurs ({selectedModule.clubsUsingCount})
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
                    <ul className="divide-y divide-gray-100 dark:divide-white/10">
                      {MOCK_MODULE_USERS.map((user) => (
                        <li key={user.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Plan {user.plan} • Depuis le {user.since}</p>
                          </div>
                          <button className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors" title="Révocquer l'accès">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="p-3 bg-gray-50 dark:bg-slate-800/50 text-center border-t border-gray-100 dark:border-white/10">
                      <button className="text-xs font-semibold text-brand-blue dark:text-blue-400 hover:underline">
                        Voir les {selectedModule.clubsUsingCount} clubs
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3">
                <button 
                  onClick={closeModuleDrawer}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={closeModuleDrawer}
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-green rounded-lg shadow-sm hover:bg-brand-green/90 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <div className={`fixed inset-0 z-[200] flex items-center justify-center transition-all duration-300 ${isCreateModalOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCreateModalOpen(false)} />
        <div className={`relative w-full max-w-lg bg-white dark:bg-slate-800 shadow-2xl rounded-2xl flex flex-col transform transition-transform duration-300 ease-out z-10 m-4 ${isCreateModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-green/10 dark:bg-emerald-500/10 text-brand-green dark:text-emerald-400">
                <PlusIcon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nouveau Module</h2>
            </div>
            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleCreateModule} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du module</label>
              <input 
                type="text" 
                required
                value={newModuleForm.name}
                onChange={e => setNewModuleForm({...newModuleForm, name: e.target.value})}
                placeholder="Ex: Gestion des tournois" 
                className="w-full rounded-lg border-gray-300 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-brand-blue focus:border-brand-blue sm:text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description courte</label>
              <textarea 
                rows={2} 
                value={newModuleForm.description}
                onChange={e => setNewModuleForm({...newModuleForm, description: e.target.value})}
                placeholder="Expliquez brièvement l'utilité du module..." 
                className="w-full rounded-lg border-gray-300 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-brand-blue focus:border-brand-blue sm:text-sm" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de module</label>
                <select 
                  value={newModuleForm.type}
                  onChange={e => setNewModuleForm({...newModuleForm, type: e.target.value})}
                  className="w-full rounded-lg border-gray-300 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                >
                  <option value="core">Coeur (Core)</option>
                  <option value="addon">Add-on (Extension)</option>
                  <option value="integration">Intégration Externe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stratégie prix</label>
                <select 
                  value={newModuleForm.pricing}
                  onChange={e => setNewModuleForm({...newModuleForm, pricing: e.target.value})}
                  className="w-full rounded-lg border-gray-300 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                >
                  <option value="free">Inclus (Gratuit)</option>
                  <option value="plan_restricted">Restreint par plan</option>
                  <option value="paid">Payant à la carte</option>
                </select>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
              <button 
                type="button" 
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-green rounded-lg shadow-sm hover:bg-brand-green/90 transition-colors"
              >
                Créer le module
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

