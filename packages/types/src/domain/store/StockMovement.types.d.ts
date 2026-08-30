import { z } from 'zod';
import { stockMovementSchema } from '../../validators/store/stock-movement.validators.js';
import { StockMovementType } from '../../enums/store.enums.js';
export type StockMovement = z.infer<typeof stockMovementSchema>;
export interface StockMovementWithRelations extends StockMovement {
    article: {
        id: number;
        nom: string;
        description?: string | null;
        prix: number;
        image_url?: string | null;
        categorie_id?: number | null;
        actif: boolean;
    };
    effectue_par_utilisateur?: {
        id: number;
        userId: string;
        first_name: string;
        last_name: string;
        email: string;
    } | null;
}
export interface StockMovementWithDetails extends StockMovement {
    article_nom: string;
    article_prix: number;
    article_image_url?: string | null;
    categorie_nom?: string;
    effectue_par_nom?: string;
    effectue_par_prenom?: string;
}
export interface StockMovementPublic {
    id: number;
    article_id: number;
    taille: string;
    type_mouvement: StockMovementType;
    quantite_mouvement: number;
    created_at: Date;
}
export interface StockMovementBasic {
    id: number;
    article_id: number;
    taille: string;
    type_mouvement: StockMovementType;
    quantite_mouvement: number;
    created_at: Date;
}
export interface StockMovementListItem {
    id: number;
    article_id: number;
    article_nom: string;
    article_image_url?: string | null;
    taille: string;
    type_mouvement: StockMovementType;
    type_mouvement_label: string;
    quantite_avant: number;
    quantite_apres: number;
    quantite_mouvement: number;
    commande_id?: string | null;
    motif?: string | null;
    effectue_par?: number | null;
    effectue_par_nom?: string;
    created_at: Date;
}
export interface StockMovementHistoryItem {
    id: number;
    type_mouvement: StockMovementType;
    type_mouvement_label: string;
    quantite_avant: number;
    quantite_apres: number;
    quantite_mouvement: number;
    motif?: string | null;
    effectue_par_nom?: string;
    created_at: Date;
}
export interface StockMovementGroupedByType {
    type_mouvement: StockMovementType;
    type_mouvement_label: string;
    nombre_mouvements: number;
    quantite_totale: number;
    mouvements: StockMovementListItem[];
}
export interface StockMovementGroupedByArticle {
    article_id: number;
    article_nom: string;
    article_image_url?: string | null;
    categorie_nom?: string;
    mouvements: {
        id: number;
        taille: string;
        type_mouvement: StockMovementType;
        quantite_mouvement: number;
        created_at: Date;
    }[];
    nombre_mouvements: number;
    total_entrees: number;
    total_sorties: number;
}
export interface StockMovementGroupedByDate {
    date: Date;
    nombre_mouvements: number;
    total_entrees: number;
    total_sorties: number;
    mouvements: StockMovementListItem[];
}
export interface StockMovementExport {
    date: Date;
    article_nom: string;
    categorie_nom?: string;
    taille: string;
    type_mouvement: StockMovementType;
    type_mouvement_label: string;
    quantite_avant: number;
    quantite_apres: number;
    quantite_mouvement: number;
    commande_id?: string | null;
    motif?: string | null;
    effectue_par_nom?: string;
}
export interface StockMovementStats {
    nombre_mouvements: number;
    total_entrees: number;
    total_sorties: number;
    solde_net: number;
    par_type: {
        [key in StockMovementType]: {
            nombre: number;
            quantite: number;
        };
    };
    par_jour?: {
        date: Date;
        nombre_mouvements: number;
        entrees: number;
        sorties: number;
    }[];
    articles_top?: {
        article_id: number;
        article_nom: string;
        nombre_mouvements: number;
        total_mouvement: number;
    }[];
}
export interface StockMovementMonthlySummary {
    annee: number;
    mois: number;
    nombre_mouvements: number;
    total_entrees: number;
    total_sorties: number;
    articles_affectes: number;
}
export interface StockMovementWithValue extends StockMovement {
    article_nom: string;
    article_prix: number;
    valeur_avant: number;
    valeur_apres: number;
    impact_valeur: number;
}
export interface StockMovementAudit {
    id: number;
    date: Date;
    article_nom: string;
    taille: string;
    type_mouvement: StockMovementType;
    type_mouvement_label: string;
    quantite_avant: number;
    quantite_apres: number;
    quantite_mouvement: number;
    commande_id?: string | null;
    motif?: string | null;
    effectue_par: number | null;
    effectue_par_nom: string;
    effectue_par_email: string;
}
export interface StockMovementTimeline {
    id: number;
    timestamp: Date;
    type_mouvement: StockMovementType;
    description: string;
    quantite_mouvement: number;
    quantite_resultante: number;
    icone: string;
    couleur: string;
}
export declare const STOCK_MOVEMENT_TYPE_LABELS: Record<StockMovementType, string>;
export declare const STOCK_MOVEMENT_TYPE_COLORS: Record<StockMovementType, string>;
export declare const STOCK_MOVEMENT_TYPE_ICONS: Record<StockMovementType, string>;
//# sourceMappingURL=StockMovement.types.d.ts.map