import { z } from "zod";
import { GROUP_NAME_MAX_LENGTH, GROUP_NAME_MIN_LENGTH, GROUP_DESCRIPTION_MAX_LENGTH, GROUPS_DEFAULT_PAGE_SIZE, GROUPS_MAX_PAGE_SIZE, GROUPS_MIN_PAGE_SIZE, GROUPS_DEFAULT_PAGE, GROUPS_DEFAULT_SORT_ORDER, } from "../../constants/groups.constants.js";
import { idSchema, idStringSchema, idParamSchema, sortOrderSchema, } from "../common/common.validators.js";
export const groupBaseSchema = z.object({
    id: idSchema,
    nom: z
        .string({
        required_error: "Le nom du groupe est requis",
        invalid_type_error: "Le nom doit être une chaîne de caractères",
    })
        .min(GROUP_NAME_MIN_LENGTH, `Le nom doit contenir au moins ${GROUP_NAME_MIN_LENGTH} caractère`)
        .max(GROUP_NAME_MAX_LENGTH, `Le nom ne peut pas dépasser ${GROUP_NAME_MAX_LENGTH} caractères`)
        .trim()
        .refine((val) => val.length > 0, {
        message: "Le nom ne peut pas être vide après suppression des espaces",
    }),
    description: z
        .string({
        invalid_type_error: "La description doit être une chaîne de caractères",
    })
        .max(GROUP_DESCRIPTION_MAX_LENGTH, `La description ne peut pas dépasser ${GROUP_DESCRIPTION_MAX_LENGTH} caractères`)
        .trim()
        .nullable()
        .optional(),
    created_at: z.coerce.date({
        required_error: "Le timestamp est requis",
        invalid_type_error: "Format de timestamp invalide",
    }),
    updated_at: z.coerce
        .date({
        invalid_type_error: "Format de timestamp invalide",
    })
        .nullable()
        .optional(),
});
export const createGroupSchema = z.object({
    nom: z
        .string({
        required_error: "Le nom du groupe est requis",
        invalid_type_error: "Le nom doit être une chaîne de caractères",
    })
        .min(GROUP_NAME_MIN_LENGTH, `Le nom doit contenir au moins ${GROUP_NAME_MIN_LENGTH} caractère`)
        .max(GROUP_NAME_MAX_LENGTH, `Le nom ne peut pas dépasser ${GROUP_NAME_MAX_LENGTH} caractères`)
        .trim()
        .refine((val) => val.length > 0, {
        message: "Le nom ne peut pas être vide après suppression des espaces",
    }),
    description: z
        .string({
        invalid_type_error: "La description doit être une chaîne de caractères",
    })
        .max(GROUP_DESCRIPTION_MAX_LENGTH, `La description ne peut pas dépasser ${GROUP_DESCRIPTION_MAX_LENGTH} caractères`)
        .trim()
        .nullable()
        .optional(),
});
export const updateGroupSchema = z
    .object({
    nom: z
        .string({
        invalid_type_error: "Le nom doit être une chaîne de caractères",
    })
        .min(GROUP_NAME_MIN_LENGTH, `Le nom doit contenir au moins ${GROUP_NAME_MIN_LENGTH} caractère`)
        .max(GROUP_NAME_MAX_LENGTH, `Le nom ne peut pas dépasser ${GROUP_NAME_MAX_LENGTH} caractères`)
        .trim()
        .refine((val) => val.length > 0, {
        message: "Le nom ne peut pas être vide après suppression des espaces",
    })
        .optional(),
    description: z
        .string({
        invalid_type_error: "La description doit être une chaîne de caractères",
    })
        .max(GROUP_DESCRIPTION_MAX_LENGTH, `La description ne peut pas dépasser ${GROUP_DESCRIPTION_MAX_LENGTH} caractères`)
        .trim()
        .nullable()
        .optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour",
});
const groupSortByValues = ["nom", "created_at", "updated_at"];
export const listGroupsSchema = z.object({
    page: z
        .number()
        .int()
        .positive({
        message: "Le numéro de page doit être un nombre positif",
    })
        .optional()
        .default(GROUPS_DEFAULT_PAGE),
    limit: z
        .number()
        .int()
        .min(GROUPS_MIN_PAGE_SIZE, `La limite minimale est de ${GROUPS_MIN_PAGE_SIZE}`)
        .max(GROUPS_MAX_PAGE_SIZE, `La limite maximale est de ${GROUPS_MAX_PAGE_SIZE}`)
        .optional()
        .default(GROUPS_DEFAULT_PAGE_SIZE),
    search: z
        .string()
        .min(1, "Le terme de recherche ne peut pas être vide")
        .max(100, "Le terme de recherche est trop long (max 100 caractères)")
        .trim()
        .optional(),
    sort_by: z
        .enum(groupSortByValues, {
        errorMap: () => ({
            message: "Le champ de tri doit être 'nom', 'created_at' ou 'updated_at'",
        }),
    })
        .optional()
        .default("nom"),
    sort_order: sortOrderSchema.optional().default(GROUPS_DEFAULT_SORT_ORDER),
});
export const groupIdSchema = idSchema;
export const groupIdStringSchema = idStringSchema;
export const groupIdParamSchema = idParamSchema;
export const groupResponseSchema = groupBaseSchema;
export const groupsListResponseSchema = z.object({
    data: z.array(groupBaseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const groupStatsSchema = z.object({
    total_groups: z.number().int().nonnegative({
        message: "Le nombre total de groupes doit être positif ou nul",
    }),
    total_users_assigned: z.number().int().nonnegative({
        message: "Le nombre total d'utilisateurs assignés doit être positif ou nul",
    }),
    groups_with_users: z.number().int().nonnegative({
        message: "Le nombre de groupes avec utilisateurs doit être positif ou nul",
    }),
    groups_without_users: z.number().int().nonnegative({
        message: "Le nombre de groupes sans utilisateurs doit être positif ou nul",
    }),
});
//# sourceMappingURL=group.validators.js.map