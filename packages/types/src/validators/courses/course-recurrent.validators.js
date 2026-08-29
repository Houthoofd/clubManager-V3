import { z } from "zod";
import { booleanSchema, idSchema, idsArraySchema, paginationSchema, searchQuerySchema, sortOrderSchema, } from "../common/common.validators.js";
const typeCourseSchema = z
    .string()
    .min(1, "Le type de cours doit contenir au moins 1 caractère")
    .max(255, "Le type de cours ne peut pas dépasser 255 caractères");
const jourSemaineSchema = z
    .number()
    .int()
    .min(1, "Le jour de la semaine doit être entre 1 (Lundi) et 7 (Dimanche)")
    .max(7, "Le jour de la semaine doit être entre 1 (Lundi) et 7 (Dimanche)");
const timeSchema = z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "L'heure doit être au format HH:MM (00:00 à 23:59)");
export const createCourseRecurrentSchema = z
    .object({
    type_cours: typeCourseSchema,
    jour_semaine: jourSemaineSchema,
    heure_debut: timeSchema,
    heure_fin: timeSchema,
    active: z.boolean().default(true),
    professeur_ids: idsArraySchema.optional(),
})
    .refine((data) => {
    const [heureDebutH, heureDebutM] = data.heure_debut
        .split(":")
        .map(Number);
    const [heureFinH, heureFinM] = data.heure_fin.split(":").map(Number);
    const debutMinutes = heureDebutH * 60 + heureDebutM;
    const finMinutes = heureFinH * 60 + heureFinM;
    return finMinutes > debutMinutes;
}, {
    message: "L'heure de fin doit être supérieure à l'heure de début",
    path: ["heure_fin"],
});
export const updateCourseRecurrentSchema = z
    .object({
    id: idSchema,
    type_cours: typeCourseSchema.optional(),
    jour_semaine: jourSemaineSchema.optional(),
    heure_debut: timeSchema.optional(),
    heure_fin: timeSchema.optional(),
    active: z.boolean().optional(),
    professeur_ids: idsArraySchema.optional(),
})
    .refine((data) => {
    if (data.heure_debut && data.heure_fin) {
        const [heureDebutH, heureDebutM] = data.heure_debut
            .split(":")
            .map(Number);
        const [heureFinH, heureFinM] = data.heure_fin.split(":").map(Number);
        const debutMinutes = heureDebutH * 60 + heureDebutM;
        const finMinutes = heureFinH * 60 + heureFinM;
        return finMinutes > debutMinutes;
    }
    return true;
}, {
    message: "L'heure de fin doit être supérieure à l'heure de début",
    path: ["heure_fin"],
});
export const assignProfessorSchema = z.object({
    cours_recurrent_id: idSchema,
    professeur_id: idSchema,
});
export const unassignProfessorSchema = z.object({
    cours_recurrent_id: idSchema,
    professeur_id: idSchema,
});
export const searchCourseRecurrentSchema = z
    .object({
    type_cours: searchQuerySchema,
    jour_semaine: jourSemaineSchema.optional(),
    active: booleanSchema.optional(),
    professeur_id: idSchema.optional(),
    sort_by: z
        .enum(["type_cours", "jour_semaine", "heure_debut", "created_at"], {
        errorMap: () => ({
            message: "Le tri doit être par 'type_cours', 'jour_semaine', 'heure_debut' ou 'created_at'",
        }),
    })
        .default("jour_semaine")
        .optional(),
    sort_order: sortOrderSchema.default("asc").optional(),
})
    .merge(paginationSchema);
export const toggleCourseRecurrentSchema = z.object({
    id: idSchema,
    active: z.boolean(),
});
//# sourceMappingURL=course-recurrent.validators.js.map