import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { previewTemplate, sendFromTemplate } from "../api/templatesApi";
import type { Template, PreviewResult } from "../api/templatesApi";
import { Modal } from "../../../shared/components";
import { SendFromTemplateComposeStep } from "./SendFromTemplateComposeStep";
import { SendFromTemplatePreviewStep } from "./SendFromTemplatePreviewStep";
import { RecipientType, RoleCible, Step } from "./SendFromTemplateTypes";

const AUTO_VAR_NAMES = new Set(["prenom", "nom", "nom_complet", "userId"]);

interface SendFromTemplateModalProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

export const SendFromTemplateModal = ({
  template,
  isOpen,
  onClose,
  onSent,
}: SendFromTemplateModalProps) => {
  const { t } = useTranslation("messages");

  const manualVarNames = template.variables.filter(
    (v) => !AUTO_VAR_NAMES.has(v)
  );

  const [step, setStep] = useState<Step>("compose");
  const [manualVars, setManualVars] = useState<Record<string, string>>({});
  const [recipientType, setRecipientType] = useState<RecipientType>("user");
  const [destinataireId, setDestinatataireId] = useState("");
  const [roleCible, setRoleCible] = useState<RoleCible>("member");
  const [envoyeParEmail, setEnvoyeParEmail] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep("compose");
      setManualVars(Object.fromEntries(manualVarNames.map((v) => [v, ""])));
      setRecipientType("user");
      setDestinatataireId("");
      setRoleCible("member");
      setEnvoyeParEmail(false);
      setErrors({});
      setPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (recipientType === "user") {
      if (!destinataireId.trim()) {
        newErrors.destinataire = t("sendFromTemplate.validation.recipientRequired");
      } else if (isNaN(Number(destinataireId)) || Number(destinataireId) <= 0) {
        newErrors.destinataire = t("sendFromTemplate.validation.recipientInvalid");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShowPreview = async () => {
    if (!validate()) return;

    setIsLoadingPreview(true);
    try {
      const result = await previewTemplate(template.id, manualVars);
      setPreview(result);
      setStep("preview");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? t("sendFromTemplate.errors.previewFailed");
      toast.error(msg);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleSend = async () => {
    if (!validate()) {
      setStep("compose");
      return;
    }

    setIsSending(true);
    try {
      const payload: Parameters<typeof sendFromTemplate>[1] = {
        envoye_par_email: envoyeParEmail,
        manual_vars: manualVars,
      };

      if (recipientType === "user") {
        payload.destinataire_id = Number(destinataireId);
      } else if (recipientType === "all") {
        payload.cible = "tous";
      } else if (recipientType === "role") {
        payload.cible = roleCible;
      }

      const result = await sendFromTemplate(template.id, payload);
      toast.success(t("sendFromTemplate.success", { count: result.count }));
      onSent();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? t("sendFromTemplate.errors.sendFailed");
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={!isSending && !isLoadingPreview}
      closeOnEscape={!isSending && !isLoadingPreview}
    >
      {step === "compose" && (
        <SendFromTemplateComposeStep
          template={template}
          manualVarNames={manualVarNames}
          manualVars={manualVars}
          setManualVars={setManualVars}
          recipientType={recipientType}
          setRecipientType={setRecipientType}
          destinataireId={destinataireId}
          setDestinatataireId={setDestinatataireId}
          roleCible={roleCible}
          setRoleCible={setRoleCible}
          envoyeParEmail={envoyeParEmail}
          setEnvoyeParEmail={setEnvoyeParEmail}
          errors={errors}
          setErrors={setErrors}
          isLoadingPreview={isLoadingPreview}
          isSending={isSending}
          handleShowPreview={handleShowPreview}
          handleSend={handleSend}
          onClose={onClose}
        />
      )}

      {step === "preview" && preview && (
        <SendFromTemplatePreviewStep
          preview={preview}
          isSending={isSending}
          handleSend={handleSend}
          setStep={setStep}
          onClose={onClose}
        />
      )}
    </Modal>
  );
};
