/**
 * Store API Service
 * Service pour gérer les appels API du module boutique
 */

import apiClient from "../../../shared/api/apiClient";

// ─── Types locaux ─────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  nom: string;
  description?: string | null;
  ordre: number;
  nombre_articles?: number;
  nombre_articles_actifs?: number;
}

export interface Size {
  id: number;
  nom: string;
  ordre: number;
}

export interface ArticleImage {
  id: number;
  article_id: number;
  url: string;
  ordre: number;
}

export interface Article {
  id: number;
  nom: string;
  description?: string | null;
  prix: number;
  image_url?: string | null;
  categorie_id?: number | null;
  categorie_nom?: string | null;
  actif: boolean;
  created_at: string;
}

export interface ArticleWithImages extends Article {
  images: ArticleImage[];
}

export type OrderStatus =
  | "en_attente"
  | "payee"
  | "expediee"
  | "livree"
  | "annulee";

export interface OrderItem {
  id: number;
  article_id: number;
  taille_id?: number | null;
  quantite: number;
  prix: number;
  article_nom?: string;
  article_image_url?: string | null;
  taille_nom?: string;
}

export interface Order {
  id: number;
  unique_id: string;
  numero_commande: string;
  user_id: number;
  total: number;
  date_commande: string;
  statut: OrderStatus;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface Stock {
  id: number;
  article_id: number;
  taille_id: number;
  quantite: number;
  quantite_minimum: number;
  stock_disponible: number;
  article_nom?: string;
  taille_nom?: string;
  en_rupture?: boolean;
  stock_bas?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Paramètres de requête ─────────────────────────────────────────────────────

export interface GetArticlesParams {
  search?: string;
  categorie_id?: number;
  actif?: boolean;
  page?: number;
  limit?: number;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  statut?: string;
}

export interface CreateOrderItemDto {
  article_id: number;
  taille_id: number;
  quantite: number;
  prix: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const storeApi = {
  // ── CATÉGORIES ────────────────────────────────────────────────────────────

  getCategories: (): Promise<Category[]> =>
    apiClient.get("/store/categories").then((r) => r.data.data),

  createCategory: (data: {
    nom: string;
    description?: string;
    ordre?: number;
  }): Promise<Category> =>
    apiClient.post("/store/categories", data).then((r) => r.data.data),

  updateCategory: (
    id: number,
    data: Partial<{ nom: string; description: string; ordre: number }>,
  ): Promise<Category> =>
    apiClient.put(`/store/categories/${id}`, data).then((r) => r.data.data),

  deleteCategory: (
    id: number,
  ): Promise<{ success: boolean; message: string }> =>
    apiClient.delete(`/store/categories/${id}`).then((r) => r.data),

  reorderCategories: (
    categories: { id: number; ordre: number }[],
  ): Promise<{ success: boolean; message: string }> =>
    apiClient
      .post("/store/categories/reorder", { categories })
      .then((r) => r.data),

  // ── TAILLES ───────────────────────────────────────────────────────────────

  getSizes: (): Promise<Size[]> =>
    apiClient.get("/store/sizes").then((r) => r.data.data),

  createSize: (data: { nom: string; ordre?: number }): Promise<Size> =>
    apiClient.post("/store/sizes", data).then((r) => r.data.data),

  updateSize: (
    id: number,
    data: Partial<{ nom: string; ordre: number }>,
  ): Promise<Size> =>
    apiClient.put(`/store/sizes/${id}`, data).then((r) => r.data.data),

  deleteSize: (id: number): Promise<{ success: boolean; message: string }> =>
    apiClient.delete(`/store/sizes/${id}`).then((r) => r.data),

  // ── ARTICLES ──────────────────────────────────────────────────────────────

  getArticles: (
    params?: GetArticlesParams,
  ): Promise<PaginatedResponse<Article>> =>
    apiClient.get("/store/articles", { params }).then((r) => ({
      items: r.data.data.articles,
      pagination: r.data.data.pagination,
    })),

  getArticleById: (id: number): Promise<ArticleWithImages> =>
    apiClient.get(`/store/articles/${id}`).then((r) => r.data.data),

  createArticle: (data: {
    nom: string;
    prix: number;
    description?: string;
    categorie_id?: number;
    actif?: boolean;
  }): Promise<Article> =>
    apiClient.post("/store/articles", data).then((r) => r.data.data),

  updateArticle: (
    id: number,
    data: Partial<{
      nom: string;
      prix: number;
      description: string;
      categorie_id: number;
      actif: boolean;
    }>,
  ): Promise<Article> =>
    apiClient.put(`/store/articles/${id}`, data).then((r) => r.data.data),

  deleteArticle: (id: number): Promise<{ success: boolean; message: string }> =>
    apiClient.delete(`/store/articles/${id}`).then((r) => r.data),

  toggleArticle: (id: number): Promise<Article> =>
    apiClient.patch(`/store/articles/${id}/toggle`).then((r) => r.data.data),

  uploadArticleImage: (
    articleId: number,
    file: File,
  ): Promise<ArticleImage> => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient
      .post(`/store/articles/${articleId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data.data);
  },

  deleteArticleImage: (
    articleId: number,
    imageId: number,
  ): Promise<{ success: boolean; message: string }> =>
    apiClient
      .delete(`/store/articles/${articleId}/images/${imageId}`)
      .then((r) => r.data),

  // ── COMMANDES ─────────────────────────────────────────────────────────────

  getOrders: (params?: GetOrdersParams): Promise<PaginatedResponse<Order>> =>
    apiClient.get("/store/orders", { params }).then((r) => ({
      items: r.data.data.orders,
      pagination: r.data.data.pagination,
    })),

  getMyOrders: (): Promise<Order[]> =>
    apiClient.get("/store/orders/my").then((r) => r.data.data),

  getOrderById: (id: number): Promise<OrderWithItems> =>
    apiClient.get(`/store/orders/${id}`).then((r) => r.data.data),

  createOrder: (data: { items: CreateOrderItemDto[] }): Promise<Order> =>
    apiClient.post("/store/orders", data).then((r) => r.data.data),

  updateOrderStatus: (id: number, statut: string): Promise<Order> =>
    apiClient
      .patch(`/store/orders/${id}/status`, { statut })
      .then((r) => r.data.data),

  cancelOrder: (id: number): Promise<{ success: boolean; message: string }> =>
    apiClient.post(`/store/orders/${id}/cancel`).then((r) => r.data),

  // ── STOCKS ────────────────────────────────────────────────────────────────

  getStocks: (articleId?: number): Promise<Stock[]> =>
    apiClient
      .get("/store/stocks", {
        params: articleId ? { article_id: articleId } : {},
      })
      .then((r) => r.data.data),

  getLowStocks: (): Promise<Stock[]> =>
    apiClient.get("/store/stocks/low").then((r) => r.data.data),

  getStocksByArticle: (articleId: number): Promise<Stock[]> =>
    apiClient
      .get(`/store/stocks/article/${articleId}`)
      .then((r) => r.data.data),

  updateStock: (
    id: number,
    data: { quantite?: number; quantite_minimum?: number },
  ): Promise<Stock> =>
    apiClient.put(`/store/stocks/${id}`, data).then((r) => r.data.data),

  adjustStock: (
    id: number,
    data: { quantite: number; motif?: string },
  ): Promise<Stock> =>
    apiClient
      .post("/store/stocks/adjust", { id, ...data })
      .then((r) => r.data.data),
};
