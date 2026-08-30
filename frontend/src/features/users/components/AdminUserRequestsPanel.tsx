import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/shared/components/Button/Button";
import { Modal } from "@/shared/components/Modal/Modal";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { apiClient } from "@/shared/api/apiClient";

const adminRequestsApi = {
  getPending: async () => {
    const res = await apiClient.get("/users/requests");
    return res.data.data.filter((req: any) => req.status === "pending");
  },
  updateStatus: async ({ id, status, admin_comment }: { id: number, status: string, admin_comment?: string }) => {
    const res = await apiClient.patch(`/users/requests/${id}/status`, { status, admin_comment });
    return res.data.data;
  }
};

export function AdminUserRequestsPanel() {
  const queryClient = useQueryClient();
  const [modalState, setModalState] = useState<{ type: "none" | "approve" | "reject", request: any }>({ type: "none", request: null });
  const [adminComment, setAdminComment] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["adminUserRequests", "pending"],
    queryFn: adminRequestsApi.getPending,
  });

  const updateMutation = useMutation({
    mutationFn: adminRequestsApi.updateStatus,
    onSuccess: () => {
      toast.success("Statut de la demande mis à jour");
      queryClient.invalidateQueries({ queryKey: ["adminUserRequests", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setModalState({ type: "none", request: null });
      setAdminComment("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalState.type === "none" || !modalState.request) return;

    updateMutation.mutate({
      id: modalState.request.id,
      status: modalState.type === "approve" ? "approved" : "rejected",
      admin_comment: adminComment
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Chargement des demandes...</div>;
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
        Aucune demande utilisateur en attente.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {requests.map((req: any) => (
          <li key={req.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-gray-900">
                    Utilisateur #{req.user_id}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${req.type === "account_deletion" ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}`}>
                    {req.type === "account_deletion" ? "Suppression RGPD" : "Autre"}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {req.message || <span className="italic text-gray-400">Aucun message fourni</span>}
                </p>
                <div className="text-xs text-gray-400 mt-2">
                  Date: {new Date(req.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="success" 
                  onClick={() => setModalState({ type: "approve", request: req })}
                  className="flex items-center gap-1"
                >
                  <CheckIcon className="w-4 h-4" /> Approuver
                </Button>
                <Button 
                  size="sm" 
                  variant="danger" 
                  onClick={() => setModalState({ type: "reject", request: req })}
                  className="flex items-center gap-1"
                >
                  <XMarkIcon className="w-4 h-4" /> Rejeter
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal d'action */}
      {modalState.type !== "none" && modalState.request && (
        <Modal
          isOpen={true}
          onClose={() => setModalState({ type: "none", request: null })}
          size="md"
        >
          <Modal.Header 
            title={modalState.type === "approve" ? "Approuver la demande" : "Rejeter la demande"} 
            onClose={() => setModalState({ type: "none", request: null })} 
            showCloseButton
          />
          <form onSubmit={handleSubmit}>
            <Modal.Body>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {modalState.type === "approve" 
                    ? "Vous êtes sur le point d'approuver cette demande. Si c'est une demande de suppression, l'icône de suppression définitive (kebab menu) sera alors déverrouillée." 
                    : "Vous allez rejeter cette demande."}
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commentaire pour l'utilisateur (optionnel)
                  </label>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    rows={3}
                    placeholder="Ex: Votre demande a bien été prise en compte..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button type="button" variant="secondary" onClick={() => setModalState({ type: "none", request: null })}>
                Annuler
              </Button>
              <Button type="submit" isLoading={updateMutation.isPending} variant={modalState.type === "approve" ? "success" : "danger"}>
                Confirmer
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      )}
    </div>
  );
}
