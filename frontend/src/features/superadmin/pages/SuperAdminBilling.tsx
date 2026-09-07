import React, { useState, useEffect } from 'react';
import { 
  EllipsisVerticalIcon, PencilIcon, NoSymbolIcon, XMarkIcon, CheckIcon, CurrencyEuroIcon, BanknotesIcon, 
  UserGroupIcon, 
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { saasBillingApi, BillingKPIs, Subscription, Invoice, SaasPlan } from '../api/saasBillingApi';

// Mock Data
const MOCK_KPIS: BillingKPIs = {
  mrr: 12500,
  arr: 150000,
  activeClubs: 145,
  failedPayments: 3
};

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: '1', clubName: 'FC Paris', plan: 'Pro', status: 'Active', amount: 99, currency: 'EUR', billingCycle: 'monthly', nextBillingDate: '2023-11-01' },
  { id: '2', clubName: 'Tennis Club Lyon', plan: 'Basic', status: 'Trial', amount: 49, currency: 'EUR', billingCycle: 'monthly', nextBillingDate: '2023-10-15' },
  { id: '3', clubName: 'Gymnase Marseille', plan: 'Enterprise', status: 'Past Due', amount: 299, currency: 'EUR', billingCycle: 'monthly', nextBillingDate: '2023-09-30' },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-001', clubName: 'FC Paris', amount: 99, currency: 'EUR', status: 'Paid', date: '2023-10-01' },
  { id: 'INV-002', clubName: 'Tennis Club Lyon', amount: 49, currency: 'EUR', status: 'Paid', date: '2023-09-15' },
  { id: 'INV-003', clubName: 'Gymnase Marseille', amount: 299, currency: 'EUR', status: 'Failed', date: '2023-09-30' },
];

type Tab = 'apercu' | 'clubs' | 'factures' | 'plans';

