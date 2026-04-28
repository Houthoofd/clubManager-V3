/**
 * RecoveryRequestsPanel
 * Panneau admin pour visualiser et traiter les demandes de récupération de compte.
 *
 * Fonctionnalités :
 * - Filtres par statut (Toutes | En attente | Approuvées | Rejetées)
 * - Tableau avec date, email, raison, IP, statut, actions
 * - Boutons Approuver / Rejeter pour les demandes en attente
 * - Badge de statut coloré
 * - Pagination
 * - États chargement / vide / erreur
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import {
  getRecoveryRequests,
  processRecoveryRequest,
  type RecoveryRequest,
} from "../api/recoveryApi";
import { LoadingSpinner } from "../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../shared/components/Layout/EmptyState";
import { AlertBanner } from "../../../shared/components/Feedback/AlertBanner";

// ─── Constantes ───────────────────────────────────────────────────────────────

type StatusFilter = "" | "pending" | "approved" | "rejected";

const STATUS_TABS: {
  id: StatusFilter;
  label: string;
  icon?: React.ReactNode;
}[] = [
  { id: "", label: "Toutes" },
  {
    id: "pending",
    label: "En attente",
    icon: <ClockIcon className="h-4 w-4" />,
  },
  {
    id: "approved",
    label: "Approuvées",
    icon: <CheckCircleIcon className="h-4 w-4" />,
  },
  {
    id: "rejected",
    label: "Rejetées",
    icon: <XCircleIcon className="h-4 w-4" />,
  },
];

const STATUS_BADGE: Record<
  RecoveryRequest["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "En attente",
    className: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200",
  },
  approved: {
    label: "Approuvée",
    className: "bg-green-100 text-green-800 ring-1 ring-green-200",
  },
  rejected: {
    label: "Rejetée",
    className: "bg-red-100 text-red-800 ring-1 ring-red-200",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.data?.message === "string"
  ) {
    return (error as any).response.data.message;
  }
  return "Une erreur inattendue s'est produite";
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function RecoveryRequestsPanel() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const LIMIT = 20;

  // ── Requête ──────────────────────────────────────────────────────────────────

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["recovery-requests", statusFilter, page],
    queryFn: () => getRecoveryRequests(statusFilter || undefined, page, LIMIT),
    staleTime: 15_000,
  });

  const requests = data?.requests ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  // ── Mutation ─────────────────────────────────────────────────────────────────

  const processMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: "approved" | "rejected";
    }) => processRecoveryRequest(id, status),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.status === "approved"
          ? "Demande approuvée avec succès"
          : "Demande rejetée",
      );
      queryClient.invalidateQueries({ queryKey: ["recovery-requests"] });
      setProcessingId(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setProcessingId(null);
    },
  });

  const handleProcess = (id: number, status: "approved" | "rejected") => {
    setProcessingId(id);
    processMutation.mutate({ id, status });
  };

  // ── Rendu ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center gap-3 pb-2">
        <ShieldExclamationIcon className="h-6 w-6 text-orange-500" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Demandes de récupération de compte
          </h2>
          <p className="text-sm text-gray-500">
            Gérez les demandes d'accès manuel pour les comptes bloqués.
          </p>
        </div>
        {pagination && (
          <span className="ml-auto inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            {pagination.total} demande{pagination.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Onglets de filtre */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setStatusFilter(tab.id);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              statusFilter === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Erreur */}
      {isError && (
        <AlertBanner variant="error" message={getErrorMessage(error)} />
      )}

      {/* Chargement */}
      {isLoading && <LoadingSpinner text="Chargement des demandes..." />}

      {/* Vide */}
      {!isLoading && !isError && requests.length === 0 && (
        <EmptyState
          title="Aucune demande"
          description={
            statusFilter === "pending"
              ? "Il n'y a pas de demandes en attente de traitement."
              : "Aucune demande ne correspond aux critères sélectionnés."
          }
          variant="dashed"
          icon={<ShieldExclamationIcon className="h-8 w-8 text-gray-400" />}
        />
      )}

      {/* Tableau */}
      {requests.length > 0 && (
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
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Raison
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Adresse IP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => {
                    const badge = STATUS_BADGE[req.status];
                    const isProcessing = processingId === req.id;

                    return (
                      <tr
                        key={req.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Date */}
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {formatDate(req.created_at)}
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <a
                            href={`mailto:${req.email}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {req.email}
                          </a>
                        </td>

                        {/* Raison */}
                        <td
                          className="px-4 py-3 text-sm text-gray-500 max-w-[240px] truncate"
                          title={req.reason ?? undefined}
                        >
                          {req.reason ?? (
                            <span className="italic text-gray-400">
                              Non renseignée
                            </span>
                          )}
                        </td>

                        {/* IP */}
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono whitespace-nowrap">
                          {req.ip_address}
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          {req.status === "pending" ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={
                                  isProcessing || processMutation.isPending
                                }
                                onClick={() =>
                                  handleProcess(req.id, "approved")
                                }
                                className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                                {isProcessing &&
                                processMutation.variables?.status === "approved"
                                  ? "..."
                                  : "Approuver"}
                              </button>
                              <button
                                type="button"
                                disabled={
                                  isProcessing || processMutation.isPending
                                }
                                onClick={() =>
                                  handleProcess(req.id, "rejected")
                                }
                                className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <XCircleIcon className="h-3.5 w-3.5" />
                                {isProcessing &&
                                processMutation.variables?.status === "rejected"
                                  ? "..."
                                  : "Rejeter"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Traitée
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {page} sur {totalPages}
                {pagination
                  ? ` — ${pagination.total} demande${pagination.total !== 1 ? "s" : ""}`
                  : ""}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
