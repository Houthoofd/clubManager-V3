import { z } from 'zod';
import { orderSchema } from '../../validators/store/order.validators.js';
import { OrderStatus } from '../../enums/store.enums.js';
export type Order = z.infer<typeof orderSchema>;
export interface OrderWithRelations extends Order {
    utilisateur: {
        id: number;
        userId: string;
        first_name: string;
        last_name: string;
        email: string;
        photo_url?: string;
    };
    articles: {
        id: number;
        article_id: number;
        article_nom: string;
        article_image_url?: string | null;
        taille_id: number;
        taille_nom: string;
        quantite: number;
        prix: number;
        sous_total: number;
    }[];
}
export interface OrderWithItems extends Order {
    items: {
        id: number;
        article_id: number;
        taille_id: number;
        quantite: number;
        prix: number;
    }[];
    nombre_articles: number;
    quantite_totale: number;
}
export interface OrderWithDetails extends OrderWithRelations {
    nombre_articles: number;
    quantite_totale: number;
    peut_etre_annulee: boolean;
    peut_etre_modifiee: boolean;
    est_expediee: boolean;
    est_livree: boolean;
    categories: string[];
}
export interface OrderPublic {
    id: number;
    unique_id?: string | null;
    numero_commande?: string | null;
    total: number;
    date_commande: Date;
    statut: OrderStatus;
    nombre_articles: number;
}
export interface OrderBasic {
    id: number;
    numero_commande?: string | null;
    utilisateur_id: number;
    total: number;
    date_commande: Date;
    statut: OrderStatus;
}
export interface OrderListItem {
    id: number;
    unique_id?: string | null;
    numero_commande?: string | null;
    utilisateur_id: number;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    utilisateur_email: string;
    total: number;
    date_commande: Date;
    statut: OrderStatus;
    nombre_articles: number;
    quantite_totale: number;
    created_at: Date;
    updated_at?: Date | null;
}
export interface OrderHistoryItem {
    id: number;
    unique_id?: string | null;
    numero_commande?: string | null;
    total: number;
    date_commande: Date;
    statut: OrderStatus;
    nombre_articles: number;
    articles_apercu: {
        article_nom: string;
        taille_nom: string;
        quantite: number;
        image_url?: string | null;
    }[];
}
export interface OrderDetail extends OrderWithRelations {
    utilisateur_nom_complet: string;
    statut_label: string;
    statut_couleur: string;
    total_formatted: string;
    nombre_articles: number;
    quantite_totale: number;
    peut_etre_annulee: boolean;
    peut_etre_modifiee: boolean;
    peut_etre_expediee: boolean;
    peut_etre_livree: boolean;
}
export interface OrderCart {
    utilisateur_id: number;
    items: {
        article_id: number;
        taille_id: number;
        quantite: number;
        prix: number;
    }[];
    total: number;
    ip_address?: string;
    user_agent?: string;
}
export interface OrderStats {
    nombre_commandes: number;
    montant_total: number;
    montant_moyen: number;
    par_statut: {
        [key in OrderStatus]: {
            nombre: number;
            montant: number;
        };
    };
    commandes_en_attente: number;
    commandes_payees: number;
    commandes_expediees: number;
    commandes_livrees: number;
    commandes_annulees: number;
    nombre_articles_vendus: number;
    quantite_totale_vendue: number;
}
export interface OrderMonthlySummary {
    annee: number;
    mois: number;
    nombre_commandes: number;
    montant_total: number;
    nombre_articles: number;
    panier_moyen: number;
}
export interface OrderDailySummary {
    date: Date;
    nombre_commandes: number;
    montant_total: number;
    nombre_nouveaux_clients: number;
    panier_moyen: number;
}
export interface OrderWithUser extends Order {
    utilisateur_nom: string;
    utilisateur_prenom: string;
    utilisateur_email: string;
    utilisateur_photo_url?: string;
}
export interface OrderExport {
    id: number;
    numero_commande?: string | null;
    date_commande: Date;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    utilisateur_email: string;
    total: number;
    statut: OrderStatus;
    nombre_articles: number;
    quantite_totale: number;
    ip_address?: string | null;
    created_at: Date;
}
export interface OrderWithArticleDetails extends Order {
    articles: {
        id: number;
        article_id: number;
        article_nom: string;
        article_description?: string | null;
        article_image_url?: string | null;
        categorie_nom?: string;
        taille_id: number;
        taille_nom: string;
        quantite: number;
        prix_unitaire: number;
        prix_total: number;
    }[];
    sous_total: number;
    nombre_articles_distincts: number;
}
export declare const ORDER_STATUS_LABELS: Record<OrderStatus, string>;
export declare const ORDER_STATUS_COLORS: Record<OrderStatus, string>;
export interface OrderNotification {
    id: number;
    numero_commande?: string | null;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    utilisateur_email: string;
    total: number;
    statut: OrderStatus;
    date_commande: Date;
    nombre_articles: number;
}
//# sourceMappingURL=Order.types.d.ts.map