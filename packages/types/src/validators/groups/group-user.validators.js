import { z } from "zod";
import { MAX_USERS_PER_BULK_ASSIGNMENT, GROUPS_DEFAULT_PAGE_SIZE, GROUPS_MAX_PAGE_SIZE, GROUPS_MIN_PAGE_SIZE, GROUPS_DEFAULT_PAGE, GROUPS_DEFAULT_SORT_ORDER, } from "../../constants/groups.constants.js";
import { idSchema, sortOrderSchema, } from "../common/common.validators.js";
export const groupUserBaseSchema = z.object({
    groupe_id: idSchema,
    utilisateur_id: idSchema,
    created_at: z.coerce.date({
        required_error: "Le timestamp est requis",
        invalid_type_error: "Format de timestamp invalide",
    }),
});
export const assignUserToGroupSchema = z.object({
    utilisateur_id: z
        .number({
        required_error: "L'ID de l'utilisateur est requis",
        invalid_type_error: "L'ID de l'utilisateur doit être un nombre",
    })
        .int({
        message: "L'ID de l'utilisateur doit être un entier",
    })
        .positive({
        message: "L'ID de l'utilisateur doit être un nombre positif",
    }),
    groupe_id: z
        .number({
        required_error: "L'ID du groupe est requis",
        invalid_type_error: "L'ID du groupe doit être un nombre",
    })
        .int({
        message: "L'ID du groupe doit être un entier",
    })
        .positive({
        message: "L'ID du groupe doit être un nombre positif",
    }),
});
export const unassignUserFromGroupSchema = z.object({
    utilisateur_id: z
        .number({
        required_error: "L'ID de l'utilisateur est requis",
        invalid_type_error: "L'ID de l'utilisateur doit être un nombre",
    })
        .int({
        message: "L'ID de l'utilisateur doit être un entier",
    })
        .positive({
        message: "L'ID de l'utilisateur doit être un nombre positif",
    }),
    groupe_id: z
        .number({
        required_error: "L'ID du groupe est requis",
        invalid_type_error: "L'ID du groupe doit être un nombre",
    })
        .int({
        message: "L'ID du groupe doit être un entier",
    })
        .positive({
        message: "L'ID du groupe doit être un nombre positif",
    }),
});
export const bulkAssignUsersSchema = z.object({
    groupe_id: z
        .number({
        required_error: "L'ID du groupe est requis",
        invalid_type_error: "L'ID du groupe doit être un nombre",
    })
        .int({
        message: "L'ID du groupe doit être un entier",
    })
        .positive({
        message: "L'ID du groupe doit être un nombre positif",
    }),
    utilisateur_ids: z
        .array(z
        .number({
        invalid_type_error: "Chaque ID d'utilisateur doit être un nombre",
    })
        .int({
        message: "Chaque ID d'utilisateur doit être un entier",
    })
        .positive({
        message: "Chaque ID d'utilisateur doit être un nombre positif",
    }), {
        required_error: "La liste des IDs d'utilisateurs est requise",
        invalid_type_error: "Les IDs d'utilisateurs doivent être dans un tableau",
    })
        .min(1, "Au moins un ID d'utilisateur est requis")
        .max(MAX_USERS_PER_BULK_ASSIGNMENT, `Maximum ${MAX_USERS_PER_BULK_ASSIGNMENT} utilisateurs peuvent être assignés en une fois`),
});
export const bulkUnassignUsersSchema = z.object({
    groupe_id: z
        .number({
        required_error: "L'ID du groupe est requis",
        invalid_type_error: "L'ID du groupe doit être un nombre",
    })
        .int({
        message: "L'ID du groupe doit être un entier",
    })
        .positive({
        message: "L'ID du groupe doit être un nombre positif",
    }),
    utilisateur_ids: z
        .array(z
        .number({
        invalid_type_error: "Chaque ID d'utilisateur doit être un nombre",
    })
        .int({
        message: "Chaque ID d'utilisateur doit être un entier",
    })
        .positive({
        message: "Chaque ID d'utilisateur doit être un nombre positif",
    }), {
        required_error: "La liste des IDs d'utilisateurs est requise",
        invalid_type_error: "Les IDs d'utilisateurs doivent être dans un tableau",
    })
        .min(1, "Au moins un ID d'utilisateur est requis")
        .max(MAX_USERS_PER_BULK_ASSIGNMENT, `Maximum ${MAX_USERS_PER_BULK_ASSIGNMENT} utilisateurs peuvent être désassignés en une fois`),
});
const groupUserSortByValues = ["created_at", "utilisateur_id"];
export const listGroupUsersSchema = z.object({
    groupe_id: idSchema,
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
    sort_by: z
        .enum(groupUserSortByValues, {
        errorMap: () => ({
            message: "Le champ de tri doit être 'created_at' ou 'utilisateur_id'",
        }),
    })
        .optional()
        .default("created_at"),
    sort_order: sortOrderSchema.optional().default(GROUPS_DEFAULT_SORT_ORDER),
});
const userGroupSortByValues = ["created_at", "groupe_id"];
export const listUserGroupsSchema = z.object({
    utilisateur_id: idSchema,
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
    sort_by: z
        .enum(userGroupSortByValues, {
        errorMap: () => ({
            message: "Le champ de tri doit être 'created_at' ou 'groupe_id'",
        }),
    })
        .optional()
        .default("created_at"),
    sort_order: sortOrderSchema.optional().default(GROUPS_DEFAULT_SORT_ORDER),
});
export const groupUserResponseSchema = groupUserBaseSchema;
export const groupUsersListResponseSchema = z.object({
    data: z.array(groupUserBaseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const userGroupsListResponseSchema = z.object({
    data: z.array(groupUserBaseSchema),
    pagination: z.object({
        page: z.number().int().positive(),
        page_size: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
    }),
});
export const bulkOperationResponseSchema = z.object({
    success: z.boolean(),
    assigned_count: z.number().int().nonnegative().optional(),
    unassigned_count: z.number().int().nonnegative().optional(),
    errors: z.array(z.string()).optional(),
});
//# sourceMappingURL=group-user.validators.js.map