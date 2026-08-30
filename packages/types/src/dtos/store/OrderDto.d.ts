import { z } from 'zod';
export declare const CreateOrderDto: z.ZodObject<{
    unique_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    numero_commande: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    utilisateur_id: z.ZodNumber;
    total: z.ZodOptional<z.ZodDefault<z.ZodEffects<z.ZodNumber, number, number>>>;
    date_commande: z.ZodOptional<z.ZodDefault<z.ZodDate>>;
    statut: z.ZodOptional<z.ZodDefault<z.ZodEnum<[string, ...string[]]>>>;
    ip_address: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodString]>>>>;
    user_agent: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    utilisateur_id: number;
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
    total?: number | undefined;
    date_commande?: Date | undefined;
    statut?: string | undefined;
    ip_address?: string | null | undefined;
    user_agent?: string | null | undefined;
}, {
    utilisateur_id: number;
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
    total?: number | undefined;
    date_commande?: Date | undefined;
    statut?: string | undefined;
    ip_address?: string | null | undefined;
    user_agent?: string | null | undefined;
}>;
export type CreateOrderDto = z.infer<typeof CreateOrderDto>;
export declare const UpdateOrderDto: z.ZodObject<{
    unique_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    numero_commande: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    total: z.ZodOptional<z.ZodDefault<z.ZodEffects<z.ZodNumber, number, number>>>;
    statut: z.ZodOptional<z.ZodDefault<z.ZodEnum<[string, ...string[]]>>>;
}, "strip", z.ZodTypeAny, {
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
    total?: number | undefined;
    statut?: string | undefined;
}, {
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
    total?: number | undefined;
    statut?: string | undefined;
}>;
export type UpdateOrderDto = z.infer<typeof UpdateOrderDto>;
export declare const OrderResponseDto: z.ZodObject<{
    id: z.ZodNumber;
    unique_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    numero_commande: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    utilisateur_id: z.ZodNumber;
    total: z.ZodDefault<z.ZodEffects<z.ZodNumber, number, number>>;
    date_commande: z.ZodDefault<z.ZodDate>;
    statut: z.ZodDefault<z.ZodEnum<[string, ...string[]]>>;
    ip_address: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodString]>>>;
    user_agent: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodDate;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: Date;
    utilisateur_id: number;
    total: number;
    date_commande: Date;
    statut: string;
    updated_at?: Date | null | undefined;
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
    ip_address?: string | null | undefined;
    user_agent?: string | null | undefined;
}, {
    id: number;
    created_at: Date;
    utilisateur_id: number;
    updated_at?: Date | null | undefined;
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
    total?: number | undefined;
    date_commande?: Date | undefined;
    statut?: string | undefined;
    ip_address?: string | null | undefined;
    user_agent?: string | null | undefined;
}>;
export type OrderResponseDto = z.infer<typeof OrderResponseDto>;
export declare const OrderListItemDto: z.ZodObject<Pick<{
    id: z.ZodNumber;
    unique_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    numero_commande: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    utilisateur_id: z.ZodNumber;
    total: z.ZodDefault<z.ZodEffects<z.ZodNumber, number, number>>;
    date_commande: z.ZodDefault<z.ZodDate>;
    statut: z.ZodDefault<z.ZodEnum<[string, ...string[]]>>;
    ip_address: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodString]>>>;
    user_agent: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodDate;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "id" | "unique_id" | "numero_commande" | "utilisateur_id" | "total" | "date_commande" | "statut">, "strip", z.ZodTypeAny, {
    id: number;
    utilisateur_id: number;
    total: number;
    date_commande: Date;
    statut: string;
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
}, {
    id: number;
    utilisateur_id: number;
    unique_id?: string | null | undefined;
    numero_commande?: string | null | undefined;
    total?: number | undefined;
    date_commande?: Date | undefined;
    statut?: string | undefined;
}>;
export type OrderListItemDto = z.infer<typeof OrderListItemDto>;
export declare const OrderListResponseDto: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<Pick<{
        id: z.ZodNumber;
        unique_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        numero_commande: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        utilisateur_id: z.ZodNumber;
        total: z.ZodDefault<z.ZodEffects<z.ZodNumber, number, number>>;
        date_commande: z.ZodDefault<z.ZodDate>;
        statut: z.ZodDefault<z.ZodEnum<[string, ...string[]]>>;
        ip_address: z.ZodOptional<z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodString]>>>;
        user_agent: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        created_at: z.ZodDate;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    }, "id" | "unique_id" | "numero_commande" | "utilisateur_id" | "total" | "date_commande" | "statut">, "strip", z.ZodTypeAny, {
        id: number;
        utilisateur_id: number;
        total: number;
        date_commande: Date;
        statut: string;
        unique_id?: string | null | undefined;
        numero_commande?: string | null | undefined;
    }, {
        id: number;
        utilisateur_id: number;
        unique_id?: string | null | undefined;
        numero_commande?: string | null | undefined;
        total?: number | undefined;
        date_commande?: Date | undefined;
        statut?: string | undefined;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    total: number;
    items: {
        id: number;
        utilisateur_id: number;
        total: number;
        date_commande: Date;
        statut: string;
        unique_id?: string | null | undefined;
        numero_commande?: string | null | undefined;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}, {
    total: number;
    items: {
        id: number;
        utilisateur_id: number;
        unique_id?: string | null | undefined;
        numero_commande?: string | null | undefined;
        total?: number | undefined;
        date_commande?: Date | undefined;
        statut?: string | undefined;
    }[];
    page: number;
    limit: number;
    hasMore: boolean;
}>;
export type OrderListResponseDto = z.infer<typeof OrderListResponseDto>;
//# sourceMappingURL=OrderDto.d.ts.map