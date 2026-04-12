/**
 * useStore Hooks
 * React Query hooks for the store/boutique module.
 * Covers categories, sizes, articles, orders, and stocks.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { storeApi } from '../api/storeApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GetArticlesParams {
  search?: string;
  categorie_id?: number;
  actif?: boolean;
  page?: number;
  limit?: number;
}

interface GetOrdersParams {
  page?: number;
  limit?: number;
  statut?: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const storeKeys = {
  all: ['store'] as const,
  categories: () => ['store', 'categories'] as const,
  sizes: () => ['store', 'sizes'] as const,
  articles: (params?: GetArticlesParams) => ['store', 'articles', params ?? {}] as const,
  article: (id: number) => ['store', 'article', id] as const,
  orders: (params?: GetOrdersParams) => ['store', 'orders', params ?? {}] as const,
  myOrders: () => ['store', 'orders', 'my'] as const,
  order: (id: number) => ['store', 'order', id] as const,
  stocks: (articleId?: number) => ['store', 'stocks', articleId ?? null] as const,
  lowStocks: () => ['store', 'stocks', 'low'] as const,
};

// ─── Category Queries ─────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: storeKeys.categories(),
    queryFn: storeApi.getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Size Queries ─────────────────────────────────────────────────────────────

export function useSizes() {
  return useQuery({
    queryKey: storeKeys.sizes(),
    queryFn: storeApi.getSizes,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Article Queries ──────────────────────────────────────────────────────────

export function useArticles(params?: GetArticlesParams) {
  return useQuery({
    queryKey: storeKeys.articles(params),
    queryFn: () => storeApi.getArticles(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useArticle(id: number) {
  return useQuery({
    queryKey: storeKeys.article(id),
    queryFn: () => storeApi.getArticleById(id),
    enabled: id > 0,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Order Queries ────────────────────────────────────────────────────────────

export function useOrders(params?: GetOrdersParams) {
  return useQuery({
    queryKey: storeKeys.orders(params),
    queryFn: () => storeApi.getOrders(params),
    staleTime: 1 * 60 * 1000,
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: storeKeys.myOrders(),
    queryFn: storeApi.getMyOrders,
    staleTime: 1 * 60 * 1000,
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: storeKeys.order(id),
    queryFn: () => storeApi.getOrderById(id),
    enabled: id > 0,
  });
}

// ─── Stock Queries ────────────────────────────────────────────────────────────

export function useStocks(articleId?: number) {
  return useQuery({
    queryKey: storeKeys.stocks(articleId),
    queryFn: () => storeApi.getStocks(articleId),
    staleTime: 1 * 60 * 1000,
  });
}

export function useLowStocks() {
  return useQuery({
    queryKey: storeKeys.lowStocks(),
    queryFn: storeApi.getLowStocks,
    staleTime: 1 * 60 * 1000,
  });
}

// ─── Category Mutations ───────────────────────────────────────────────────────

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storeApi.createCategory,
    onSuccess: () => {
      toast.success('Catégorie créée avec succès');
      qc.invalidateQueries({ queryKey: storeKeys.categories() });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la création'),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ nom: string; description: string; ordre: number }> }) =>
      storeApi.updateCategory(id, data),
    onSuccess: () => {
      toast.success('Catégorie mise à jour');
      qc.invalidateQueries({ queryKey: storeKeys.categories() });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la mise à jour'),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storeApi.deleteCategory,
    onSuccess: () => {
      toast.success('Catégorie supprimée');
      qc.invalidateQueries({ queryKey: storeKeys.categories() });
      qc.invalidateQueries({ queryKey: storeKeys.articles() });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la suppression'),
  });
}

export function useReorderCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storeApi.reorderCategories,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storeKeys.categories() });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la réorganisation'),
  });
}

// ─── Size Mutations ───────────────────────────────────────────────────────────

export function useCreateSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storeApi.createSize,
    onSuccess: () => {
      toast.success('Taille créée avec succès');
      qc.invalidateQueries({ queryKey: storeKeys.sizes() });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la création'),
  });
}

export function useUpdateSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ nom: string; ordre: number }> }) =>
      storeApi.updateSize(id, data),
    onSuccess: () => {
      toast.success('Taille mise à jour');
      qc.invalidateQueries({ queryKey: storeKeys.sizes() });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la mise à jour'),
  });
}

export function useDeleteSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storeApi.deleteSize,
    onSuccess: () => {
      toast.success('Taille supprimée');
      qc.invalidateQueries({ queryKey: storeKeys.sizes() });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la suppression'),
  });
}

// ─── Article Mutations ────────────────────────────────────────────────────────

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storeApi.createArticle,
    onSuccess: () => {
      toast.success('Article créé avec succès');
      qc.invalidateQueries({ queryKey: ['store', 'articles'] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la création'),
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<{ nom: string; prix: number; description: string; categorie_id: number; actif: boolean }>;
    }) => storeApi.updateArticle(id, data),
    onSuccess: (_data, variables) => {
      toast.success('Article mis à jour');
      qc.invalidateQueries({ queryKey: ['store', 'articles'] });
      qc.invalidateQueries({ queryKey: storeKeys.article(variables.id) });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la mise à jour'),
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storeApi.deleteArticle,
    onSuccess: () => {
      toast.success('Article supprimé');
      qc.invalidateQueries({ queryKey: ['store', 'articles'] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la suppression'),
  });
}

export function useToggleArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storeApi.toggleArticle,
    onSuccess: (_data, id) => {
      toast.success('Statut de l\'article mis à jour');
      qc.invalidateQueries({ queryKey: ['store', 'articles'] });
      qc.invalidateQueries({ queryKey: storeKeys.article(id) });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la mise à jour'),
  });
}

export function useUploadArticleImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ articleId, file }: { articleId: number; file: File }) =>
      storeApi.uploadArticleImage(articleId, file),
    onSuccess: (_data, variables) => {
      toast.success('Image uploadée avec succès');
      qc.invalidateQueries({ queryKey: storeKeys.article(variables.articleId) });
      qc.invalidateQueries({ queryKey: ['store', 'articles'] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de l\'upload'),
  });
}

export function useDeleteArticleImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ articleId, imageId }: { articleId: number; imageId: number }) =>
      storeApi.deleteArticleImage(articleId, imageId),
    onSuccess: (_data, variables) => {
      toast.success('Image supprimée');
      qc.invalidateQueries({ queryKey: storeKeys.article(variables.articleId) });
      qc.invalidateQueries({ queryKey: ['store', 'articles'] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la suppression'),
  });
}

// ─── Order Mutations ──────────────────────────────────────────────────────────

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storeApi.createOrder,
    onSuccess: () => {
      toast.success('Commande passée avec succès !');
      qc.invalidateQueries({ queryKey: storeKeys.myOrders() });
      qc.invalidateQueries({ queryKey: ['store', 'orders'] });
      qc.invalidateQueries({ queryKey: ['store', 'stocks'] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la commande'),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: string }) =>
      storeApi.updateOrderStatus(id, statut),
    onSuccess: (_data, variables) => {
      toast.success('Statut de la commande mis à jour');
      qc.invalidateQueries({ queryKey: ['store', 'orders'] });
      qc.invalidateQueries({ queryKey: storeKeys.order(variables.id) });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la mise à jour'),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storeApi.cancelOrder,
    onSuccess: () => {
      toast.success('Commande annulée');
      qc.invalidateQueries({ queryKey: ['store', 'orders'] });
      qc.invalidateQueries({ queryKey: storeKeys.myOrders() });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de l\'annulation'),
  });
}

// ─── Stock Mutations ──────────────────────────────────────────────────────────

export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { quantite?: number; quantite_minimum?: number } }) =>
      storeApi.updateStock(id, data),
    onSuccess: () => {
      toast.success('Stock mis à jour');
      qc.invalidateQueries({ queryKey: ['store', 'stocks'] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la mise à jour'),
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { quantite: number; motif?: string } }) =>
      storeApi.adjustStock(id, data),
    onSuccess: () => {
      toast.success('Stock ajusté avec succès');
      qc.invalidateQueries({ queryKey: ['store', 'stocks'] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de l\'ajustement'),
  });
}
