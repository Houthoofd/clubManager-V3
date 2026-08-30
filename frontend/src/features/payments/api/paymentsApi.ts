import { apiClient } from "../../../shared/api/apiClient";
import type { PricingPlan } from "@clubmanager/types";

export interface QuickPayItem {
  id: number;
  type: "cotisation" | "boutique";
  montant: number;
  description: string;
}

export const getQuickPayData = async (token: string, type?: string | null, id?: string | null): Promise<QuickPayItem[]> => {
  let url = `/payments/public/quick-pay?token=${token}`;
  if (type) url += `&type=${type}`;
  if (id) url += `&id=${id}`;
  const response = await apiClient.get<{ data: QuickPayItem[] }>(url);
  return response.data.data;
};

export const createPublicStripeIntent = async (data: {
  token: string;
  item_type: "cotisation" | "boutique";
  item_id: number;
}) => {
  const response = await apiClient.post<{ clientSecret: string; paymentIntentId: string }>(
    "/payments/stripe/public/intent",
    data
  );
  return response.data;
};

export const verifyPublicPayment = async (
  token: string,
  payment_intent: string,
  item_type: "cotisation" | "boutique",
  item_id: number
) => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    "/payments/stripe/public/verify",
    { token, payment_intent, item_type, item_id }
  );
  return response.data;
};

export const getPlans = async (forceRefresh?: boolean): Promise<PricingPlan[]> => { return []; };
