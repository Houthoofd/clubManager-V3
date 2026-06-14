/**
 * AlertsPage
 * Page principale des alertes avec tabs Admin / Mes Alertes
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../shared/stores/authStore";
import {
  useAlertTypes,
  useAdminAlerts,
  useMyAlerts,
  useDeleteAlertType,
  useResolveAlert,
  useIgnoreAlert,
} from "../hooks/useAlerts";
import type {
  AlertStatut,
  AlertPriorite,
  AlertTypeDto,
  AlertUserDto,
} from "../api/alertsApi";
import { AlertTypeBadge } from "../components/AlertTypeBadge";
import { AlertStatusBadge } from "../components/AlertStatusBadge";
import { AlertTypeFormModal } from "../components/AlertTypeFormModal";
import { CreateAlertModal } from "../components/CreateAlertModal";
import { AlertActionsModal } from "../components/AlertActionsModal";
import { UserAlertCard } from "../components/UserAlertCard";
import { toast } from "sonner";

// ─── Icons ─────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg
      className="w-4 h-4"
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
  );
}

function PencilIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Sub-sections ──────────────────────────────────────────────────────────────

type AdminTabSection = "types" | "alerts";

const STATUTS: AlertStatut[] = ["active", "resolue", "ignoree"];
const PRIORITES: AlertPriorite[] = ["basse", "normale", "haute", "critique"];

// ─── Admin Tab ─────────────────────────────────────────────────────────────────

function AdminTab() {
  const { t } = useTranslation("alerts");
  const [section, setSection] = useState<AdminTabSection>("alerts");

  // Alert Types state
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<AlertTypeDto | null>(null);
  const {
    data: alertTypes = [],
    isLoading: typesLoading,
    isError: typesError,
  } = useAlertTypes();
  const { mutate: deleteType } = useDeleteAlertType();

  // User Alerts state
  const [statusFilter, setStatusFilter] = useState<AlertStatut | "">("");
  const [priorityFilter, setPriorityFilter] = useState<AlertPriorite | "">("");
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState(false);
  const [actionsAlert, setActionsAlert] = useState<AlertUserDto | null>(null);

  const adminFilters = {
    ...(statusFilter && { statut: statusFilter }),
    ...(priorityFilter && { priorite: priorityFilter }),
  };
  const {
    data: adminAlerts = [],
    isLoading: alertsLoading,
    isError: alertsError,
  } = useAdminAlerts(adminFilters);

  const handleDeleteType = (id: number) => {
    if (!confirm(t("alertTypes.messages.deleteConfirm"))) return;
    deleteType(id, {
      onSuccess: () => toast.success(t("alertTypes.messages.deleted")),
      onError: () => toast.error(t("errors.deleteFailed")),
    });
  };

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      {/* Sub-tab nav */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          data-testid="subtab-alerts"
          onClick={() => setSection("alerts")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${section === "alerts" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          {t("userAlerts.title")}
        </button>
        <button
          data-testid="subtab-types"
          onClick={() => setSection("types")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${section === "types" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          {t("alertTypes.title")}
        </button>
      </div>

      {/* ── Alert Types section ─────────────────────────────────────────────── */}
      {section === "types" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">
              {t("alertTypes.title")}
            </h2>
            <button
              data-testid="btn-create-alert-type"
              onClick={() => {
                setEditingType(null);
                setIsTypeModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon />
              {t("alertTypes.actions.create")}
            </button>
          </div>

          {typesLoading ? (
            <div className="flex justify-center py-12">
              <SpinnerIcon />
            </div>
          ) : typesError ? (
            <div className="px-6 py-8 text-center text-sm text-red-500">
              {t("errors.loadFailed")}
            </div>
          ) : alertTypes.length === 0 ? (
            <div
              data-testid="alert-types-empty"
              className="px-6 py-12 text-center"
            >
              <p className="text-sm font-medium text-gray-900">
                {t("alertTypes.empty.title")}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {t("alertTypes.empty.description")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table data-testid="alert-types-table" className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("alertTypes.columns.code")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("alertTypes.columns.name")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("alertTypes.columns.priority")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("alertTypes.columns.active")}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("alertTypes.columns.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {alertTypes.map((at) => (
                    <tr
                      key={at.id}
                      data-testid={`alert-type-row-${at.id}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {at.code}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{at.nom}</p>
                        {at.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                            {at.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <AlertTypeBadge priorite={at.priorite} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${at.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {at.actif ? "Oui" : "Non"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            data-testid={`btn-edit-alert-type-${at.id}`}
                            onClick={() => {
                              setEditingType(at);
                              setIsTypeModalOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t("alertTypes.actions.edit")}
                          >
                            <PencilIcon />
                          </button>
                          <button
                            data-testid={`btn-delete-alert-type-${at.id}`}
                            onClick={() => handleDeleteType(at.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t("alertTypes.actions.delete")}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── User Alerts section ─────────────────────────────────────────────── */}
      {section === "alerts" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">
              {t("userAlerts.title")}
            </h2>
            <button
              data-testid="btn-create-alert"
              onClick={() => setIsCreateAlertOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon />
              {t("userAlerts.actions.create")}
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 bg-gray-50">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as AlertStatut | "")
              }
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">{t("userAlerts.filters.allStatuses")}</option>
              {STATUTS.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as AlertPriorite | "")
              }
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">{t("userAlerts.filters.allPriorities")}</option>
              {PRIORITES.map((p) => (
                <option key={p} value={p}>
                  {t(`priority.${p}`)}
                </option>
              ))}
            </select>
          </div>

          {alertsLoading ? (
            <div className="flex justify-center py-12">
              <SpinnerIcon />
            </div>
          ) : alertsError ? (
            <div className="px-6 py-8 text-center text-sm text-red-500">
              {t("errors.loadFailed")}
            </div>
          ) : adminAlerts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-gray-900">
                {t("userAlerts.empty.title")}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {t("userAlerts.empty.description")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                data-testid="admin-alerts-table"
                className="w-full text-sm"
              >
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("userAlerts.columns.user")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("userAlerts.columns.type")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("userAlerts.columns.priority")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("userAlerts.columns.status")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("userAlerts.columns.detected")}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("userAlerts.columns.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {adminAlerts.map((alert) => (
                    <AlertTableRow
                      key={alert.id}
                      alert={alert}
                      onViewActions={() => setActionsAlert(alert)}
                      formatDate={formatDate}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AlertTypeFormModal
        isOpen={isTypeModalOpen}
        onClose={() => {
          setIsTypeModalOpen(false);
          setEditingType(null);
        }}
        alertType={editingType}
      />
      <CreateAlertModal
        isOpen={isCreateAlertOpen}
        onClose={() => setIsCreateAlertOpen(false)}
        alertTypes={alertTypes}
      />
      <AlertActionsModal
        isOpen={actionsAlert !== null}
        onClose={() => setActionsAlert(null)}
        alert={actionsAlert}
      />
    </div>
  );
}

// ─── Alert Table Row ──────────────────────────────────────────────────────────

interface AlertTableRowProps {
  alert: AlertUserDto;
  onViewActions: () => void;
  formatDate: (d: string) => string;
}

function AlertTableRow({
  alert,
  onViewActions,
  formatDate,
}: AlertTableRowProps) {
  const { t } = useTranslation("alerts");
  const { mutate: resolve, isPending: isResolving } = useResolveAlert();
  const { mutate: ignore, isPending: isIgnoring } = useIgnoreAlert();

  const handleResolve = () => {
    resolve(
      { id: alert.id },
      {
        onSuccess: () => toast.success(t("userAlerts.messages.resolved")),
        onError: () => toast.error(t("errors.saveFailed")),
      },
    );
  };

  const handleIgnore = () => {
    ignore(alert.id, {
      onSuccess: () => toast.success(t("userAlerts.messages.ignored")),
      onError: () => toast.error(t("errors.saveFailed")),
    });
  };

  const priorite = alert.alerte_type?.priorite ?? "normale";

  return (
    <tr
      data-testid={`alert-row-${alert.id}`}
      className="hover:bg-gray-50 transition-colors"
    >
      <td className="px-4 py-3 text-gray-700 font-medium">#{alert.user_id}</td>
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900">
          {alert.alerte_type?.nom ?? `#${alert.alerte_type_id}`}
        </p>
        {alert.alerte_type && (
          <p className="text-xs text-gray-400 font-mono">
            {alert.alerte_type.code}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <AlertTypeBadge priorite={priorite} size="sm" />
      </td>
      <td className="px-4 py-3">
        <AlertStatusBadge statut={alert.statut} size="sm" />
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
        {formatDate(alert.date_detection)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          {alert.statut === "active" && (
            <>
              <button
                data-testid={`btn-resolve-${alert.id}`}
                onClick={handleResolve}
                disabled={isResolving || isIgnoring}
                title={t("userAlerts.actions.resolve")}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </button>
              <button
                data-testid={`btn-ignore-${alert.id}`}
                onClick={handleIgnore}
                disabled={isResolving || isIgnoring}
                title={t("userAlerts.actions.ignore")}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={onViewActions}
            title={t("userAlerts.actions.viewActions")}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── My Alerts Tab ─────────────────────────────────────────────────────────────

function MyAlertsTab() {
  const { t } = useTranslation("alerts");
  const [statusFilter, setStatusFilter] = useState<AlertStatut | "">("");
  const [actionsAlert, setActionsAlert] = useState<AlertUserDto | null>(null);

  const myFilters = statusFilter ? { statut: statusFilter } : {};
  const { data: myAlerts = [], isLoading, isError } = useMyAlerts(myFilters);

  return (
    <div data-testid="my-alerts-tab" className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AlertStatut | "")}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">{t("myAlerts.filters.allStatuses")}</option>
          {STATUTS.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <SpinnerIcon />
        </div>
      ) : isError ? (
        <div className="text-center py-8 text-sm text-red-500">
          {t("errors.loadFailed")}
        </div>
      ) : myAlerts.length === 0 ? (
        <div
          data-testid="my-alerts-empty"
          className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-12 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {t("myAlerts.empty.title")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("myAlerts.empty.description")}
          </p>
        </div>
      ) : (
        <div data-testid="my-alerts-list" className="space-y-3">
          {myAlerts.map((alert) => (
            <UserAlertCard
              key={alert.id}
              alert={alert}
              onViewActions={undefined}
              showAdminActions={false}
            />
          ))}
        </div>
      )}

      <AlertActionsModal
        isOpen={actionsAlert !== null}
        onClose={() => setActionsAlert(null)}
        alert={actionsAlert}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

type MainTab = "admin" | "myAlerts";

export function AlertsPage() {
  const { t } = useTranslation("alerts");
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role_app === "admin";

  const [activeTab, setActiveTab] = useState<MainTab>(
    isAdmin ? "admin" : "myAlerts",
  );

  const tabs: { key: MainTab; label: string }[] = [
    ...(isAdmin ? [{ key: "admin" as MainTab, label: t("tabs.admin") }] : []),
    { key: "myAlerts", label: t("tabs.myAlerts") },
  ];

  return (
    <div
      data-testid="alerts-page"
      className="max-w-7xl mx-auto space-y-6 px-4 py-6"
    >
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("page.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("page.description")}</p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0" aria-label="Onglets alertes">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              data-testid={tab.key === "admin" ? "tab-admin" : "tab-my-alerts"}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "admin" && isAdmin && <AdminTab />}
      {activeTab === "myAlerts" && <MyAlertsTab />}
    </div>
  );
}
