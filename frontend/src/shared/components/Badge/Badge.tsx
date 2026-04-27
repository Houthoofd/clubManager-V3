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
import { useTranslation } from "react-i18next";
import { cn, BADGE } from "../../styles/designTokens";
import {
  useStatutPaiementByCode,
  useStatutEcheanceByCode,
} from "../../hooks/useReferences";

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
  const { i18n } = useTranslation("payments");
  const statutInfo = useStatutPaiementByCode(status);

  // Couleurs par défaut (fallback si la référence DB n'a pas de couleur)
  const fallbackConfig: Record<
    string,
    { variant: BadgeProps["variant"]; label: string }
  > = {
    en_attente: { variant: "warning", label: "En attente" },
    paye: { variant: "success", label: "Payé" },
    valide: { variant: "success", label: "Validé" },
    partiel: { variant: "info", label: "Partiel" },
    echoue: { variant: "danger", label: "Échoué" },
    rembourse: { variant: "purple", label: "Remboursé" },
    annule: { variant: "danger", label: "Annulé" },
  };

  const fallback = fallbackConfig[status] ?? {
    variant: "neutral" as const,
    label: status,
  };

  const label = children
    ? children
    : statutInfo
      ? i18n.language === "en" && statutInfo.nom_en
        ? statutInfo.nom_en
        : statutInfo.nom
      : fallback.label;

  const variant =
    (statutInfo?.couleur as BadgeProps["variant"]) ?? fallback.variant;

  return (
    <Badge variant={variant} {...props}>
      {label}
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

/**
 * Badge de méthode de paiement avec icône
 * Affiche la méthode de paiement avec une icône appropriée
 */

// Icônes pour PaymentMethod
const CreditCardIcon = () => (
  <svg
    className="h-3.5 w-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
    />
  </svg>
);

const BanknotesIcon = () => (
  <svg
    className="h-3.5 w-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
    />
  </svg>
);

const BuildingLibraryIcon = () => (
  <svg
    className="h-3.5 w-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
    />
  </svg>
);

const TagIcon = () => (
  <svg
    className="h-3.5 w-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 6h.008v.008H6V6Z"
    />
  </svg>
);

export interface PaymentMethodBadgeProps extends Omit<
  BadgeProps,
  "variant" | "icon" | "children"
> {
  method: string;
  children?: ReactNode;
}

export function PaymentMethodBadge({
  method,
  children,
  ...props
}: PaymentMethodBadgeProps) {
  const methodConfigMap: Record<
    string,
    {
      variant: BadgeProps["variant"];
      Icon: () => JSX.Element;
      label: string;
    }
  > = {
    stripe: {
      variant: "info",
      Icon: CreditCardIcon,
      label: children?.toString() || "Carte bancaire",
    },
    especes: {
      variant: "success",
      Icon: BanknotesIcon,
      label: children?.toString() || "Espèces",
    },
    virement: {
      variant: "purple",
      Icon: BuildingLibraryIcon,
      label: children?.toString() || "Virement",
    },
    autre: {
      variant: "neutral",
      Icon: TagIcon,
      label: children?.toString() || "Autre",
    },
  };

  const methodConfig = methodConfigMap[method] || {
    variant: "neutral" as const,
    Icon: TagIcon,
    label: children?.toString() || method || "Inconnu",
  };

  return (
    <Badge
      variant={methodConfig.variant}
      icon={<methodConfig.Icon />}
      {...props}
    >
      {methodConfig.label}
    </Badge>
  );
}

/**
 * Badge de statut d'échéance de paiement
 * Supporte l'affichage des retards avec animation et jours de retard
 */

// Icône pour les échéances en retard
const ExclamationTriangleIcon = () => (
  <svg
    className="h-3 w-3"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
    />
  </svg>
);

export interface ScheduleStatusBadgeProps extends Omit<
  BadgeProps,
  "variant" | "children" | "icon" | "dot"
> {
  status: string;
  daysLate?: number;
  children?: ReactNode;
}

export function ScheduleStatusBadge({
  status,
  daysLate,
  children,
  className = "",
  ...props
}: ScheduleStatusBadgeProps) {
  const { i18n } = useTranslation("payments");
  const statutInfo = useStatutEcheanceByCode(status);

  // Couleurs par défaut (fallback si la référence DB n'est pas disponible)
  const fallbackConfigMap: Record<
    string,
    { variant: BadgeProps["variant"]; label: string }
  > = {
    en_attente: { variant: "orange", label: "En attente" },
    paye: { variant: "success", label: "Payé" },
    en_retard: { variant: "danger", label: "En retard" },
    annule: { variant: "neutral", label: "Annulé" },
  };

  const fallback = fallbackConfigMap[status] ?? {
    variant: "neutral" as const,
    label: status || "Inconnu",
  };

  const dynamicLabel = statutInfo
    ? i18n.language === "en" && statutInfo.nom_en
      ? statutInfo.nom_en
      : statutInfo.nom
    : fallback.label;

  const label = children?.toString() || dynamicLabel;
  const variant =
    (statutInfo?.couleur as BadgeProps["variant"]) ?? fallback.variant;

  const statusConfig = { variant, label };

  const isOverdue = status === "en_retard";
  const icon = isOverdue ? <ExclamationTriangleIcon /> : undefined;

  // Ajouter l'animation pulse pour les retards
  const combinedClassName = cn(className, isOverdue && "animate-pulse");

  return (
    <Badge
      variant={statusConfig.variant}
      icon={icon}
      className={combinedClassName}
      {...props}
    >
      <span className="flex items-center gap-1">
        {statusConfig.label}
        {isOverdue && daysLate !== undefined && daysLate > 0 && (
          <span className="font-semibold">({daysLate}j)</span>
        )}
      </span>
    </Badge>
  );
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

Badge.Status = StatusBadge;
Badge.Stock = StockBadge;
Badge.Role = RoleBadge;
Badge.PaymentStatus = PaymentStatusBadge;
Badge.OrderStatus = OrderStatusBadge;
Badge.PaymentMethod = PaymentMethodBadge;
Badge.ScheduleStatus = ScheduleStatusBadge;

export default Badge;
