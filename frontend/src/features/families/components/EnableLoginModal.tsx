import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Modal, Input, Button } from "../../../shared/components";
import type { FamilyMemberResponseDto } from "@clubmanager/types";
import { enableDependentLogin } from "../api/familyApi";

interface EnableLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMemberResponseDto | null;
  onSuccess?: () => void;
}

export function EnableLoginModal({
  isOpen,
  onClose,
  member,
  onSuccess,
}: EnableLoginModalProps) {
  const { t } = useTranslation("families");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error(t("errors.passwordRequired", "Le mot de passe est requis."));
      return;
    }

    setIsLoading(true);
    try {
      const result = await enableDependentLogin(member.id.toString(), {
        password,
        email: email || undefined,
      });

      if (result.success) {
        toast.success(result.message || t("messages.success.loginEnabled", "Connexion autorisée avec succès."));
        onSuccess?.();
        onClose();
        setPassword("");
        setEmail("");
      } else {
        toast.error(result.message || t("errors.enableLoginFailed", "Échec de l'activation."));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("errors.genericError", "Une erreur est survenue."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header
        title={t("modals.enableLogin.title", "Autoriser la connexion")}
        subtitle={t("modals.enableLogin.subtitle", {
          name: `${member.first_name} ${member.last_name}`,
          defaultValue: `Configuration pour ${member.first_name} ${member.last_name}`,
        })}
        onClose={onClose}
      />
      
      <form onSubmit={handleSubmit}>
        <Modal.Body className="space-y-4">
          <Input
            id="dependent-password"
            type="password"
            label={t("fields.password", "Mot de passe")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={t("placeholders.password", "Nouveau mot de passe")}
          />
          <Input
            id="dependent-email"
            type="email"
            label={t("fields.email", "Adresse e-mail (optionnelle)")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("placeholders.email", "e.g. email@exemple.com")}
          />
        </Modal.Body>

        <Modal.Footer align="right">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            {t("actions.cancel", "Annuler")}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} isLoading={isLoading}>
            {t("actions.confirm", "Confirmer")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
