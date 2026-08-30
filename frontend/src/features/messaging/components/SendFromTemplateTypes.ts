import type { Template, PreviewResult } from "../api/templatesApi";

export type RecipientType = "user" | "all" | "role";
export type RoleCible = "member" | "professor" | "admin";
export type Step = "compose" | "preview";

export interface SendFromTemplateComposeProps {
  template: Template;
  manualVarNames: string[];
  manualVars: Record<string, string>;
  setManualVars: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  recipientType: RecipientType;
  setRecipientType: (type: RecipientType) => void;
  destinataireId: string;
  setDestinatataireId: (id: string) => void;
  roleCible: RoleCible;
  setRoleCible: (role: RoleCible) => void;
  envoyeParEmail: boolean;
  setEnvoyeParEmail: (val: boolean) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isLoadingPreview: boolean;
  isSending: boolean;
  handleShowPreview: () => void;
  handleSend: () => void;
  onClose: () => void;
}

export interface SendFromTemplatePreviewProps {
  preview: PreviewResult;
  isSending: boolean;
  handleSend: () => void;
  setStep: (step: Step) => void;
  onClose: () => void;
}
