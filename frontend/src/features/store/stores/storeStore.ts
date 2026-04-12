/**
 * Store UI State — Boutique/Store Module
 * Gestion de l'état UI uniquement (modales, sélections, filtres).
 * Les données serveur sont gérées par React Query dans useStore.ts.
 */

import { create } from 'zustand';

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

export interface ArticleImage {
  id: number;
  article_id: number;
  url: string;
  ordre: number;
}

export interface ArticleWithImages extends Article {
  images: ArticleImage[];
}

export type OrderStatus = 'en_attente' | 'payee' | 'expediee' | 'livree' | 'annulee';

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

export interface CartItem {
  article_id: number;
  article_nom: string;
  taille_id: number;
  taille_nom: string;
  prix: number;
  quantite: number;
  image_url?: string | null;
}

// ─── Interface du store ───────────────────────────────────────────────────────

interface StoreUIState {
  // ── Onglet actif ────────────────────────────────────────────────────────────
  activeTab: 'catalogue' | 'commandes' | 'stocks' | 'configuration' | 'boutique' | 'mes_commandes';
  setActiveTab: (tab: StoreUIState['activeTab']) => void;

  // ── Modal article ────────────────────────────────────────────────────────────
  articleModalOpen: boolean;
  editingArticle: Article | null;
  openArticleModal: (article?: Article) => void;
  closeArticleModal: () => void;

  // ── Modal catégorie ──────────────────────────────────────────────────────────
  categoryModalOpen: boolean;
  editingCategory: Category | null;
  openCategoryModal: (category?: Category) => void;
  closeCategoryModal: () => void;

  // ── Modal taille ─────────────────────────────────────────────────────────────
  sizeModalOpen: boolean;
  editingSize: Size | null;
  openSizeModal: (size?: Size) => void;
  closeSizeModal: () => void;

  // ── Modal détail commande ────────────────────────────────────────────────────
  orderDetailModalOpen: boolean;
  selectedOrder: OrderWithItems | null;
  openOrderDetailModal: (order: OrderWithItems) => void;
  closeOrderDetailModal: () => void;

  // ── Panier / commande rapide ─────────────────────────────────────────────────
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (articleId: number, tailleId: number) => void;
  clearCart: () => void;
  cartModalOpen: boolean;
  openCartModal: () => void;
  closeCartModal: () => void;

  // ── Modal commande rapide (article unique) ───────────────────────────────────
  quickOrderModalOpen: boolean;
  quickOrderArticle: ArticleWithImages | null;
  openQuickOrderModal: (article: ArticleWithImages) => void;
  closeQuickOrderModal: () => void;

  // ── Modal ajustement stock ───────────────────────────────────────────────────
  stockAdjustModalOpen: boolean;
  adjustingStock: Stock | null;
  openStockAdjustModal: (stock: Stock) => void;
  closeStockAdjustModal: () => void;

  // ── Filtres articles ─────────────────────────────────────────────────────────
  articleSearch: string;
  setArticleSearch: (s: string) => void;
  articleCategoryFilter: number | null;
  setArticleCategoryFilter: (id: number | null) => void;
  articleActifFilter: string;
  setArticleActifFilter: (v: string) => void;

  // ── Filtres commandes ────────────────────────────────────────────────────────
  orderStatusFilter: string;
  setOrderStatusFilter: (s: string) => void;

  // ── Pagination articles ──────────────────────────────────────────────────────
  articlePage: number;
  setArticlePage: (page: number) => void;

