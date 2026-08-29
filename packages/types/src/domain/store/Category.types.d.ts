import { z } from 'zod';
import { categorySchema } from '../../validators/store/category.validators.js';
export type Category = z.infer<typeof categorySchema>;
export interface CategoryWithRelations extends Category {
    articles: {
        id: number;
        nom: string;
        description?: string | null;
        prix: number;
        image_url?: string | null;
        actif: boolean;
    }[];
}
export interface CategoryWithStats extends Category {
    nombre_articles: number;
    nombre_articles_actifs: number;
    prix_moyen?: number;
}
export interface CategoryWithArticles extends Category {
    articles: {
        id: number;
        nom: string;
        description?: string | null;
        prix: number;
        image_url?: string | null;
        actif: boolean;
        images?: {
            id: number;
            url: string;
            ordre: number;
        }[];
    }[];
}
export interface CategoryPublic {
    id: number;
    nom: string;
    description?: string | null;
    ordre: number;
    nombre_articles_actifs?: number;
}
export interface CategoryBasic {
    id: number;
    nom: string;
    ordre: number;
}
export interface CategoryListItem {
    id: number;
    nom: string;
    description?: string | null;
    ordre: number;
    nombre_articles: number;
    nombre_articles_actifs: number;
}
export interface CategoryMenuItem {
    id: number;
    nom: string;
    ordre: number;
    nombre_articles_actifs: number;
}
//# sourceMappingURL=Category.types.d.ts.map