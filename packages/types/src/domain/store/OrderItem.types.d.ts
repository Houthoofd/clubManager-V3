import { z } from 'zod';
import { orderItemSchema } from '../../validators/store/order-item.validators.js';
export type OrderItem = z.infer<typeof orderItemSchema>;
export interface OrderItemWithRelations extends OrderItem {
    commande: {
        id: number;
        unique_id?: string | null;
        numero_commande?: string | null;
        utilisateur_id: number;
        total: number;
        date_commande: Date;
        statut: string;
    };
    article: {
        id: number;
        nom: string;
        description?: string | null;
        prix: number;
        image_url?: string | null;
        categorie_id?: number | null;
        actif: boolean;
    };
    taille: {
        id: number;
        nom: string;
        ordre: number;
    };
}
export interface OrderItemWithDetails extends OrderItem {
    article_nom: string;
    article_description?: string | null;
    article_image_url?: string | null;
    article_actif: boolean;
    taille_nom: string;
    categorie_nom?: string;
    sous_total: number;
}
export interface OrderItemWithOrder extends OrderItem {
    commande_numero?: string | null;
    commande_date: Date;
    commande_statut: string;
    utilisateur_id: number;
    utilisateur_nom: string;
    utilisateur_prenom: string;
}
export interface OrderItemPublic {
    id: number;
    article_id: number;
    article_nom: string;
    article_image_url?: string | null;
    taille_id: number;
    taille_nom: string;
    quantite: number;
    prix: number;
    sous_total: number;
}
export interface OrderItemBasic {
    id: number;
    commande_id: number;
    article_id: number;
    taille_id: number;
    quantite: number;
    prix: number;
}
export interface OrderItemListItem {
    id: number;
    commande_id: number;
    commande_numero?: string | null;
    article_id: number;
    article_nom: string;
    article_image_url?: string | null;
    taille_id: number;
    taille_nom: string;
    quantite: number;
    prix: number;
    sous_total: number;
}
export interface OrderItemCart {
    article_id: number;
    article_nom: string;
    article_prix: number;
    article_image_url?: string | null;
    taille_id: number;
    taille_nom: string;
    quantite: number;
    prix_unitaire: number;
    sous_total: number;
    disponible: boolean;
    quantite_disponible: number;
}
export interface OrderItemReceipt {
    article_nom: string;
    taille_nom: string;
    quantite: number;
    prix_unitaire: number;
    sous_total: number;
}
export interface OrderItemStats {
    article_id: number;
    article_nom: string;
    taille_id: number;
    taille_nom: string;
    quantite_totale_vendue: number;
    nombre_commandes: number;
    revenu_total: number;
    prix_moyen: number;
}
export interface OrderItemGroupedByArticle {
    article_id: number;
    article_nom: string;
    article_image_url?: string | null;
    categorie_nom?: string;
    tailles: {
        taille_id: number;
        taille_nom: string;
        quantite: number;
        prix: number;
        sous_total: number;
    }[];
    quantite_totale: number;
    montant_total: number;
    nombre_commandes: number;
}
export interface OrderItemGroupedBySize {
    taille_id: number;
    taille_nom: string;
    articles: {
        article_id: number;
        article_nom: string;
        quantite: number;
        prix: number;
        sous_total: number;
    }[];
    quantite_totale: number;
    montant_total: number;
}
export interface OrderItemExport {
    commande_numero?: string | null;
    date_commande: Date;
    utilisateur_nom: string;
    utilisateur_prenom: string;
    article_nom: string;
    categorie_nom?: string;
    taille_nom: string;
    quantite: number;
    prix_unitaire: number;
    sous_total: number;
}
export interface OrderItemWithStockValidation extends OrderItem {
    article_nom: string;
    taille_nom: string;
    quantite_disponible: number;
    est_disponible: boolean;
    message_erreur?: string;
}
export interface OrderItemSummary {
    article_nom: string;
    article_image_url?: string | null;
    taille_nom: string;
    quantite: number;
    prix_unitaire: number;
    sous_total: number;
}
export interface OrderItemNotification {
    article_nom: string;
    taille_nom: string;
    quantite: number;
    prix: number;
}
export interface OrderItemsBySummary {
    commande_id: number;
    nombre_articles: number;
    quantite_totale: number;
    montant_total: number;
    articles: {
        nom: string;
        taille: string;
        quantite: number;
    }[];
}
export interface OrderItemPriceUpdate {
    id: number;
    article_nom: string;
    taille_nom: string;
    prix_actuel: number;
    prix_nouveau: number;
    difference: number;
}
//# sourceMappingURL=OrderItem.types.d.ts.map