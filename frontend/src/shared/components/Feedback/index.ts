/**
 * Feedback Family - Barrel Export
 *
 * Exporte tous les composants et types de la famille Feedback
 */

export { AlertBanner } from "./AlertBanner";
export type { AlertBannerProps } from "./AlertBanner";

// Backward compatibility alias (ErrorBanner → AlertBanner)
export { AlertBanner as ErrorBanner } from "./AlertBanner";
export type { AlertBannerProps as ErrorBannerProps } from "./AlertBanner";
