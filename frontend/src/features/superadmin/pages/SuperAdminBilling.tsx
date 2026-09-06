import React, { useState, useEffect } from 'react';
import { 
  CurrencyEuroIcon, 
  UserGroupIcon, 
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { saasBillingApi, BillingKPIs, Subscription, Invoice } from '../api/saasBillingApi';

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

type Tab = 'apercu' | 'clubs' | 'factures';

export const SuperAdminBilling: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('apercu');
  const [kpis, setKpis] = useState<BillingKPIs>(MOCK_KPIS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [kpiData, subsData, invData] = await Promise.all([
          saasBillingApi.getKPIs(),
          saasBillingApi.getSubscriptions(),
          saasBillingApi.getInvoices()
        ]);
        setKpis(kpiData);
        setSubscriptions(subsData);
        setInvoices(invData);
      } catch (error) {
        console.warn('API failed, using mock data for billing', error);
        // Fallback to mock data already set in initial state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePlanChange = async (clubId: string) => {
    alert(`Change plan for club ${clubId}`);
  };

  const handleCancelSubscription = async (clubId: string) => {
    alert(`Cancel subscription for club ${clubId}`);
  };

  const renderKPIs = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">MRR (Revenu Mensuel)</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{kpis.mrr.toLocaleString()} €</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <CurrencyEuroIcon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">ARR (Revenu Annuel)</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{kpis.arr.toLocaleString()} €</p>
          </div>
          <div className="p-3 bg-green-50 rounded-full">
            <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Clubs Actifs</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{kpis.activeClubs}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-full">
            <UserGroupIcon className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Paiements Échoués</p>
            <p className="text-2xl font-semibold text-red-600 mt-1">{kpis.failedPayments}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-full">
            <ExclamationCircleIcon className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Actif</span>;
      case 'Trial': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Essai</span>;
      case 'Past Due': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Impayé</span>;
      case 'Canceled': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Annulé</span>;
      default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Payée</span>;
      case 'Open': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>;
      case 'Failed': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Échouée</span>;
      default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const renderClubs = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prochain Cycle</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subscriptions.map(sub => (
            <tr key={sub.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.clubName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.plan}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStatusBadge(sub.status)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.amount} {sub.currency}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.nextBillingDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => handlePlanChange(sub.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Changer de plan</button>
                <button onClick={() => handleCancelSubscription(sub.id)} className="text-red-600 hover:text-red-900">Annuler</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderInvoices = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map(inv => (
            <tr key={inv.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.clubName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.amount} {inv.currency}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getInvoiceStatusBadge(inv.status)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-gray-500 hover:text-gray-700 flex items-center justify-end w-full">
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Abonnements SaaS</h1>
        <p className="mt-2 text-gray-600">Gérez la facturation, les revenus et les abonnements des clubs.</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('apercu')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'apercu'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Aperçu
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'clubs'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Clubs
          </button>
          <button
            onClick={() => setActiveTab('factures')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'factures'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Factures
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div>
          {activeTab === 'apercu' && renderKPIs()}
          {activeTab === 'clubs' && renderClubs()}
          {activeTab === 'factures' && renderInvoices()}
        </div>
      )}
    </div>
  );
};

export default SuperAdminBilling;