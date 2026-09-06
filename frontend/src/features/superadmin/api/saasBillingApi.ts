import axios from 'axios';

export interface BillingKPIs {
  mrr: number;
  arr: number;
  activeClubs: number;
  failedPayments: number;
}

export interface Subscription {
  id: string;
  clubName: string;
  plan: string;
  status: 'Active' | 'Past Due' | 'Trial' | 'Canceled';
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
}

export interface Invoice {
  id: string;
  clubName: string;
  amount: number;
  currency: string;
  status: 'Paid' | 'Open' | 'Failed';
  date: string;
  pdfUrl?: string;
}

export const saasBillingApi = {
  getKPIs: async (): Promise<BillingKPIs> => {
    const response = await axios.get('/api/superadmin/billing/kpis');
    return response.data;
  },

  getSubscriptions: async (): Promise<Subscription[]> => {
    const response = await axios.get('/api/superadmin/billing/subscriptions');
    return response.data;
  },

  getInvoices: async (): Promise<Invoice[]> => {
    const response = await axios.get('/api/superadmin/billing/invoices');
    return response.data;
  },

  changePlan: async (clubId: string, newPlan: string): Promise<void> => {
    await axios.post(`/api/superadmin/billing/subscriptions/${clubId}/change-plan`, { plan: newPlan });
  },

  cancelSubscription: async (clubId: string): Promise<void> => {
    await axios.post(`/api/superadmin/billing/subscriptions/${clubId}/cancel`);
  }
};
