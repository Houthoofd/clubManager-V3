import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TrashIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { 
  useInvitationsQuery, 
  useRevokeInvitationMutation 
} from "../hooks/useInvitations";
import { type Invitation } from "../api/invitationApi";
import { ConfirmDialog } from "../../../shared/components/Modal/ConfirmDialog";
import { DataTable } from "@/shared/components/Table/DataTable";
import { PaginationBar } from "@/shared/components/Navigation/PaginationBar";
import { Button } from "@/shared/components/Button/Button";
import { EnvelopeOpenIcon } from "@heroicons/react/24/outline";

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircleIcon className="w-4 h-4" />
            {t("invitations.status.accepted", "Acceptée")}
          </span>
        );
      case "revoked":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircleIcon className="w-4 h-4" />
            {t("invitations.status.revoked", "Révoquée")}
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <ClockIcon className="w-4 h-4" />
            {t("invitations.status.pending", "En attente")}
          </span>
        );
    }
  };

  const columns = [
    {
      key: "email",
      label: t("invitations.email", "Email"),
      render: (value: any, row: Invitation) => (
        <div className="font-medium text-gray-900">{row.email}</div>
      ),
    },
    {
      key: "status",
      label: t("invitations.statusLabel", "Statut"),
      render: (value: any, row: Invitation) => getStatusBadge(row.status),
    },
    {
      key: "expires_at",
      label: t("invitations.expiresAt", "Expire le"),
      render: (value: any, row: Invitation) => new Date(row.expires_at).toLocaleDateString(),
    },
    {
      key: "invited_by",
      label: t("invitations.invitedBy", "Invitée par"),
      render: (value: any, row: Invitation) => (
        <div className="text-gray-500">
          {row.invited_by_name || `#${row.invited_by}`}
        </div>
      ),
    },
    {
      key: "actions",
      label: t("common.actions", "Actions"),
      render: (value: any, row: Invitation) => (
        <div className="flex justify-end">
          {row.status === "pending" && (
            <Button
              variant="danger"
              onClick={() => handleRevoke(row.id)}
              disabled={revokeMutation.isPending}
              title={t("invitations.revoke", "Révoquer l'invitation")}
              icon={<TrashIcon className="h-4 w-4" />}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <EnvelopeOpenIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucune invitation</h3>
            <p className="mt-1 text-sm text-gray-500">Il n'y a aucune invitation pour le moment.</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data.data}
            rowKey="id"
          />
        )}
      </div>
      
      {data.total > limit && (
        <div className="border-t border-gray-100 p-4">
          <PaginationBar
            currentPage={page}
            totalPages={Math.ceil(data.total / limit)}
            onPageChange={setPage}
            totalItems={data.total}
            itemsPerPage={limit}
            itemsPerPageOptions={[10]}
            onItemsPerPageChange={() => {}}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={revokeConfirmId !== null}
        title={t("invitations.revokeTitle", "Révoquer l'invitation")}
        message={t(
          "invitations.revokeConfirm",
          "Êtes-vous sûr de vouloir révoquer cette invitation ? Le lien envoyé ne sera plus valide."
        )}
        confirmLabel={t("common.confirm", "Confirmer")}
        cancelLabel={t("common.cancel", "Annuler")}
        onConfirm={confirmRevoke}
        onCancel={() => setRevokeConfirmId(null)}
        isDestructive={true}
      />
    </div>
  );
};
