import { z } from 'zod';
import { articleSchema } from '../../validators/store/article.validators.js';
export type Article = z.infer<typeof articleSchema>;
export interface ArticleWithRelations extends Article {
    categorie?: {
        id: number;
        nom: string;
        description?: string | null;
        ordre: number;
    } | null;
    images: {
        id: number;
        url: string;
        ordre: number;
    }[];
    stocks: {
        id: number;
        taille_id: number;
        taille_nom: string;
        quantite: number;
        quantite_minimum: number;
    }[];
}
export interface ArticleWithImages extends Article {
    images: {
        id: number;
        url: string;
        ordre: number;
    }[];
}
export interface ArticleWithStocks extends Article {
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
    en_rupture_totale: boolean;
    tailles_disponibles: number;
}
export interface ArticleWithStats extends Article {
    nombre_ventes: number;
    quantite_vendue: number;
    revenu_total: number;
    quantite_totale_stock: number;
    nombre_tailles_disponibles: number;
    valeur_stock: number;
}
export interface ArticlePublic {
    id: number;
    nom: string;
    description?: string | null;
    prix: number;
    image_url?: string | null;
    categorie_id?: number | null;
    categorie_nom?: string;
    actif: boolean;
    images?: {
        id: number;
        url: string;
        ordre: number;
    }[];
    tailles_disponibles?: {
        id: number;
        nom: string;
        quantite: number;
        disponible: boolean;
    }[];
    en_stock: boolean;
}
export interface ArticleBasic {
    id: number;
    nom: string;
    prix: number;
    image_url?: string | null;
    actif: boolean;
}
export interface ArticleListItem {
    id: number;
    nom: string;
    description?: string | null;
    prix: number;
    image_url?: string | null;
    categorie_id?: number | null;
    categorie_nom?: string;
    actif: boolean;
    quantite_totale: number;
    nombre_images: number;
    nombre_tailles: number;
    created_at: Date;
    updated_at?: Date | null;
}
export interface ArticleCatalogItem {
    id: number;
    nom: string;
    description?: string | null;
    prix: number;
    image_url?: string | null;
    categorie_nom?: string;
    images: string[];
    en_stock: boolean;
    tailles_disponibles: string[];
}
export interface ArticleDetail extends ArticleWithRelations {
    nombre_ventes?: number;
    quantite_vendue?: number;
    quantite_totale: number;
    en_rupture_totale: boolean;
    stock_bas: boolean;
    valeur_stock: number;
    images_triees: {
        id: number;
        url: string;
        ordre: number;
    }[];
    stocks_detailles: {
        id: number;
        taille_id: number;
        taille_nom: string;
        taille_ordre: number;
        quantite: number;
        quantite_minimum: number;
        en_rupture: boolean;
        stock_bas: boolean;
        disponible: boolean;
    }[];
}
export interface ArticleCartItem {
    id: number;
    nom: string;
    prix: number;
    image_url?: string | null;
    taille_id: number;
    taille_nom: string;
    quantite_selectionnee: number;
    quantite_disponible: number;
    sous_total: number;
}
export interface ArticleWithSizeAvailability extends Article {
    taille_id: number;
    taille_nom: string;
    quantite_disponible: number;
    disponible: boolean;
    stock_id?: number;
}
export interface ArticleSummary {
    id: number;
    nom: string;
    categorie_nom?: string;
    prix: number;
    quantite_stock: number;
    valeur_stock: number;
    nombre_ventes: number;
    quantite_vendue: number;
    revenu_total: number;
    actif: boolean;
}
//# sourceMappingURL=Article.types.d.ts.map