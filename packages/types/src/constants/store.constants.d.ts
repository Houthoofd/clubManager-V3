export declare const CATEGORY_CONSTRAINTS: {
    readonly NOM_MIN_LENGTH: 1;
    readonly NOM_MAX_LENGTH: 100;
    readonly DESCRIPTION_MAX_LENGTH: 65535;
};
export declare const SIZE_CONSTRAINTS: {
    readonly NOM_MIN_LENGTH: 1;
    readonly NOM_MAX_LENGTH: 10;
};
export declare const ARTICLE_CONSTRAINTS: {
    readonly NOM_MIN_LENGTH: 1;
    readonly NOM_MAX_LENGTH: 100;
    readonly DESCRIPTION_MAX_LENGTH: 65535;
    readonly IMAGE_URL_MAX_LENGTH: 255;
    readonly PRIX_MIN: 0;
    readonly PRIX_MAX: 99999999.99;
};
export declare const IMAGE_CONSTRAINTS: {
    readonly URL_MIN_LENGTH: 1;
    readonly URL_MAX_LENGTH: 255;
    readonly ORDRE_MIN: 0;
};
export declare const STOCK_CONSTRAINTS: {
    readonly QUANTITE_MIN: 0;
    readonly QUANTITE_MINIMUM_MIN: 0;
    readonly QUANTITE_MINIMUM_DEFAULT: 5;
};
export declare const ORDER_CONSTRAINTS: {
    readonly UNIQUE_ID_MAX_LENGTH: 255;
    readonly NUMERO_COMMANDE_MAX_LENGTH: 100;
    readonly TOTAL_MIN: 0;
    readonly TOTAL_MAX: 99999999.99;
    readonly IP_ADDRESS_MAX_LENGTH: 45;
    readonly USER_AGENT_MAX_LENGTH: 65535;
};
export declare const ORDER_ITEM_CONSTRAINTS: {
    readonly QUANTITE_MIN: 1;
    readonly PRIX_MIN: 0;
    readonly PRIX_MAX: 99999999.99;
};
export declare const STOCK_MOVEMENT_CONSTRAINTS: {
    readonly TAILLE_MIN_LENGTH: 1;
    readonly TAILLE_MAX_LENGTH: 10;
    readonly COMMANDE_ID_MAX_LENGTH: 255;
    readonly MOTIF_MAX_LENGTH: 65535;
};
export declare const STORE_DEFAULT_LIMIT = 50;
export declare const STORE_MAX_LIMIT = 100;
//# sourceMappingURL=store.constants.d.ts.map