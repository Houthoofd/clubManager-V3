import axios from 'axios';

export interface SaasPlan {
  id?: number;
  name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  max_members: number;
  features: string | any;
  is_active?: boolean;
}

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
  },

  getPlans: async (): Promise<SaasPlan[]> => {
    const response = await axios.get('/api/superadmin/billing/plans');
    return response.data.data;
  },

  createPlan: async (plan: Partial<SaasPlan>): Promise<any> => {
    const response = await axios.post('/api/superadmin/billing/plans', plan);
    return response.data;
  },

  updatePlan: async (id: number, plan: Partial<SaasPlan>): Promise<any> => {
    const response = await axios.put(`/api/superadmin/billing/plans/${id}`, plan);
    return response.data;
  },

  deletePlan: async (id: number): Promise<any> => {
    const response = await axios.delete(`/api/superadmin/billing/plans/${id}`);
    return response.data;
  }
};
