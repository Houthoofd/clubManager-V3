import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  getInvitations,
  sendInvitation,
  revokeInvitation,
  type Invitation,
} from "../api/invitationApi";

export const INVITATIONS_QUERY_KEY = ["invitations"];

/**
 * Hook pour récupérer la liste paginée des invitations
 */
export const useInvitationsQuery = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [...INVITATIONS_QUERY_KEY, page, limit],
    queryFn: () => getInvitations(page, limit),
  });
};

/**
 * Hook pour envoyer une nouvelle invitation
 */
export const useCreateInvitationMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (email: string) => sendInvitation(email),
    onSuccess: (data) => {
      toast.success(data.message || t("invitations.createSuccess", "Invitation envoyée avec succès"));
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 
        t("invitations.createError", "Erreur lors de l'envoi de l'invitation")
      );
    },
  });
};

/**
 * Hook pour révoquer une invitation existante
 */
export const useRevokeInvitationMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: number) => revokeInvitation(id),
    onSuccess: () => {
      toast.success(t("invitations.revokeSuccess", "Invitation révoquée avec succès"));
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 
        t("invitations.revokeError", "Erreur lors de la révocation")
      );
    },
  });
};
