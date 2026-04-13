/**
 * PaymentStatusBadge
 * Badge coloré affichant le statut d'un paiement.
 *
 * ⚠️ Ce composant est un wrapper pour Badge.PaymentStatus
 * Utilisez directement Badge.PaymentStatus pour les nouveaux composants.
 */

import Badge from "@/shared/components/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentStatusBadgeProps {
  statut?: string;
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * PaymentStatusBadge — Affiche le statut d'un paiement sous forme de badge coloré.
 *
 * - en_attente → jaune/orange
 * - valide     → vert
 * - paye       → vert
 * - partiel    → bleu
 * - echoue     → rouge
 * - rembourse  → violet
 * - annule     → rouge
 * - inconnu    → gris
 *
 * @deprecated Utilisez Badge.PaymentStatus directement
 */
export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  statut,
}) => {
  // Mapper les statuts valides vers Badge.PaymentStatus
  const validStatuses = [
    "en_attente",
    "paye",
    "valide",
    "partiel",
    "echoue",
    "rembourse",
    "annule",
  ];

  if (!statut) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ring-1 ring-gray-200">
        Inconnu
      </span>
    );
  }

  // Si le statut est valide, utiliser Badge.PaymentStatus
  if (validStatuses.includes(statut)) {
    return (
      <Badge.PaymentStatus
        status={
          statut as
            | "en_attente"
            | "paye"
            | "valide"
            | "partiel"
            | "echoue"
            | "rembourse"
            | "annule"
        }
      />
    );
  }

  // Statut inconnu
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ring-1 ring-gray-200">
      {statut}
    </span>
  );
};
