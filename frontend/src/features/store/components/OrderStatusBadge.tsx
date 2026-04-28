/**
 * OrderStatusBadge
 * Affiche le statut d'une commande sous forme de badge coloré.
 *
 * Utilise useStatutCommandeByCode pour récupérer les données depuis la DB.
 * Fallback vers Badge.OrderStatus si les références ne sont pas encore chargées.
 */

import { useTranslation } from "react-i18next";
import { Badge } from "../../../shared/components";
import { useStatutCommandeByCode } from "../../../shared/hooks/useReferences";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderStatusBadgeProps {
  statut?: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const VALID_STATUSES = [
  "en_attente",
  "en_cours",
  "payee",
  "expediee",
  "prete",
  "livree",
  "annulee",
] as const;

type ValidStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(s: string): s is ValidStatus {
  return (VALID_STATUSES as readonly string[]).includes(s);
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * OrderStatusBadge — Affiche le statut d'une commande sous forme de badge coloré.
 *
 * Priorité d'affichage :
 * 1. Données DB via useStatutCommandeByCode (couleur + label i18n)
 * 2. Fallback Badge.OrderStatus du design system (statuts connus)
 * 3. Fallback générique badge neutre (statut inconnu)
 */
export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  statut,
}) => {
  const { t, i18n } = useTranslation("store");
  const statutInfo = useStatutCommandeByCode(statut);

  // Aucun statut fourni
  if (!statut) {
    return <Badge variant="neutral">{t("orderStatus.unknown")}</Badge>;
  }

  // ── Données DB disponibles ────────────────────────────────────────────────
  if (statutInfo) {
    const label =
      i18n.language === "en" && statutInfo.nom_en
        ? statutInfo.nom_en
        : statutInfo.nom;

    return (
      <Badge variant={(statutInfo.couleur ?? "neutral") as any}>{label}</Badge>
    );
  }

  // ── Fallback : références pas encore chargées, statut connu du DS ─────────
  if (isValidStatus(statut)) {
    return <Badge.OrderStatus status={statut} />;
  }

  // ── Fallback générique pour statuts totalement inconnus ───────────────────
  return <Badge variant="neutral">{statut}</Badge>;
};
