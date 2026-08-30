import { z } from 'zod';
import { sizeSchema } from '../../validators/store/size.validators.js';
export type Size = z.infer<typeof sizeSchema>;
export interface SizeWithRelations extends Size {
    stocks: {
        id: number;
        article_id: number;
        quantite: number;
        quantite_minimum: number;
    }[];
}
export interface SizeWithStats extends Size {
    nombre_stocks: number;
    quantite_totale: number;
    nombre_articles: number;
}
export interface SizeWithArticles extends Size {
    articles: {
        id: number;
        nom: string;
        prix: number;
        image_url?: string | null;
        actif: boolean;
        quantite_disponible: number;
    }[];
}
export interface SizePublic {
    id: number;
    nom: string;
    ordre: number;
}
export interface SizeBasic {
    id: number;
    nom: string;
    ordre: number;
}
export interface SizeListItem {
    id: number;
    nom: string;
    ordre: number;
    nombre_stocks: number;
    quantite_totale: number;
}
export interface SizeOption {
    id: number;
    nom: string;
    disponible: boolean;
    quantite_disponible?: number;
}
export interface SizeWithAvailability extends Size {
    disponible: boolean;
    quantite_disponible: number;
    en_rupture: boolean;
}
//# sourceMappingURL=Size.types.d.ts.map