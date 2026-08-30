export declare const GENRE_NAME_MAX_LENGTH = 50;
export declare const GENRE_NAME_MIN_LENGTH = 1;
export declare const COMMON_GENRES: {
    readonly HOMME: "Homme";
    readonly FEMME: "Femme";
    readonly AUTRE: "Autre";
    readonly NON_SPECIFIE: "Non spécifié";
};
export declare const GRADE_NAME_MAX_LENGTH = 50;
export declare const GRADE_NAME_MIN_LENGTH = 1;
export declare const GRADE_COLOR_MAX_LENGTH = 20;
export declare const GRADE_MIN_ORDER = 0;
export declare const GRADE_MAX_ORDER = 100;
export declare const BJJ_GRADES: {
    readonly WHITE: {
        readonly nom: "Blanche";
        readonly ordre: 0;
        readonly couleur: "#FFFFFF";
    };
    readonly BLUE: {
        readonly nom: "Bleue";
        readonly ordre: 1;
        readonly couleur: "#0000FF";
    };
    readonly PURPLE: {
        readonly nom: "Violette";
        readonly ordre: 2;
        readonly couleur: "#800080";
    };
    readonly BROWN: {
        readonly nom: "Marron";
        readonly ordre: 3;
        readonly couleur: "#8B4513";
    };
    readonly BLACK: {
        readonly nom: "Noire";
        readonly ordre: 4;
        readonly couleur: "#000000";
    };
    readonly RED_BLACK: {
        readonly nom: "Rouge et Noire";
        readonly ordre: 5;
        readonly couleur: "#FF0000";
    };
    readonly RED: {
        readonly nom: "Rouge";
        readonly ordre: 6;
        readonly couleur: "#FF0000";
    };
};
export declare const STATUS_NAME_MAX_LENGTH = 50;
export declare const STATUS_NAME_MIN_LENGTH = 1;
export declare const STATUS_DESCRIPTION_MAX_LENGTH = 65535;
export declare const COMMON_STATUS: {
    readonly ACTIF: "Actif";
    readonly INACTIF: "Inactif";
    readonly SUSPENDU: "Suspendu";
    readonly EN_ATTENTE: "En attente";
    readonly ARCHIVE: "Archivé";
};
export declare const LOOKUP_DEFAULT_PAGE_SIZE = 20;
export declare const LOOKUP_MAX_PAGE_SIZE = 100;
export declare const LOOKUP_MIN_PAGE_SIZE = 1;
export declare const LOOKUP_DEFAULT_PAGE = 1;
export declare const LOOKUP_VALID_SORT_ORDERS: readonly ["asc", "desc"];
export declare const LOOKUP_DEFAULT_SORT_ORDER = "asc";
//# sourceMappingURL=lookup.constants.d.ts.map