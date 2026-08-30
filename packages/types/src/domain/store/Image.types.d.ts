import { z } from 'zod';
import { imageSchema } from '../../validators/store/image.validators.js';
export type Image = z.infer<typeof imageSchema>;
export interface ImageWithRelations extends Image {
    article: {
        id: number;
        nom: string;
        description?: string | null;
        prix: number;
        image_url?: string | null;
        categorie_id?: number | null;
        actif: boolean;
    };
}
export interface ImageWithArticle extends Image {
    article_nom: string;
    article_prix: number;
    article_actif: boolean;
    categorie_nom?: string;
}
export interface ImagePublic {
    id: number;
    url: string;
    ordre: number;
    article_id: number;
}
export interface ImageBasic {
    id: number;
    url: string;
    ordre: number;
}
export interface ImageListItem {
    id: number;
    url: string;
    ordre: number;
    article_id: number;
    article_nom: string;
}
export interface ImageGalleryItem {
    id: number;
    url: string;
    ordre: number;
    article_nom: string;
    article_prix: number;
    thumbnail_url?: string;
}
export interface ImageWithMetadata extends Image {
    taille_fichier?: number;
    largeur?: number;
    hauteur?: number;
    format?: string;
    alt_text?: string;
}
export interface ImageUploadData {
    article_id: number;
    url: string;
    ordre?: number;
}
export interface ImageSorted extends Image {
    position: number;
    est_premiere: boolean;
    est_derniere: boolean;
}
//# sourceMappingURL=Image.types.d.ts.map