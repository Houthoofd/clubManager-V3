/**
 * InviteModal.tsx
 * Modal pour inviter un nouveau membre par email
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../../shared/components/Modal/Modal";
import { FormField } from "../../../shared/components/Forms";
import { Input } from "../../../shared/components/Input";
import { SubmitButton } from "../../../shared/components/Button";
import { sendInvitation } from "../../invitations/api/invitationApi";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Composant ─────────────────────────────────────────────────────────────────

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation("users");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail("");
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await sendInvitation(trimmed);
      toast.success(t("invite.success", { email: trimmed }));
      setEmail("");
      onClose();
    } catch (error: any) {
      toast.error(t("invite.error"), {
        description: error.response?.data?.message ?? error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm">
      <Modal.Header
        title={t("invite.title")}
        showCloseButton
        onClose={handleClose}
      />
      <form onSubmit={handleSubmit} data-testid="invite-modal">
        <Modal.Body>
          <FormField
            id="invite-email"
            label={t("invite.emailLabel")}
            required
          >
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("invite.emailPlaceholder")}
              disabled={isSubmitting}
              required
              data-testid="invite-email-input"
              leftIcon={<EnvelopeIcon className="h-4 w-4 text-gray-400" />}
            />
          </FormField>
        </Modal.Body>
        <Modal.Footer align="right">
          <SubmitButton
            isLoading={isSubmitting}
            data-testid="invite-submit-btn"
          >
            {t("invite.submit")}
          </SubmitButton>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default InviteModal;
