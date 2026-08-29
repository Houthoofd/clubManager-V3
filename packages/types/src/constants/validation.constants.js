export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const HASHED_PASSWORD_REGEX = /^(\$2[aby]\$[0-9]{2}\$.{53}|\$argon2(id|i|d)\$)/;
export const PHONE_REGEX = /^(\+|00)?[0-9\s\-().]{8,20}$/;
export const DATE_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
export const VALIDATION_CONSTANTS = {
    USER: {
        USERNAME: {
            MIN_LENGTH: 3,
            MAX_LENGTH: 100,
        },
        PASSWORD: {
            MIN_LENGTH: 8,
            MAX_LENGTH: 255,
        },
        EMAIL: {
            MIN_LENGTH: 5,
            MAX_LENGTH: 255,
        },
        NAME: {
            MIN_LENGTH: 2,
            MAX_LENGTH: 100,
        },
        AGE: {
            MIN: 5,
            MAX: 120,
        },
    },
    TOKEN: {
        HASH_ALGORITHM: "sha256",
        EXPIRY: {
            EMAIL_VALIDATION: 24 * 60 * 60 * 1000,
            PASSWORD_RESET: 1 * 60 * 60 * 1000,
        },
    },
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100,
    },
    RGPD: {
        DELETION_REASON_MIN_LENGTH: 10,
        DELETION_REASON_MAX_LENGTH: 500,
    },
};
export const VALIDATION_ERRORS = {
    REQUIRED: "Ce champ est requis",
    INVALID_EMAIL: "Format email invalide",
    INVALID_PASSWORD: "Le mot de passe doit contenir au moins 8 caractères",
    INVALID_PHONE: "Format de téléphone invalide",
    INVALID_DATE: "Format de date invalide (YYYY-MM-DD)",
    INVALID_AGE: "Âge invalide (entre 5 et 120 ans)",
};
//# sourceMappingURL=validation.constants.js.map