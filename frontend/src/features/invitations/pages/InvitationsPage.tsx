import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { EnvelopeOpenIcon, PlusIcon } from "@patternfly/react-icons";
import { InvitationsList } from "../components/InvitationsList";
import { CreateInvitationModal } from "../components/CreateInvitationModal";

export const InvitationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <EnvelopeOpenIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("invitations.title", "Invitations")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t(
                "invitations.description",
                "Gérez les invitations envoyées pour rejoindre le club."
              )}
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t("invitations.new", "Nouvelle Invitation")}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="mt-8">
        <InvitationsList />
      </div>

      {/* Modal */}
      <CreateInvitationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
