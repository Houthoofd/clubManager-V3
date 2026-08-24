import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateInvitationMutation } from "../hooks/useInvitations";

interface CreateInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInvitationModal: React.FC<CreateInvitationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const createMutation = useCreateInvitationMutation();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    createMutation.mutate(email, {
      onSuccess: () => {
        setEmail("");
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {t("invitations.new", "Nouvelle Invitation")}
                  </h3>
                  <div className="mt-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("invitations.email", "Adresse Email")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                      placeholder="exemple@email.com"
                      required
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      {t(
                        "invitations.helpText",
                        "Un email contenant un lien d'inscription unique sera envoyé à cette adresse."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={createMutation.isPending || !email}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending
                  ? t("common.sending", "Envoi...")
                  : t("common.send", "Envoyer")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {t("common.cancel", "Annuler")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
