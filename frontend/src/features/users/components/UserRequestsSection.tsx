import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/shared/components/Button/Button";
import { AlertBanner } from "@/shared/components/Feedback/AlertBanner";
import { Modal } from "@/shared/components/Modal/Modal";
import { DocumentTextIcon, ExclamationTriangleIcon, PlusIcon } from "@heroicons/react/24/outline";

import { apiClient } from "@/shared/api/apiClient";

const requestsApi = {
  getMyRequests: async () => {
    const res = await apiClient.get("/users/requests/me");
    return res.data.data;
  },
  createRequest: async (data: { type: string, message: string }) => {
    const res = await apiClient.post("/users/requests", data);
    return res.data.data;
  }
};

export function UserRequestsSection() {
  const { t } = useTranslation(["users", "common"]);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestType, setRequestType] = useState("account_deletion");
  const [message, setMessage] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["userRequests", "me"],
    queryFn: requestsApi.getMyRequests,
  });

  const createMutation = useMutation({
    mutationFn: requestsApi.createRequest,
    onSuccess: () => {
      toast.success("Demande envoyée avec succès");
      queryClient.invalidateQueries({ queryKey: ["userRequests", "me"] });
      setIsModalOpen(false);
      setMessage("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'envoi de la demande");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ type: requestType, message });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-500" />
            Demandes et RGPD
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos demandes de suppression de compte ou de récupération de vos données.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Chargement...</div>
        ) : requests?.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Vous n'avez fait aucune demande pour le moment.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {requests?.map((req: any) => (
              <li key={req.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {req.type === "account_deletion" ? "Suppression de compte" : "Autre demande"}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">{req.message}</p>
                    {req.admin_comment && (
                      <div className="mt-3 bg-blue-50 border border-blue-100 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Réponse de l'administrateur :</p>
                        <p className="text-sm text-blue-800 mt-1">{req.admin_comment}</p>
                      </div>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                    ${req.status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 
                      req.status === 'approved' ? 'bg-green-50 text-green-800 border-green-200' : 
                      'bg-red-50 text-red-800 border-red-200'}
                  `}>
                    {req.status === 'pending' ? 'En attente' : req.status === 'approved' ? 'Approuvée' : 'Refusée'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          size="md"
        >
          <Modal.Header 
            title="Nouvelle demande" 
            onClose={() => setIsModalOpen(false)} 
            showCloseButton
          />
          <form onSubmit={handleSubmit}>
            <Modal.Body>
              <div className="space-y-4">
                {requestType === "account_deletion" && (
                  <AlertBanner
                    variant="warning"
                    icon={<ExclamationTriangleIcon className="w-5 h-5" />}
                    title="Attention"
                    message="La suppression de votre compte est définitive. Toutes vos données seront anonymisées et vous ne pourrez plus y accéder."
                  />
                )}
    
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de demande
                  </label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="account_deletion">Suppression de compte (RGPD)</option>
                    <option value="other">Autre demande</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (optionnel)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Précisez votre demande..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" isLoading={createMutation.isPending} variant={requestType === "account_deletion" ? "danger" : "primary"}>
                Envoyer la demande
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      )}
    </div>
  );
}
