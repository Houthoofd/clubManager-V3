// @ts-nocheck
import { z } from "zod";
import { paginationSchema } from "../common/common.validators.js";

export const EventVisibilitySchema = z.enum(["PUBLIC", "MEMBERS_ONLY", "SPECIFIC_GRADES"]);
export const EventRegistrationStatusSchema = z.enum(["CONFIRMED", "WAITLIST", "CANCELLED"]);
export const EventPaymentStatusSchema = z.enum(["PENDING", "PAID", "REFUNDED"]);

export const baseEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  location: z.string().max(255).optional(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  capacity: z.number().int().positive().optional().nullable(),
  price: z.number().min(0).optional().default(0),
  visibility: EventVisibilitySchema.optional().default("MEMBERS_ONLY"),
  min_grade_id: z.number().int().positive().optional().nullable(),
});

export const createEventSchema = baseEventSchema.refine(data => data.start_date < data.end_date, {
  message: "End date must be after start date",
  path: ["end_date"]
});

export const updateEventSchema = baseEventSchema.partial().refine(data => {
  if (data.start_date && data.end_date) {
    return data.start_date < data.end_date;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["end_date"]
});

export const registerToEventSchema = z.object({
  event_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
});

export const searchEventSchema = paginationSchema.extend({
  title: z.string().optional(),
  visibility: EventVisibilitySchema.optional(),
  from_date: z.coerce.date().optional(),
  to_date: z.coerce.date().optional(),
});
