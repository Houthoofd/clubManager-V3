import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { EnvelopeOpenIcon, PlusIcon } from "@heroicons/react/24/outline";
import { InvitationsList } from "../components/InvitationsList";
import { CreateInvitationModal } from "../components/CreateInvitationModal";
import { PageHeader } from "@/shared/components/Layout/PageHeader";
import { Button } from "@/shared/components/Button/Button";

export const InvitationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<EnvelopeOpenIcon className="h-8 w-8 text-blue-600" />}
        title={t("invitations.title", "Invitations")}
        description={t("invitations.description", "Gérez les invitations envoyées pour rejoindre le club.")}
        actions={
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            {t("invitations.new", "Nouvelle Invitation")}
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <InvitationsList />
      </div>

      <CreateInvitationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
