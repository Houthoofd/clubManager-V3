/**
 * SchedulesTab - Onglet des échéances de paiement
 * Affiche les échéances avec mise en évidence des retards
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { DataTable } from "../../../../shared/components/Table/DataTable";
import { LoadingSpinner } from "../../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../../shared/components/Layout/EmptyState";
import { PaginationBar } from "../../../../shared/components/Navigation/PaginationBar";
import { Badge } from "../../../../shared/components";
import { useStatutsEcheance } from "../../../../shared/hooks/useReferences";
import type { Column } from "../../../../shared/components/Table/DataTable";

interface SchedulesFilters {
  statut: string;
}

interface SchedulesTabProps {
  // Données
  schedules: any[];
  schedulesLoading: boolean;
  schedulesPagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  schedulesColumns: Column<any>[];
  overdueSchedules: any[];

  // Filtres
  schedulesFilters: SchedulesFilters;

  // Handlers
  setSchedulesPage: (page: number) => void;
  setSchedulesFilter: (key: keyof SchedulesFilters, value: string) => void;
  refetchSchedules: () => void;
  handleMarkAsPaid: (id: number) => void;

  // État
  markingScheduleId: number | null;

  // Suppression
  onDeleteSchedule?: (id: number) => void;
  deletingScheduleId?: number | null;

  // Permissions
  isAdmin: boolean;

  // Create / Generate
  createSchedule?: (data: {
    user_id: number;
    montant: number;
    date_echeance: string;
    plan_tarifaire_id?: number | null;
  }) => Promise<void>;
  generateSchedules?: (userId: number) => Promise<void>;
  plans?: { id: number; nom: string; prix: number; duree_mois: number }[];
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function SchedulesTab({
  schedules,
  schedulesLoading,
  schedulesPagination,
  schedulesColumns,
  overdueSchedules,
  schedulesFilters,
  setSchedulesPage,
  setSchedulesFilter,
  refetchSchedules,
  handleMarkAsPaid,
  markingScheduleId,
  onDeleteSchedule,
  deletingScheduleId,
  isAdmin,
  createSchedule,
  generateSchedules,
  plans,
}: SchedulesTabProps) {
  const { t, i18n } = useTranslation("payments");
  const statutsEcheance = useStatutsEcheance();

  const [showCreate, setShowCreate] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    user_id: "",
    montant: "",
    date_echeance: "",
    plan_tarifaire_id: "",
  });
  const [generateUserId, setGenerateUserId] = useState("");

  return (
    <div data-testid="schedules-tab">
      {/* En-tête de l'onglet */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">
            {t("tabs.schedulesTitle")}
          </h2>
          {overdueSchedules.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
              <ExclamationTriangleIcon className="h-3.5 w-3.5" />
              {overdueSchedules.length} {t("tabs.overdueSingular")}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={refetchSchedules}
          disabled={schedulesLoading}
          title={t("tabs.refreshSchedules")}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200
                     text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200
                     transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            className={`h-4 w-4 ${schedulesLoading ? "animate-spin" : ""}`}
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
        {isAdmin && createSchedule && (
          <>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
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
              {t("schedule.createButton")}
            </button>
            <button
              type="button"
              onClick={() => setShowGenerate(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              {t("schedule.generateButton")}
            </button>
          </>
        )}
      </div>

      {/* Filtre statut */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <select
            value={schedulesFilters.statut}
            onChange={(e) => setSchedulesFilter("statut", e.target.value)}
            className="px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-colors min-w-[180px]"
          >
            <option value="">{t("tabs.allStatuses")}</option>
            {statutsEcheance.length > 0 ? (
              statutsEcheance.map((s) => (
                <option key={s.code} value={s.code}>
                  {i18n.language === "en" && s.nom_en ? s.nom_en : s.nom}
                </option>
              ))
            ) : (
              <>
                <option value="en_attente">{t("status.pending")}</option>
                <option value="paye">{t("status.paid")}</option>
                <option value="en_retard">{t("status.overdue")}</option>
                <option value="annule">{t("status.cancelled")}</option>
              </>
            )}
          </select>
          {schedulesFilters.statut && (
            <button
              type="button"
              onClick={() => setSchedulesFilter("statut", "")}
              className="px-3 py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100
                         border border-gray-300 rounded-lg transition-colors"
            >
              {t("tabs.reset")}
            </button>
          )}
        </div>
      </div>

      {/* Section échéances en retard */}
      {overdueSchedules.length > 0 && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-800 mb-3">
                {overdueSchedules.length}{" "}
                {overdueSchedules.length > 1
                  ? t("tabs.schedulePlural")
                  : t("tabs.scheduleSingular")}{" "}
                {t("tabs.overdueSingular")}
              </h3>
              <div className="space-y-2">
                {overdueSchedules.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 px-3
                               bg-white rounded-lg border border-red-200 shadow-sm"
                  >
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-gray-900">
                        {s.utilisateur_nom_complet}
                      </span>
                      <span className="mx-2 text-gray-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-sm text-gray-500">
                        {s.plan_tarifaire_nom}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-red-700">
                        {formatCurrency(s.montant)}
                      </span>
                      <Badge.ScheduleStatus
                        status={s.statut}
                        daysLate={s.jours_retard}
                      />
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsPaid(s.id)}
                          disabled={markingScheduleId === s.id}
                          data-testid={`btn-mark-paid-${s.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium
                                     text-white bg-green-600 hover:bg-green-700 rounded-lg
                                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {markingScheduleId === s.id ? (
                            t("tabs.marking")
                          ) : (
                            <>
                              <CheckIcon className="h-3.5 w-3.5" />
                              {t("tabs.markPaid")}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {overdueSchedules.length > 5 && (
                  <p className="text-xs text-red-600 text-center pt-1">
                    + {overdueSchedules.length - 5}{" "}
                    {overdueSchedules.length - 5 > 1
                      ? t("tabs.otherPlural")
                      : t("tabs.otherSingular")}{" "}
                    {t("tabs.overdueSingular")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DataTable pour les échéances */}
      {schedulesLoading ? (
        <LoadingSpinner />
      ) : schedules.length === 0 ? (
        <EmptyState
          title={t("messages.noPendingPayments")}
          description={t("messages.errorLoadingPayments")}
        />
      ) : (
        <>
          <DataTable
            columns={schedulesColumns}
            data={schedules}
            rowKey="id"
            loading={schedulesLoading}
            emptyMessage={t("messages.noPendingPayments")}
          />
          <PaginationBar
            currentPage={schedulesPagination.page}
            totalPages={schedulesPagination.totalPages}
            onPageChange={setSchedulesPage}
            showResultsCount
            total={schedulesPagination.total}
            pageSize={schedulesPagination.limit}
          />
        </>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("schedule.createTitle")}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("schedule.userId")}
                </label>
                <input
                  type="number"
                  value={newSchedule.user_id}
                  onChange={(e) =>
                    setNewSchedule((s) => ({ ...s, user_id: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="ID utilisateur"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("schedule.amount")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newSchedule.montant}
                  onChange={(e) =>
                    setNewSchedule((s) => ({ ...s, montant: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("schedule.dueDate")}
                </label>
                <input
                  type="date"
                  value={newSchedule.date_echeance}
                  onChange={(e) =>
                    setNewSchedule((s) => ({
                      ...s,
                      date_echeance: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              {plans && plans.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("schedule.plan")}
                  </label>
                  <select
                    value={newSchedule.plan_tarifaire_id}
                    onChange={(e) =>
                      setNewSchedule((s) => ({
                        ...s,
                        plan_tarifaire_id: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">{t("schedule.noPlan")}</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nom}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                disabled={creating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                disabled={
                  creating ||
                  !newSchedule.user_id ||
                  !newSchedule.montant ||
                  !newSchedule.date_echeance
                }
                onClick={async () => {
                  if (!createSchedule) return;
                  setCreating(true);
                  try {
                    await createSchedule({
                      user_id: Number(newSchedule.user_id),
                      montant: Number(newSchedule.montant),
                      date_echeance: newSchedule.date_echeance,
                      plan_tarifaire_id: newSchedule.plan_tarifaire_id
                        ? Number(newSchedule.plan_tarifaire_id)
                        : null,
                    });
                    setShowCreate(false);
                    setNewSchedule({
                      user_id: "",
                      montant: "",
                      date_echeance: "",
                      plan_tarifaire_id: "",
                    });
                    refetchSchedules();
                  } finally {
                    setCreating(false);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? t("schedule.creating") : t("schedule.create")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {t("schedule.generateTitle")}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t("schedule.generateDescription")}
            </p>
            <input
              type="number"
              value={generateUserId}
              onChange={(e) => setGenerateUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
              placeholder={t("schedule.userId")}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowGenerate(false)}
                disabled={generating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                disabled={generating || !generateUserId}
                onClick={async () => {
                  if (!generateSchedules) return;
                  setGenerating(true);
                  try {
                    await generateSchedules(Number(generateUserId));
                    setShowGenerate(false);
                    setGenerateUserId("");
                    refetchSchedules();
                  } finally {
                    setGenerating(false);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? t("schedule.generating") : t("schedule.generate")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
