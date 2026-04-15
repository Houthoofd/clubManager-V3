/**
 * Badge Family - Barrel Export
 *
 * Exporte tous les composants et types de la famille Badge
 */

// Badge principal avec ses variantes spécialisées
export {
  Badge,
  StockBadge,
  RoleBadge,
  PaymentStatusBadge,
  OrderStatusBadge,
} from './Badge';
export type {
  BadgeProps,
  StockBadgeProps,
  RoleBadgeProps,
  PaymentStatusBadgeProps,
  OrderStatusBadgeProps,
} from './Badge';

// StatusBadge (composant séparé)
export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps } from './StatusBadge';
