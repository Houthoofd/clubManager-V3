import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TrashIcon, CheckCircleIcon, ClockIcon, TimesCircleIcon } from "@patternfly/react-icons";
import { 
  useInvitationsQuery, 
  useRevokeInvitationMutation 
} from "../hooks/useInvitations";
import { type Invitation } from "../api/invitationApi";
import { ConfirmDialog } from "../../../shared/components/Modal/ConfirmDialog";

export const InvitationsList: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [revokeConfirmId, setRevokeConfirmId] = useState<number | null>(null);
  const limit = 10;

  const { data, isLoading, isError } = useInvitationsQuery(page, limit);
  const revokeMutation = useRevokeInvitationMutation();

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center text-red-500 p-8">
        {t("common.error", "Une erreur est survenue lors du chargement des données.")}
      </div>
    );
  }

  const handleRevoke = (id: number) => {
    setRevokeConfirmId(id);
  };

  const confirmRevoke = () => {
    if (revokeConfirmId !== null) {
      revokeMutation.mutate(revokeConfirmId, {
        onSuccess: () => setRevokeConfirmId(null),
      });
    }
  };

  const getStatusBadge = (status: Invitation["status"]) => {
    switch (status) {
      case "accepted":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            {t("invitations.status.accepted", "Acceptée")}
          </span>
        );
      case "revoked":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <TimesCircleIcon className="w-4 h-4 mr-1" />
            {t("invitations.status.revoked", "Révoquée")}
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" />
            {t("invitations.status.pending", "En attente")}
          </span>
        );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("invitations.email", "Email")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("invitations.statusLabel", "Statut")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("invitations.expiresAt", "Expire le")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("invitations.invitedBy", "Invitée par")}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("common.actions", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  {t("invitations.noData", "Aucune invitation trouvée.")}
                </td>
              </tr>
            ) : (
              data.data.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invitation.email}</div>
                    <div className="text-xs text-gray-500">{new Date(invitation.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invitation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invitation.expires_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invitation.invited_by_name || `#${invitation.invited_by}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {invitation.status === "pending" && (
                      <button
                        onClick={() => handleRevoke(invitation.id)}
                        disabled={revokeMutation.isPending}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title={t("invitations.revoke", "Révoquer l'invitation")}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination (Simple) */}
      {data.total > limit && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {t("common.previous", "Précédent")}
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * limit >= data.total}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {t("common.next", "Suivant")}
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                {t("common.showing", "Affichage de")} <span className="font-medium">{(page - 1) * limit + 1}</span> {t("common.to", "à")} <span className="font-medium">{Math.min(page * limit, data.total)}</span> {t("common.of", "sur")} <span className="font-medium">{data.total}</span> {t("common.results", "résultats")}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  {t("common.previous", "Précédent")}
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * limit >= data.total}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  {t("common.next", "Suivant")}
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de confirmation de révocation */}
      <ConfirmDialog
        isOpen={revokeConfirmId !== null}
        onClose={() => setRevokeConfirmId(null)}
        onConfirm={confirmRevoke}
        title={t("invitations.revokeTitle", "Révoquer l'invitation")}
        message={t("invitations.confirmRevoke", "Êtes-vous sûr de vouloir révoquer cette invitation ? Cette action est irréversible.")}
        variant="danger"
        isLoading={revokeMutation.isPending}
      />
    </div>
  );
};