export const SuperAdminBilling: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('apercu');
  const [kpis, setKpis] = useState<BillingKPIs>(MOCK_KPIS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Plan Form State
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [openPlanDropdownId, setOpenPlanDropdownId] = useState<number | null>(null);
  const [editingPlan, setEditingPlan] = useState<Partial<SaasPlan> | null>(null);
  const [featuresInput, setFeaturesInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpiData, subsData, invData, plansData] = await Promise.all([
        saasBillingApi.getKPIs().catch(() => MOCK_KPIS),
        saasBillingApi.getSubscriptions().catch(() => MOCK_SUBSCRIPTIONS),
        saasBillingApi.getInvoices().catch(() => MOCK_INVOICES),
        saasBillingApi.getPlans().catch(() => [])
      ]);
      setKpis(kpiData);
      setSubscriptions(subsData);
      setInvoices(invData);
      setPlans(plansData);
    } catch (error) {
      console.warn('API failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (clubId: string) => {
    alert(`Change plan for club ${clubId}`);
  };

  const handleCancelSubscription = async (clubId: string) => {
    alert(`Cancel subscription for club ${clubId}`);
  };

  const handleSavePlan = async () => {
    try {
      const featuresArray = featuresInput.split(',').map(f => f.trim()).filter(f => f);
      const planToSave = {
        ...editingPlan,
        features: featuresArray
      } as SaasPlan;

      if (planToSave.id) {
        await saasBillingApi.updatePlan(planToSave.id, planToSave);
      } else {
        await saasBillingApi.createPlan(planToSave);
      }
      setShowPlanForm(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la sauvegarde du plan');
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce plan ?')) {
      try {
        await saasBillingApi.deletePlan(id);
        fetchData();
      } catch (e) {
        console.error(e);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const renderKPIs = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-white/5 rounded-lg shadow p-6 border border-gray-100 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">MRR (Revenu Mensuel)</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{kpis.mrr.toLocaleString()} €</p>
          </div>
          <div className="p-3 bg-brand-green/10 dark:bg-emerald-500/10 rounded-full">
            <CurrencyEuroIcon className="w-6 h-6 text-brand-green dark:text-emerald-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-white/5 rounded-lg shadow p-6 border border-gray-100 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ARR (Revenu Annuel)</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{kpis.arr.toLocaleString()} €</p>
          </div>
          <div className="p-3 bg-brand-blue/10 dark:bg-blue-500/10 rounded-full">
            <ArrowTrendingUpIcon className="w-6 h-6 text-brand-blue dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-lg shadow p-6 border border-gray-100 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Clubs Actifs</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{kpis.activeClubs}</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-full">
            <UserGroupIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-lg shadow p-6 border border-gray-100 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Paiements Échoués</p>
            <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-1">{kpis.failedPayments}</p>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-500/10 rounded-full">
            <ExclamationCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400">Actif</span>;
      case 'Trial': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Essai</span>;
      case 'Past Due': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Impayé</span>;
      case 'Canceled': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-white/5 text-gray-800">Annulé</span>;
      default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-white/5 text-gray-800">{status}</span>;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400">Payée</span>;
      case 'Open': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>;
      case 'Failed': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Échouée</span>;
      default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-white/5 text-gray-800">{status}</span>;
    }
  };

  const renderClubs = () => (
    <div className="bg-white dark:bg-white/5 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
      <table className="min-w-full divide-y divide-gray-100 dark:divide-white/5">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Club</th>
            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Montant</th>
            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prochain Cycle</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-white/5 divide-y divide-gray-200 dark:divide-white/5 dark:divide-white/10">
          {subscriptions.map(sub => (
            <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-white/10">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{sub.clubName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sub.plan}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getStatusBadge(sub.status)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sub.amount} {sub.currency}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sub.nextBillingDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end relative">
                  <button 
                    onClick={() => setOpenDropdownId(openDropdownId === sub.id ? null : sub.id)}
                    className="p-1.5 hover:bg-gray-100 dark:bg-white/5 rounded-md text-gray-500 dark:text-gray-400 transition-colors"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>
                  
                  {openDropdownId === sub.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                      <div className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5 dark:ring-white/10 py-1 text-left overflow-hidden">
                        <button 
                          onClick={() => { setOpenDropdownId(null); handlePlanChange(sub.id); }}
                          className="w-full text-left px-4 py-2 text-sm text-brand-blue hover:bg-brand-blue/10 flex items-center gap-2"
                        >
                          <PencilIcon className="h-4 w-4 text-brand-blue" /> Changer de plan
                        </button>
                        <div className="border-t border-gray-100 dark:border-white/10 my-1"></div>
                        <button 
                          onClick={() => { setOpenDropdownId(null); handleCancelSubscription(sub.id); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <NoSymbolIcon className="h-4 w-4 text-red-500" /> Annuler
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderInvoices = () => (
    <div className="bg-white dark:bg-white/5 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
      <table className="min-w-full divide-y divide-gray-100 dark:divide-white/5">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Référence</th>
            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Club</th>
            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Montant</th>
            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-white/5 divide-y divide-gray-200 dark:divide-white/5 dark:divide-white/10">
          {invoices.map(inv => (
            <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-white/10">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{inv.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{inv.clubName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{inv.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{inv.amount} {inv.currency}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getInvoiceStatusBadge(inv.status)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 flex items-center justify-end w-full">
                  <DocumentTextIcon className="w-5 h-5 mr-1" />
                  PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPlans = () => (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingPlan({ name: '', price: 0, billing_cycle: 'monthly', max_members: 100, description: '', is_active: true });
            setFeaturesInput('');
            setShowPlanForm(true);
          }}
          className="flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-md hover:bg-brand-green/90 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Créer un Plan
        </button>
      </div>

      
      {showPlanForm && editingPlan && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowPlanForm(false)}>
              <div className="absolute inset-0 bg-gray-50 dark:bg-gray-9000 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-white/5 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button type="button" onClick={() => setShowPlanForm(false)} className="bg-white dark:bg-white/5 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-400 focus:outline-none">
                  <span className="sr-only">Fermer</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <h3 className="text-lg font-medium mb-4">{editingPlan.id ? 'Éditer le plan' : 'Nouveau plan'}</h3>
              <div className="grid grid-cols-1 gap-4 mb-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du plan</label>
              <input
                type="text"
                value={editingPlan.name}
                onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                className="w-full border-gray-300 dark:border-white/10 rounded-md shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm bg-white dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix</label>
              <input
                type="number"
                value={editingPlan.price}
                onChange={e => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                className="w-full border-gray-300 dark:border-white/10 rounded-md shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm bg-white dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Membres max</label>
              <input
                type="number"
                value={editingPlan.max_members}
                onChange={e => setEditingPlan({ ...editingPlan, max_members: Number(e.target.value) })}
                className="w-full border-gray-300 dark:border-white/10 rounded-md shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm bg-white dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cycle</label>
              <select
                value={editingPlan.billing_cycle}
                onChange={e => setEditingPlan({ ...editingPlan, billing_cycle: e.target.value as any })}
                className="w-full border-gray-300 dark:border-white/10 rounded-md shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm bg-white dark:bg-white/5 dark:text-white"
              >
                <option value="monthly">Mensuel</option>
                <option value="yearly">Annuel</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input
                type="text"
                value={editingPlan.description}
                onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
                className="w-full border-gray-300 dark:border-white/10 rounded-md shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm bg-white dark:bg-white/5 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fonctionnalités (séparées par virgule)</label>
              <textarea
                value={featuresInput}
                onChange={e => setFeaturesInput(e.target.value)}
                className="w-full border-gray-300 dark:border-white/10 rounded-md shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm bg-white dark:bg-white/5 dark:text-white"
                rows={3}
              />
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleSavePlan}
                  className="w-full inline-flex justify-center items-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-green text-base font-medium text-white hover:bg-brand-green/90 focus:outline-none sm:col-start-2 sm:text-sm"
                >
                  <CheckIcon className="h-5 w-5" /> Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlanForm(false)}
                  className="mt-3 w-full inline-flex justify-center items-center gap-2 rounded-md border border-gray-300 dark:border-white/10 shadow-sm px-4 py-2 bg-white dark:bg-white/5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400" /> Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => {
          let parsedFeatures: string[] = [];
          try {
            parsedFeatures = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
          } catch (e) {
            parsedFeatures = [];
          }
          if (!Array.isArray(parsedFeatures)) parsedFeatures = [];

          return (
            <div key={plan.id} className="bg-white dark:bg-white/5 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${plan.is_active ? 'bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-white/5 text-gray-800'}`}>
                        {plan.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      <div className="relative">
                        <button 
                          onClick={() => setOpenPlanDropdownId(openPlanDropdownId === plan.id ? null : plan.id)}
                          className="p-1.5 hover:bg-gray-100 dark:bg-white/5 rounded-md text-gray-500 dark:text-gray-400 transition-colors"
                        >
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                        {openPlanDropdownId === plan.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenPlanDropdownId(null)} />
                            <div className="absolute right-0 top-8 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5 dark:ring-white/10 py-1 text-left overflow-hidden">
                              <button 
                                onClick={() => {
                                  setOpenPlanDropdownId(null);
                                  setEditingPlan(plan);
                                  setFeaturesInput(parsedFeatures.join(', '));
                                  setShowPlanForm(true);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-brand-blue hover:bg-brand-blue/10 flex items-center gap-2"
                              >
                                <PencilIcon className="h-4 w-4 text-brand-blue" /> Éditer
                              </button>
                              <div className="border-t border-gray-100 dark:border-white/10 my-1"></div>
                              <button 
                                onClick={() => {
                                  setOpenPlanDropdownId(null);
                                  handleDeletePlan(plan.id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                              >
                                <TrashIcon className="h-4 w-4 text-red-500" /> Supprimer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{plan.price}€</span>
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400">/{plan.billing_cycle === 'yearly' ? 'an' : 'mois'}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{plan.description}</p>
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-4">Jusqu'à {plan.max_members} membres</div>
                <ul className="space-y-3">
                  {parsedFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">{feat}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
            </div>
          );
        })}
        {plans.length === 0 && !loading && (
          <div className="col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">
            Aucun plan tarifaire trouvé.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full relative">
      <div className="flex items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-brand-green/10 dark:bg-emerald-500/10 p-3">
            <CurrencyEuroIcon className="h-8 w-8 text-brand-green dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-dark dark:text-white">
              Abonnements SaaS
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez la facturation, les revenus et les abonnements des clubs.</p>
          </div>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-200 dark:border-white/10">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('apercu')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'apercu'
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-white/10'
            }`}
          >
            Aperçu
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'clubs'
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-white/10'
            }`}
          >
            Clubs
          </button>
          <button
            onClick={() => setActiveTab('factures')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'factures'
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-white/10'
            }`}
          >
            Factures
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plans'
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-white/10'
            }`}
          >
            Plans
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
        </div>
      ) : (
        <div>
          {activeTab === 'apercu' && renderKPIs()}
          {activeTab === 'clubs' && renderClubs()}
          {activeTab === 'factures' && renderInvoices()}
          {activeTab === 'plans' && renderPlans()}
        </div>
      )}
    </div>
  );
};

export default SuperAdminBilling;