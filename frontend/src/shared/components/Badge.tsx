/**
 * Badge Component
 *
 * Composant de badge réutilisable avec variants, tailles et options configurables.
 * Utilise les Design Tokens pour garantir la cohérence visuelle.
 *
 * @example
 * ```tsx
 * <Badge variant="success">
 *   Validé
 * </Badge>
 *
 * <Badge variant="warning" dot>
 *   En attente
 * </Badge>
 *
 * <Badge variant="info" icon={<CheckIcon />}>
 *   Complété
 * </Badge>
 * ```
 */

import { ReactNode, HTMLAttributes } from "react";
import { cn, BADGE } from "../styles/designTokens";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface BadgeProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "className"
> {
  /**
   * Contenu du badge (optionnel pour les sous-composants)
   */
  children?: ReactNode;

  /**
   * Variant de couleur
   * - success: Vert (validé, actif, en stock)
   * - warning: Jaune (en attente, stock bas)
   * - danger: Rouge (erreur, annulé, rupture)
   * - info: Bleu (information, en cours)
   * - neutral: Gris (défaut, autre)
   * - purple: Violet (actions spéciales)
   * - orange: Orange (urgent, attention)
   * @default "neutral"
   */
  variant?:
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral"
    | "purple"
    | "orange";

  /**
   * Taille du badge
   * - sm: Small (px-2 py-0.5 text-xs)
   * - md: Medium (px-2.5 py-0.5 text-xs) - défaut
   * - lg: Large (px-3 py-1 text-sm)
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Afficher un dot indicator (●)
   * @default false
   */
  dot?: boolean;

  /**
   * Icône à afficher avant le texte
   */
  icon?: ReactNode;

  /**
   * Rendre le badge supprimable avec un bouton X
   * @default false
   */
  removable?: boolean;

  /**
   * Callback appelé quand on clique sur le X (si removable)
   */
  onRemove?: () => void;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  icon,
  removable = false,
  onRemove,
  className = "",
  ...props
}: BadgeProps) {
  // Déterminer la couleur du dot selon le variant
  const dotColorClass = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    neutral: "bg-gray-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  }[variant];

  return (
    <span
      className={cn(
        BADGE.base,
        BADGE.variant[variant],
        BADGE.size[size],
        className,
      )}
      {...props}
    >
      {/* Dot indicator */}
      {dot && (
        <span className={cn(BADGE.dot, dotColorClass)} aria-hidden="true" />
      )}

      {/* Icône */}
      {icon && !dot && (
        <span className={BADGE.icon} aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Contenu textuel */}
      <span>{children}</span>

      {/* Bouton de suppression */}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 -mr-1 inline-flex items-center justify-center rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current transition-colors"
          aria-label="Supprimer"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

// ─── SOUS-COMPOSANTS SPÉCIALISÉS ────────────────────────────────────────────

/**
 * Badge de statut avec dot indicator
 */
export interface StatusBadgeProps extends Omit<BadgeProps, "dot" | "children"> {
  status:
    | "active"
    | "inactive"
    | "pending"
    | "error"
    | "actif"
    | "inactif"
    | "suspendu"
    | "en_attente"
    | "archive";
  children?: ReactNode;
}

export function StatusBadge({ status, children, ...props }: StatusBadgeProps) {
  const statusConfig = {
    active: { variant: "success" as const, label: children || "Actif" },
    inactive: { variant: "neutral" as const, label: children || "Inactif" },
    pending: { variant: "warning" as const, label: children || "En attente" },
    error: { variant: "danger" as const, label: children || "Erreur" },
    // Statuts français pour les utilisateurs
    actif: { variant: "success" as const, label: children || "Actif" },
    inactif: { variant: "neutral" as const, label: children || "Inactif" },
    suspendu: { variant: "orange" as const, label: children || "Suspendu" },
    en_attente: {
      variant: "warning" as const,
      label: children || "En attente",
    },
    archive: { variant: "danger" as const, label: children || "Archivé" },
  }[status];

  return (
    <Badge variant={statusConfig.variant} dot {...props}>
      {statusConfig.label}
    </Badge>
  );
}

/**
 * Badge de stock avec couleurs appropriées
 */
export interface StockBadgeProps extends Omit<
  BadgeProps,
  "variant" | "dot" | "children"
> {
  /**
   * Quantité en stock
   */
  quantity: number;
  /**
   * Seuil bas (warning si quantity <= threshold)
   * @default 10
   */
  threshold?: number;
  children?: ReactNode;
}

export function StockBadge({
  quantity,
  threshold = 10,
  children,
  ...props
}: StockBadgeProps) {
  let variant: BadgeProps["variant"] = "success";
  let label = children || `${quantity} en stock`;

  if (quantity === 0) {
    variant = "danger";
    label = children || "Rupture de stock";
  } else if (quantity <= threshold) {
    variant = "orange";
    label = children || `Stock bas (${quantity})`;
  }

  return (
    <Badge variant={variant} dot {...props}>
      {label}
    </Badge>
  );
}

/**
 * Badge de rôle utilisateur
 */
export interface RoleBadgeProps extends Omit<
  BadgeProps,
  "variant" | "children"
> {
  role: "admin" | "professor" | "member" | "parent";
  children?: ReactNode;
}

export function RoleBadge({ role, children, ...props }: RoleBadgeProps) {
  const roleConfig = {
    admin: { variant: "danger" as const, label: children || "Admin" },
    professor: { variant: "purple" as const, label: children || "Professeur" },
    member: { variant: "success" as const, label: children || "Membre" },
    parent: { variant: "info" as const, label: children || "Parent" },
  }[role];

  return (
    <Badge variant={roleConfig.variant} {...props}>
      {roleConfig.label}
    </Badge>
  );
}

/**
 * Badge de statut de paiement
 * Supporte les statuts français du système de paiement
 */
export interface PaymentStatusBadgeProps extends Omit<
  BadgeProps,
  "variant" | "dot" | "children"
> {
  status:
    | "en_attente"
    | "paye"
    | "valide"
    | "partiel"
    | "echoue"
    | "rembourse"
    | "annule";
  children?: ReactNode;
}

export function PaymentStatusBadge({
  status,
  children,
  ...props
}: PaymentStatusBadgeProps) {
  const statusConfig = {
    en_attente: {
      variant: "warning" as const,
      label: children || "En attente",
    },
    paye: { variant: "success" as const, label: children || "Payé" },
    valide: { variant: "success" as const, label: children || "Validé" },
    partiel: { variant: "info" as const, label: children || "Partiel" },
    echoue: { variant: "danger" as const, label: children || "Échoué" },
    rembourse: { variant: "purple" as const, label: children || "Remboursé" },
    annule: { variant: "danger" as const, label: children || "Annulé" },
  }[status];

  return (
    <Badge variant={statusConfig.variant} {...props}>
      {statusConfig.label}
    </Badge>
  );
}

/**
 * Badge de statut de commande
 * Supporte les statuts anglais et français du système de commande boutique
 */
export interface OrderStatusBadgeProps extends Omit<
  BadgeProps,
  "variant" | "children"
> {
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "en_attente"
    | "en_cours"
    | "payee"
    | "expediee"
    | "prete"
    | "livree"
    | "annulee";
  children?: ReactNode;
}

export function OrderStatusBadge({
  status,
  children,
  ...props
}: OrderStatusBadgeProps) {
  const statusConfig = {
    // Statuts anglais (legacy)
    pending: { variant: "warning" as const, label: children || "En attente" },
    processing: {
      variant: "info" as const,
      label: children || "En préparation",
    },
    shipped: { variant: "purple" as const, label: children || "Expédiée" },
    delivered: { variant: "success" as const, label: children || "Livrée" },
    cancelled: { variant: "danger" as const, label: children || "Annulée" },
    // Statuts français (boutique)
    en_attente: {
      variant: "warning" as const,
      label: children || "En attente",
    },
    en_cours: { variant: "info" as const, label: children || "En cours" },
    payee: { variant: "info" as const, label: children || "Payée" },
    expediee: { variant: "purple" as const, label: children || "Expédiée" },
    prete: { variant: "purple" as const, label: children || "Prête" },
    livree: { variant: "success" as const, label: children || "Livrée" },
    annulee: { variant: "danger" as const, label: children || "Annulée" },
  }[status];

  return (
    <Badge variant={statusConfig.variant} {...props}>
      {statusConfig.label}
    </Badge>
  );
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

Badge.Status = StatusBadge;
Badge.Stock = StockBadge;
Badge.Role = RoleBadge;
Badge.PaymentStatus = PaymentStatusBadge;
Badge.OrderStatus = OrderStatusBadge;

export default Badge;
