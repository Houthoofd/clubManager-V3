/**
 * MovementsTab
 * Onglet historique des mouvements de stock (admin uniquement).
 *
 * Fonctionnalités :
 * - Filtre par type de mouvement
 * - Tableau avec date, article, taille, type, avant→après, mouvement (+/-), effectué par, motif
 * - Badges colorés par type de mouvement
 * - Affichage +N (vert) / -N (rouge) pour le mouvement
 * - Pagination simple précédent / suivant
 * - États chargement / vide / erreur
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClockIcon } from "@heroicons/react/24/outline";
import { AlertBanner } from "../../../../shared/components/Feedback/AlertBanner";
import { LoadingSpinner } from "../../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../../shared/components/Layout/EmptyState";
import { getStockMovements, type StockMovementItem } from "../../api/storeApi";
import { getErrorMessage, formatDateTime } from "../../../../shared/utils";

// ─── Constantes de style ──────────────────────────────────────────────────────

const TYPE_BADGE_STYLES: Record<StockMovementItem["type_mouvement"], string> = {
  commande:   "bg-red-100    text-red-700    ring-1 ring-red-200",
  livraison:  "bg-green-100  text-green-700  ring-1 ring-green-200",
  annulation: "bg-orange-100 text-orange-700 ring-1 ring-orange-200",
  retour:     "bg-blue-100   text-blue-700   ring-1 ring-blue-200",
  ajustement: "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
  inventaire: "bg-gray-100   text-gray-700   ring-1 ring-gray-200",
};

const TYPE_LABELS: Record<StockMovementItem["type_mouvement"], string> = {
  commande:   "Commande",
  livraison:  "Livraison",
  annulation: "Annulation",
  retour:     "Retour",
  ajustement: "Ajustement",
  inventaire: "Inventaire",
};

// ─── Composant ────────────────────────────────────────────────────────────────

export function MovementsTab() {
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const LIMIT = 50;

  const params = {
    type_mouvement: typeFilter || undefined,
    page,
    limit: LIMIT,
  };

  const query = useQuery({
    queryKey: ["stock-movements", { type_mouvement: typeFilter }, page],
    queryFn: () => getStockMovements(params),
    staleTime: 30 * 1000,
  });

  const movements = query.data?.movements ?? [];
  const pagination = query.data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  return (
    <div>
      {/* ── En-tête de l'onglet ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">
            Historique des mouvements de stock
          </h2>
          {pagination && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {pagination.total} mouvement{pagination.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Filtre par type */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="movement-type-filter"
            className="text-sm text-gray-500 whitespace-nowrap"
          >
            Type :
          </label>
          <select
            id="movement-type-filter"
            value={typeFilter}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-colors min-w-[160px]"
          >
            <option value="">Tous les types</option>
            <option value="commande">Commande</option>
            <option value="livraison">Livraison</option>
            <option value="annulation">Annulation</option>
            <option value="retour">Retour</option>
            <option value="ajustement">Ajustement</option>
            <option value="inventaire">Inventaire</option>
          </select>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="p-4">
        {/* Erreur */}
        {query.isError && (
          <AlertBanner
            variant="error"
            message={getErrorMessage(query.error)}
          />
        )}

        {/* Chargement */}
        {query.isLoading && (
          <LoadingSpinner text="Chargement des mouvements..." />
        )}

        {/* Vide */}
        {!query.isLoading && !query.isError && movements.length === 0 && (
          <EmptyState
            title="Aucun mouvement de stock"
            description={
              typeFilter
                ? `Aucun mouvement de type « ${TYPE_LABELS[typeFilter as StockMovementItem["type_mouvement"]]} » n'a été enregistré.`
                : "Il n'y a pas encore de mouvements de stock enregistrés."
            }
            variant="dashed"
            icon={<ClockIcon className="h-8 w-8 text-gray-400" />}
          />
        )}

        {/* Tableau */}
        {movements.length > 0 && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Article
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Taille
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Avant → Après
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Mouvement
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Effectué par
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Motif
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {movements.map((mv) => (
                      <tr
                        key={mv.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Date */}
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {formatDateTime(mv.created_at)}
                        </td>

                        {/* Article */}
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {mv.article_nom}
                        </td>

                        {/* Taille */}
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {mv.taille || "—"}
                        </td>

                        {/* Type (badge coloré) */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGE_STYLES[mv.type_mouvement]}`}
                          >
                            {TYPE_LABELS[mv.type_mouvement]}
                          </span>
                        </td>

                        {/* Avant → Après */}
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          <span className="font-medium text-gray-800">
                            {mv.quantite_avant}
                          </span>
                          <span className="mx-1.5 text-gray-400">→</span>
                          <span className="font-medium text-gray-800">
                            {mv.quantite_apres}
                          </span>
                        </td>

                        {/* Mouvement (+/-) */}
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {mv.quantite_mouvement > 0 ? (
                            <span className="font-semibold text-green-600">
                              +{mv.quantite_mouvement}
                            </span>
                          ) : mv.quantite_mouvement < 0 ? (
                            <span className="font-semibold text-red-600">
                              {mv.quantite_mouvement}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>

                        {/* Effectué par */}
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {mv.effectue_par ?? (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Motif */}
                        <td
                          className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate"
                          title={mv.motif ?? undefined}
                        >
                          {mv.motif ?? <span className="text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page} sur {totalPages}
                  {pagination
                    ? ` — ${pagination.total} mouvement${pagination.total !== 1 ? "s" : ""}`
                    : ""}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium
                               text-gray-700 transition hover:bg-gray-50
                               disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium
                               text-gray-700 transition hover:bg-gray-50
                               disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
