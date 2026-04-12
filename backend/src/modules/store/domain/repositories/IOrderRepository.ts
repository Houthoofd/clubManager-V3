/**
 * IOrderRepository
 * Interface du repository commandes (Domain Layer)
 * Contrat pour les opérations sur les commandes et leurs articles
 */

import type { OrderStatus } from "@clubmanager/types";

// ==================== ROW / INPUT TYPES ====================

export interface OrderRow {
  id: number;
  unique_id: string;
  numero_commande: string;
  user_id: number;
  total: number;
  date_commande: Date;
  statut: OrderStatus;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
  updated_at: Date;
  // Champs issus des JOINs avec utilisateurs
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
}

export interface OrderItemRow {
  id: number;
  commande_id: number;
  article_id: number;
  taille_id: number | null;
  quantite: number;
  prix: number;
  created_at: Date;
  // Champs issus des JOINs
  article_nom?: string;
  article_image_url?: string | null;
  taille_nom?: string;
}

export interface OrderWithItems extends OrderRow {
  items: OrderItemRow[];
}

export interface CreateOrderInput {
  user_id: number;
  ip_address?: string | null;
  user_agent?: string | null;
  items: {
    article_id: number;
    taille_id: number;
    quantite: number;
    prix: number;
  }[];
}

export interface OrderQuery {
  user_id?: number;
  statut?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedOrders {
  orders: OrderRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==================== REPOSITORY INTERFACE ====================

export interface IOrderRepository {
  /** Retourne la liste paginée des commandes avec filtres dynamiques */
  findAll(query: OrderQuery): Promise<PaginatedOrders>;

  /** Retourne une commande par son ID avec tous ses items */
  findById(id: number): Promise<OrderWithItems | null>;

  /** Retourne toutes les commandes d'un utilisateur */
  findByUserId(userId: number): Promise<OrderRow[]>;

  /** Crée une nouvelle commande avec ses items et retourne l'ID de la commande */
  create(data: CreateOrderInput): Promise<number>;

  /** Met à jour le statut d'une commande */
  updateStatus(id: number, statut: OrderStatus): Promise<void>;
}
