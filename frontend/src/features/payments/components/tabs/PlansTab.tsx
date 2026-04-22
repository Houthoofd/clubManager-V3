/**
 * PlansTab - Onglet des plans tarifaires
 * Affiche et gère les plans tarifaires (admin uniquement)
 */

import type { PricingPlan } from "@clubmanager/types";
import { LoadingSpinner } from "../../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../../shared/components/Layout/EmptyState";

interface PlansTabProps {
  // Données
  plans: PricingPlan[];
  plansLoading: boolean;

  // Handlers
  refetchPlans: () => void;
  setPlanFormOpen: (open: boolean) => void;
  setSelectedPlan: (plan: PricingPlan | undefined) => void;
  handleTogglePlan: (plan: PricingPlan) => void;
  handleDeletePlan: (id: number, name: string) => void;

  // État
  deletingPlanId: number | null;
  setDeletingPlanId: (id: number | null) => void;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function PlansTab({
  plans,
  plansLoading,
  refetchPlans,
  setPlanFormOpen,
  setSelectedPlan,
  handleTogglePlan,
  handleDeletePlan,
  deletingPlanId,
  setDeletingPlanId,
}: PlansTabProps) {
  return (
    <div>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-gray-900">
            Plans tarifaires
          </h2>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {plans.length} plan{plans.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refetchPlans}
            disabled={plansLoading}
            title="Rafraîchir les plans"
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200
                       text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200
                       transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              className={`h-4 w-4 ${plansLoading ? "animate-spin" : ""}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedPlan(undefined);
              setPlanFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium
                       text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm
                       transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Nouveau plan
          </button>
        </div>
      </div>

      {/* Grille de cartes */}
      <div className="p-4">
        {plansLoading && <LoadingSpinner />}

        {!plansLoading && plans.length === 0 && (
          <EmptyState
            title="Aucun plan tarifaire"
            description="Créez votre premier plan tarifaire pour commencer à gérer les abonnements."
          />
        )}

        {!plansLoading && plans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl border shadow-sm transition-all
                  ${
                    plan.actif
                      ? "bg-white border-gray-200 hover:border-blue-200 hover:shadow-md"
                      : "bg-gray-50 border-gray-200 opacity-70"
                  }`}
              >
                {/* Badge actif/inactif */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      plan.actif
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {plan.actif ? "Actif" : "Inactif"}
                  </span>
                </div>

                {/* Corps de la carte */}
                <div className="p-5 flex-1">
                  <h3 className="text-base font-semibold text-gray-900 pr-16 leading-tight">
                    {plan.nom}
                  </h3>

                  {/* Prix et durée */}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(plan.prix)}
                    </span>
                    <span className="text-sm text-gray-500">
                      / {plan.duree_mois} mois
                    </span>
                  </div>

                  {/* Prix mensuel si durée > 1 */}
                  {plan.duree_mois > 1 && (
                    <p className="mt-0.5 text-xs text-gray-400">
                      ≈ {formatCurrency(plan.prix / plan.duree_mois)} /
                      mois
                    </p>
                  )}

                  {/* Description */}
                  {plan.description && (
                    <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-3">
                      {plan.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  {/* Bouton activer/désactiver */}
                  <button
                    type="button"
                    onClick={() => handleTogglePlan(plan)}
                    title={plan.actif ? "Désactiver" : "Activer"}
                    className={`flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      plan.actif
                        ? "text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200"
                        : "text-green-700 bg-green-50 hover:bg-green-100 border border-green-200"
                    }`}
                  >
                    {plan.actif ? (
                      <>
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                          />
                        </svg>
                        Désactiver
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                          />
                        </svg>
                        Activer
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Modifier */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setPlanFormOpen(true);
                      }}
                      title="Modifier"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50
                                 transition-colors"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                        />
                      </svg>
                    </button>

                    {/* Supprimer */}
                    {deletingPlanId === plan.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Confirmer ?
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeletePlan(plan.id, plan.nom)
                          }
                          className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                          Oui
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingPlanId(null)}
                          className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Non
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingPlanId(plan.id)}
                        title="Supprimer"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50
                                   transition-colors"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
