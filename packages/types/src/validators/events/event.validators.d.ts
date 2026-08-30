import { z } from "zod";
export declare const EventVisibilitySchema: z.ZodEnum<["PUBLIC", "MEMBERS_ONLY", "SPECIFIC_GRADES"]>;
export declare const EventRegistrationStatusSchema: z.ZodEnum<["CONFIRMED", "WAITLIST", "CANCELLED"]>;
export declare const EventPaymentStatusSchema: z.ZodEnum<["PENDING", "PAID", "REFUNDED"]>;
export declare const baseEventSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    start_date: z.ZodDate;
    end_date: z.ZodDate;
    capacity: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    price: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    visibility: z.ZodDefault<z.ZodOptional<z.ZodEnum<["PUBLIC", "MEMBERS_ONLY", "SPECIFIC_GRADES"]>>>;
    min_grade_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    start_date: Date;
    end_date: Date;
    price: number;
    visibility: "PUBLIC" | "MEMBERS_ONLY" | "SPECIFIC_GRADES";
    description?: string | undefined;
    min_grade_id?: number | null | undefined;
    capacity?: number | null | undefined;
    location?: string | undefined;
}, {
    title: string;
    start_date: Date;
    end_date: Date;
    description?: string | undefined;
    min_grade_id?: number | null | undefined;
    capacity?: number | null | undefined;
    location?: string | undefined;
    price?: number | undefined;
    visibility?: "PUBLIC" | "MEMBERS_ONLY" | "SPECIFIC_GRADES" | undefined;
}>;
export declare const createEventSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    start_date: z.ZodDate;
    end_date: z.ZodDate;
    capacity: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    price: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    visibility: z.ZodDefault<z.ZodOptional<z.ZodEnum<["PUBLIC", "MEMBERS_ONLY", "SPECIFIC_GRADES"]>>>;
    min_grade_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    start_date: Date;
    end_date: Date;
    price: number;
    visibility: "PUBLIC" | "MEMBERS_ONLY" | "SPECIFIC_GRADES";
    description?: string | undefined;
    min_grade_id?: number | null | undefined;
    capacity?: number | null | undefined;
    location?: string | undefined;
}, {
    title: string;
    start_date: Date;
    end_date: Date;
    description?: string | undefined;
    min_grade_id?: number | null | undefined;
    capacity?: number | null | undefined;
    location?: string | undefined;
    price?: number | undefined;
    visibility?: "PUBLIC" | "MEMBERS_ONLY" | "SPECIFIC_GRADES" | undefined;
}>, {
    title: string;
    start_date: Date;
    end_date: Date;
    price: number;
    visibility: "PUBLIC" | "MEMBERS_ONLY" | "SPECIFIC_GRADES";
    description?: string | undefined;
    min_grade_id?: number | null | undefined;
    capacity?: number | null | undefined;
    location?: string | undefined;
}, {
    title: string;
    start_date: Date;
    end_date: Date;
    description?: string | undefined;
    min_grade_id?: number | null | undefined;
    capacity?: number | null | undefined;
    location?: string | undefined;
    price?: number | undefined;
    visibility?: "PUBLIC" | "MEMBERS_ONLY" | "SPECIFIC_GRADES" | undefined;
}>;
export declare const updateEventSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    location: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    start_date: z.ZodOptional<z.ZodDate>;
    end_date: z.ZodOptional<z.ZodDate>;
    capacity: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    price: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodNumber>>>;
    visibility: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodEnum<["PUBLIC", "MEMBERS_ONLY", "SPECIFIC_GRADES"]>>>>;
    min_grade_id: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    title?: string | undefined;
    min_grade_id?: number | null | undefined;
    capacity?: number | null | undefined;
    location?: string | undefined;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    price?: number | undefined;
    visibility?: "PUBLIC" | "MEMBERS_ONLY" | "SPECIFIC_GRADES" | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
    min_grade_id?: number | null | undefined;
    capacity?: number | null | undefined;
    location?: string | undefined;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    price?: number | undefined;
    visibility?: "PUBLIC" | "MEMBERS_ONLY" | "SPECIFIC_GRADES" | undefined;
}>, {
    description?: string | undefined;
    title?: string | undefined;
    min_grade_id?: number | null | undefined;
    capacity?: number | null | undefined;
    location?: string | undefined;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    price?: number | undefined;
    visibility?: "PUBLIC" | "MEMBERS_ONLY" | "SPECIFIC_GRADES" | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
    min_grade_id?: number | null | undefined;
    capacity?: number | null | undefined;
    location?: string | undefined;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    price?: number | undefined;
    visibility?: "PUBLIC" | "MEMBERS_ONLY" | "SPECIFIC_GRADES" | undefined;
}>;
export declare const registerToEventSchema: z.ZodObject<{
    event_id: z.ZodNumber;
    user_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    user_id: number;
    event_id: number;
}, {
    user_id: number;
    event_id: number;
}>;
export declare const searchEventSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
} & {
    title: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodEnum<["PUBLIC", "MEMBERS_ONLY", "SPECIFIC_GRADES"]>>;
    from_date: z.ZodOptional<z.ZodDate>;
    to_date: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    title?: string | undefined;
    visibility?: "PUBLIC" | "MEMBERS_ONLY" | "SPECIFIC_GRADES" | undefined;
    from_date?: Date | undefined;
    to_date?: Date | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    title?: string | undefined;
    visibility?: "PUBLIC" | "MEMBERS_ONLY" | "SPECIFIC_GRADES" | undefined;
    from_date?: Date | undefined;
    to_date?: Date | undefined;
}>;
//# sourceMappingURL=event.validators.d.ts.map