/**
 * SendToUserModal.tsx
 * Modal pour envoyer un message à un utilisateur individuel depuis la liste des membres
 */

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { UserListItemDto } from "@clubmanager/types";
import { sendMessage } from "../../messaging/api/messagingApi";
import {
  getTemplates,
  previewTemplate,
  sendFromTemplate,
} from "../../messaging/api/templatesApi";
import type { Template, PreviewResult } from "../../messaging/api/templatesApi";

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "custom" | "template";

const AUTO_RESOLVED_VARS = ["prenom", "nom", "nom_complet", "userId"];

interface SendToUserModalProps {
  user: UserListItemDto | null;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SendToUserModal: React.FC<SendToUserModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation("users");

  // ── Mode & loading ────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("custom");
  const [isSending, setIsSending] = useState(false);

  // ── Custom message state ──────────────────────────────────────────────────
  const [sujet, setSujet] = useState("");
  const [contenu, setContenu] = useState("");
  const [envoyeParEmail, setEnvoyeParEmail] = useState(false);
  const [contenuError, setContenuError] = useState("");

  // ── Template state ────────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [manualVars, setManualVars] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────

  const groupedTemplates = useMemo(
    () =>
      templates.reduce<Record<string, Template[]>>((acc, tpl) => {
        const key = tpl.type_nom ?? t("sendMessage.uncategorized");
        if (!acc[key]) acc[key] = [];
        acc[key].push(tpl);
        return acc;
      }, {}),
    [templates],
  );

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId],
  );

  const manualVarNames = useMemo(
    () =>
      selectedTemplate
        ? selectedTemplate.variables.filter(
            (v) => !AUTO_RESOLVED_VARS.includes(v),
          )
        : [],
    [selectedTemplate],
  );

  // ── Reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setMode("custom");
      setIsSending(false);
      setSujet("");
      setContenu("");
      setEnvoyeParEmail(false);
      setContenuError("");
      setTemplates([]);
      setIsLoadingTemplates(false);
      setSelectedTemplateId(null);
      setManualVars({});
      setPreview(null);
      setIsPreviewing(false);
    }
  }, [isOpen]);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSending) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSending, onClose]);

  // ── Mode switch ───────────────────────────────────────────────────────────
  const handleModeSwitch = async (newMode: Mode) => {
    setMode(newMode);
    if (newMode === "template" && templates.length === 0) {
      setIsLoadingTemplates(true);
      try {
        const tpls = await getTemplates(undefined, true);
        setTemplates(tpls);
      } catch {
        toast.error(t("messages:errors.loadModels"));
      } finally {
        setIsLoadingTemplates(false);
      }
    }
  };

  // ── Template handlers ─────────────────────────────────────────────────────
  const handleTemplateSelect = (id: number) => {
    setSelectedTemplateId(id);
    setManualVars({});
    setPreview(null);
  };

  const handlePreview = async () => {
    if (!selectedTemplateId) return;
    setIsPreviewing(true);
    try {
      const result = await previewTemplate(selectedTemplateId, manualVars);
      setPreview(result);
    } catch {
      toast.error(t("messages:errors.generatePreview"));
    } finally {
      setIsPreviewing(false);
    }
  };

  // ── Submit handlers ───────────────────────────────────────────────────────
  const handleSendCustom = async () => {
    if (!user) return;
    if (!contenu.trim()) {
      setContenuError(t("sendMessage.messageRequired"));
      return;
    }
    setIsSending(true);
    try {
      await sendMessage({
        destinataire_id: user.id,
        sujet: sujet.trim() || undefined,
        contenu: contenu.trim(),
        envoye_par_email: envoyeParEmail,
      });
      toast.success(t("messages:success.messageSent"), {
        description: t("sendMessage.messageSent", {
          name: `${user.first_name} ${user.last_name}`,
        }),
      });
      onClose();
    } catch {
      toast.error(t("messages:errors.sendError"));
    } finally {
      setIsSending(false);
    }
  };

  const handleSendFromTemplate = async () => {
    if (!user || !selectedTemplateId) return;
    setIsSending(true);
    try {
      await sendFromTemplate(selectedTemplateId, {
        destinataire_id: user.id,
        manual_vars: manualVars,
        envoye_par_email: envoyeParEmail,
      });
      toast.success(t("messages:success.messageSent"), {
        description: t("sendMessage.messageSent", {
          name: `${user.first_name} ${user.last_name}`,
        }),
      });
      onClose();
    } catch {
      toast.error(t("messages:errors.sendError"));
    } finally {
      setIsSending(false);
    }
  };

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!isOpen || !user) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={!isSending ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-to-user-modal-title"
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2
              id="send-to-user-modal-title"
              className="text-lg font-semibold text-gray-900 flex items-center gap-2"
            >
              <EnvelopeIcon className="w-5 h-5 text-blue-600" />
              {t("sendMessage.title")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t("sendMessage.close")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-5">
              {/* ── Mode tabs (pill) ── */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleModeSwitch("custom")}
                  className={[
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    mode === "custom"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  {t("sendMessage.modes.custom")}
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch("template")}
                  className={[
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    mode === "template"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  {t("sendMessage.modes.template")}
                </button>
              </div>

              {/* ── Recipient badge ── */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t("sendMessage.recipient")}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <UserIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-blue-800">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="text-xs text-blue-400 truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* ══ Mode 1: Custom message ══ */}
              {mode === "custom" && (
                <>
                  {/* Sujet */}
                  <div>
                    <label
                      htmlFor="stu-sujet"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t("sendMessage.subject")}{" "}
                      <span className="text-gray-400 font-normal">
                        {t("sendMessage.subjectOptional")}
                      </span>
                    </label>
                    <input
                      id="stu-sujet"
                      type="text"
                      value={sujet}
                      onChange={(e) => setSujet(e.target.value)}
                      placeholder={t("sendMessage.subjectPlaceholder")}
                      maxLength={200}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                    />
                  </div>

                  {/* Contenu */}
                  <div>
                    <label
                      htmlFor="stu-contenu"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {t("sendMessage.message")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="stu-contenu"
                      value={contenu}
                      onChange={(e) => {
                        setContenu(e.target.value);
                        if (contenuError) setContenuError("");
                      }}
                      placeholder={t("sendMessage.messagePlaceholder")}
                      rows={5}
                      className={[
                        "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-y min-h-[120px]",
                        contenuError
                          ? "border-red-300 focus:ring-red-200 bg-red-50"
                          : "border-gray-300 focus:ring-blue-200 focus:border-blue-400",
                      ].join(" ")}
                    />
                    {contenuError && (
                      <p className="mt-1 text-xs text-red-600">
                        {contenuError}
                      </p>
                    )}
                  </div>

                  {/* Email toggle */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={envoyeParEmail}
                      onChange={(e) => setEnvoyeParEmail(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      {t("sendMessage.sendByEmail")}
                    </span>
                  </label>
                </>
              )}

              {/* ══ Mode 2: From template ══ */}
              {mode === "template" && (
                <>
                  {isLoadingTemplates ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-gray-400 text-sm">
                      <SpinnerIcon className="w-4 h-4 animate-spin" />
                      {t("sendMessage.loadingTemplates")}
                    </div>
                  ) : templates.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">
                      {t("sendMessage.noActiveTemplates")}
                    </p>
                  ) : (
                    <>
                      {/* Template select grouped by type */}
                      <div>
                        <label
                          htmlFor="stu-template-select"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("sendMessage.chooseTemplate")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="stu-template-select"
                          value={selectedTemplateId ?? ""}
                          onChange={(e) =>
                            handleTemplateSelect(Number(e.target.value))
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white transition-colors"
                        >
                          <option value="" disabled>
                            {t("sendMessage.selectTemplatePlaceholder")}
                          </option>
                          {Object.entries(groupedTemplates).map(
                            ([typeName, tpls]) => (
                              <optgroup key={typeName} label={typeName}>
                                {tpls.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.titre}
                                  </option>
                                ))}
                              </optgroup>
                            ),
                          )}
                        </select>
                      </div>

                      {/* Manual variable inputs */}
                      {selectedTemplate && manualVarNames.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700">
                            {t("sendMessage.variablesToFill")}
                          </p>
                          {manualVarNames.map((varName) => (
                            <div key={varName}>
                              <label
                                htmlFor={`stu-var-${varName}`}
                                className="block text-sm text-gray-600 mb-1"
                              >
                                {varName}{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                id={`stu-var-${varName}`}
                                type="text"
                                value={manualVars[varName] ?? ""}
                                onChange={(e) =>
                                  setManualVars((prev) => ({
                                    ...prev,
                                    [varName]: e.target.value,
                                  }))
                                }
                                placeholder={t(
                                  "sendMessage.variablePlaceholder",
                                  {
                                    variable: varName,
                                  },
                                )}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Preview button — only when a template is selected */}
                      {selectedTemplate && (
                        <div>
                          <button
                            type="button"
                            onClick={handlePreview}
                            disabled={isPreviewing}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isPreviewing ? (
                              <SpinnerIcon className="w-4 h-4 animate-spin" />
                            ) : (
                              <DocumentTextIcon className="w-4 h-4" />
                            )}
                            {t("sendMessage.previewButton")}
                          </button>
                        </div>
                      )}

                      {/* Preview card */}
                      {preview && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
                          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                            {t("sendMessage.previewTitle")}
                          </p>
                          {preview.titre && (
                            <p className="text-sm font-medium text-gray-800">
                              {preview.titre}
                            </p>
                          )}
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {preview.contenu}
                          </p>
                          {preview.missingVariables.length > 0 && (
                            <p className="text-xs text-amber-600 font-medium">
                              {t("sendMessage.missingVariables")}{" "}
                              {preview.missingVariables.join(", ")}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Email toggle */}
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={envoyeParEmail}
                          onChange={(e) => setEnvoyeParEmail(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          {t("sendMessage.sendByEmail")}
                        </span>
                      </label>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("sendMessage.cancel")}
            </button>
            <button
              type="button"
              onClick={
                mode === "custom" ? handleSendCustom : handleSendFromTemplate
              }
              disabled={
                isSending ||
                (mode === "template" && selectedTemplateId === null)
              }
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
            >
              {isSending ? (
                <>
                  <SpinnerIcon className="w-4 h-4 animate-spin" />
                  {t("sendMessage.sending")}
                </>
              ) : (
                <>
                  <EnvelopeIcon className="w-4 h-4" />
                  {t("sendMessage.send")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
