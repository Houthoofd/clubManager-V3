import { z } from 'zod';
import { stockSchema } from '../../validators/store/stock.validators.js';
export type Stock = z.infer<typeof stockSchema>;
export interface StockWithRelations extends Stock {
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
export interface StockWithDetails extends Stock {
    article_nom: string;
    article_prix: number;
    article_image_url?: string | null;
    article_actif: boolean;
    taille_nom: string;
    taille_ordre: number;
    categorie_nom?: string;
}
export interface StockWithStatus extends Stock {
    en_rupture: boolean;
    stock_bas: boolean;
    pourcentage_stock: number;
    statut: 'ok' | 'bas' | 'rupture';
    valeur_stock: number;
}
export interface StockWithHistory extends StockWithRelations {
    derniers_mouvements: {
        id: number;
        type_mouvement: string;
        quantite_mouvement: number;
        quantite_avant: number;
        quantite_apres: number;
        motif?: string | null;
        created_at: Date;
    }[];
    total_entrees: number;
    total_sorties: number;
}
export interface StockPublic {
    id: number;
    article_id: number;
    taille_id: number;
    quantite: number;
    disponible: boolean;
}
export interface StockBasic {
    id: number;
    article_id: number;
    taille_id: number;
    quantite: number;
}
export interface StockListItem {
    id: number;
    article_id: number;
    article_nom: string;
    article_prix: number;
    taille_id: number;
    taille_nom: string;
    quantite: number;
    quantite_minimum: number;
    en_rupture: boolean;
    stock_bas: boolean;
    valeur_stock: number;
    updated_at?: Date | null;
}
export interface StockInventoryItem {
    id: number;
    article_nom: string;
    taille_nom: string;
    quantite_actuelle: number;
    quantite_minimum: number;
    quantite_comptee?: number;
    ecart?: number;
    statut: 'ok' | 'bas' | 'rupture';
    categorie_nom?: string;
}
export interface StockLowItem {
    id: number;
    article_id: number;
    article_nom: string;
    article_image_url?: string | null;
    taille_id: number;
    taille_nom: string;
    quantite: number;
    quantite_minimum: number;
    manquant: number;
    categorie_nom?: string;
}
export interface StockGroupedByArticle {
    article_id: number;
    article_nom: string;
    article_prix: number;
    article_image_url?: string | null;
    categorie_nom?: string;
    stocks: {
        id: number;
        taille_id: number;
        taille_nom: string;
        quantite: number;
        quantite_minimum: number;
        en_rupture: boolean;
        stock_bas: boolean;
    }[];
    quantite_totale: number;
    nombre_tailles: number;
    valeur_totale: number;
}
export interface StockGroupedBySize {
    taille_id: number;
    taille_nom: string;
    taille_ordre: number;
    stocks: {
        id: number;
        article_id: number;
        article_nom: string;
        article_prix: number;
        quantite: number;
        quantite_minimum: number;
        en_rupture: boolean;
        stock_bas: boolean;
    }[];
    quantite_totale: number;
    nombre_articles: number;
    valeur_totale: number;
}
export interface StockAvailability {
    id: number;
    article_id: number;
    taille_id: number;
    quantite_disponible: number;
    disponible: boolean;
    quantite_maximum_commande: number;
}
export interface StockStats {
    nombre_stocks: number;
    quantite_totale: number;
    valeur_totale: number;
    nombre_ruptures: number;
    nombre_stocks_bas: number;
    nombre_stocks_ok: number;
    par_categorie: {
        categorie_id: number | null;
        categorie_nom: string;
        nombre_stocks: number;
        quantite_totale: number;
        valeur_totale: number;
    }[];
    par_taille: {
        taille_id: number;
        taille_nom: string;
        nombre_stocks: number;
        quantite_totale: number;
    }[];
}
export interface StockSummary {
    article_id: number;
    article_nom: string;
    taille_id: number;
    taille_nom: string;
    quantite: number;
    quantite_minimum: number;
    valeur_unitaire: number;
    valeur_totale: number;
    statut: 'ok' | 'bas' | 'rupture';
    derniere_modification: Date | null;
}
export interface StockAdjustment {
    id: number;
    article_id: number;
    article_nom: string;
    taille_id: number;
    taille_nom: string;
    quantite_avant: number;
    quantite_apres: number;
    quantite_ajustement: number;
    motif?: string;
    effectue_par?: number;
}
export interface StockReplenishmentSuggestion {
    id: number;
    article_id: number;
    article_nom: string;
    taille_id: number;
    taille_nom: string;
    quantite_actuelle: number;
    quantite_minimum: number;
    quantite_suggeree: number;
    priorite: 'haute' | 'moyenne' | 'basse';
    cout_reappro: number;
}
//# sourceMappingURL=Stock.types.d.ts.map