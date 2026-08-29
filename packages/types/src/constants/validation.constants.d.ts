export declare const EMAIL_REGEX: RegExp;
export declare const HASHED_PASSWORD_REGEX: RegExp;
export declare const PHONE_REGEX: RegExp;
export declare const DATE_ISO_REGEX: RegExp;
export declare const NAME_REGEX: RegExp;
export declare const USERNAME_REGEX: RegExp;
export declare const VALIDATION_CONSTANTS: {
    readonly USER: {
        readonly USERNAME: {
            readonly MIN_LENGTH: 3;
            readonly MAX_LENGTH: 100;
        };
        readonly PASSWORD: {
            readonly MIN_LENGTH: 8;
            readonly MAX_LENGTH: 255;
        };
        readonly EMAIL: {
            readonly MIN_LENGTH: 5;
            readonly MAX_LENGTH: 255;
        };
        readonly NAME: {
            readonly MIN_LENGTH: 2;
            readonly MAX_LENGTH: 100;
        };
        readonly AGE: {
            readonly MIN: 5;
            readonly MAX: 120;
        };
    };
    readonly TOKEN: {
        readonly HASH_ALGORITHM: "sha256";
        readonly EXPIRY: {
            readonly EMAIL_VALIDATION: number;
            readonly PASSWORD_RESET: number;
        };
    };
    readonly PAGINATION: {
        readonly DEFAULT_PAGE: 1;
        readonly DEFAULT_LIMIT: 20;
        readonly MAX_LIMIT: 100;
    };
    readonly RGPD: {
        readonly DELETION_REASON_MIN_LENGTH: 10;
        readonly DELETION_REASON_MAX_LENGTH: 500;
    };
};
export declare const VALIDATION_ERRORS: {
    readonly REQUIRED: "Ce champ est requis";
    readonly INVALID_EMAIL: "Format email invalide";
    readonly INVALID_PASSWORD: "Le mot de passe doit contenir au moins 8 caractères";
    readonly INVALID_PHONE: "Format de téléphone invalide";
    readonly INVALID_DATE: "Format de date invalide (YYYY-MM-DD)";
    readonly INVALID_AGE: "Âge invalide (entre 5 et 120 ans)";
};
//# sourceMappingURL=validation.constants.d.ts.map