/**
 * index.ts - Exports pour les configurations de tables des paiements
 */

export { paymentsColumns } from "./paymentsTableConfig";
export type { PaymentRow } from "./paymentsTableConfig";

export { createSchedulesColumns } from "./schedulesTableConfig";
export type { ScheduleRow, SchedulesColumnsOptions } from "./schedulesTableConfig";