  // ── Pagination commandes ─────────────────────────────────────────────────────
  orderPage: number;
  setOrderPage: (page: number) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStoreUI = create<StoreUIState>((set) => ({
  // ══════════════════════════════════════════════════════════════════════════
  // ONGLET ACTIF
  // ══════════════════════════════════════════════════════════════════════════

  activeTab: 'catalogue',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ══════════════════════════════════════════════════════════════════════════
  // MODAL ARTICLE
  // ══════════════════════════════════════════════════════════════════════════

  articleModalOpen: false,
  editingArticle: null,
  openArticleModal: (article) =>
    set({ articleModalOpen: true, editingArticle: article ?? null }),
  closeArticleModal: () =>
    set({ articleModalOpen: false, editingArticle: null }),

  // ══════════════════════════════════════════════════════════════════════════
  // MODAL CATÉGORIE
  // ══════════════════════════════════════════════════════════════════════════

  categoryModalOpen: false,
  editingCategory: null,
  openCategoryModal: (category) =>
    set({ categoryModalOpen: true, editingCategory: category ?? null }),
  closeCategoryModal: () =>
    set({ categoryModalOpen: false, editingCategory: null }),

  // ══════════════════════════════════════════════════════════════════════════
  // MODAL TAILLE
  // ══════════════════════════════════════════════════════════════════════════

  sizeModalOpen: false,
  editingSize: null,
  openSizeModal: (size) =>
    set({ sizeModalOpen: true, editingSize: size ?? null }),
  closeSizeModal: () =>
    set({ sizeModalOpen: false, editingSize: null }),

  // ══════════════════════════════════════════════════════════════════════════
  // MODAL DÉTAIL COMMANDE
  // ══════════════════════════════════════════════════════════════════════════

  orderDetailModalOpen: false,
  selectedOrder: null,
  openOrderDetailModal: (order) =>
    set({ orderDetailModalOpen: true, selectedOrder: order }),
  closeOrderDetailModal: () =>
    set({ orderDetailModalOpen: false, selectedOrder: null }),

  // ══════════════════════════════════════════════════════════════════════════
  // PANIER
  // ══════════════════════════════════════════════════════════════════════════

  cartItems: [],

  addToCart: (item) =>
    set((state) => {
      const existing = state.cartItems.find(
        (c) => c.article_id === item.article_id && c.taille_id === item.taille_id,
      );
      if (existing) {
        return {
          cartItems: state.cartItems.map((c) =>
            c.article_id === item.article_id && c.taille_id === item.taille_id
              ? { ...c, quantite: c.quantite + item.quantite }
              : c,
          ),
        };
      }
      return { cartItems: [...state.cartItems, item] };
    }),

  removeFromCart: (articleId, tailleId) =>
    set((state) => ({
      cartItems: state.cartItems.filter(
        (c) => !(c.article_id === articleId && c.taille_id === tailleId),
      ),
    })),

  clearCart: () => set({ cartItems: [] }),

  cartModalOpen: false,
  openCartModal: () => set({ cartModalOpen: true }),
  closeCartModal: () => set({ cartModalOpen: false }),

  // ══════════════════════════════════════════════════════════════════════════
  // MODAL COMMANDE RAPIDE
  // ══════════════════════════════════════════════════════════════════════════

  quickOrderModalOpen: false,
  quickOrderArticle: null,
  openQuickOrderModal: (article) =>
    set({ quickOrderModalOpen: true, quickOrderArticle: article }),
  closeQuickOrderModal: () =>
    set({ quickOrderModalOpen: false, quickOrderArticle: null }),

  // ══════════════════════════════════════════════════════════════════════════
  // MODAL AJUSTEMENT STOCK
  // ══════════════════════════════════════════════════════════════════════════

  stockAdjustModalOpen: false,
  adjustingStock: null,
  openStockAdjustModal: (stock) =>
    set({ stockAdjustModalOpen: true, adjustingStock: stock }),
  closeStockAdjustModal: () =>
    set({ stockAdjustModalOpen: false, adjustingStock: null }),

  // ══════════════════════════════════════════════════════════════════════════
  // FILTRES ARTICLES
  // ══════════════════════════════════════════════════════════════════════════

  articleSearch: '',
  setArticleSearch: (s) => set({ articleSearch: s, articlePage: 1 }),

  articleCategoryFilter: null,
  setArticleCategoryFilter: (id) => set({ articleCategoryFilter: id, articlePage: 1 }),

  articleActifFilter: '',
  setArticleActifFilter: (v) => set({ articleActifFilter: v, articlePage: 1 }),

  // ══════════════════════════════════════════════════════════════════════════
  // FILTRES COMMANDES
  // ══════════════════════════════════════════════════════════════════════════

  orderStatusFilter: '',
  setOrderStatusFilter: (s) => set({ orderStatusFilter: s, orderPage: 1 }),

  // ══════════════════════════════════════════════════════════════════════════
  // PAGINATION
  // ══════════════════════════════════════════════════════════════════════════

  articlePage: 1,
  setArticlePage: (page) => set({ articlePage: page }),

  orderPage: 1,
  setOrderPage: (page) => set({ orderPage: page }),
}));
