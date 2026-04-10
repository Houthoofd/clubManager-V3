/**
 * SendFromTemplateModal.tsx
 * Modal d'envoi depuis un template — flow en 2 étapes :
 *   1. Variables manuelles + destinataires
 *   2. Aperçu (optionnel) → confirmation
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { previewTemplate, sendFromTemplate } from "../api/templatesApi";
import type { Template, PreviewResult } from "../api/templatesApi";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  InfoCircleIcon,
  PaperPlaneIcon,
  PencilAltIcon,
  UsersIcon,
} from "@patternfly/react-icons";

// ─── Types internes ───────────────────────────────────────────────────────────

type RecipientType = "user" | "all" | "role";
type RoleCible = "member" | "professor" | "admin";
type Step = "compose" | "preview";

// ─── Constantes ───────────────────────────────────────────────────────────────

const AUTO_VAR_NAMES = new Set(["prenom", "nom", "nom_complet", "userId"]);

// ─── Props ────────────────────────────────────────────────────────────────────

interface SendFromTemplateModalProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SendFromTemplateModal = ({
  template,
  isOpen,
  onClose,
  onSent,
}: SendFromTemplateModalProps) => {
  // Calcul des variables manuelles (celles non auto)
  const manualVarNames = template.variables.filter(
    (v) => !AUTO_VAR_NAMES.has(v),
  );

  // ── State ───────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("compose");
  const [manualVars, setManualVars] = useState<Record<string, string>>({});
  const [recipientType, setRecipientType] = useState<RecipientType>("user");
  const [destinataireId, setDestinatataireId] = useState("");
  const [roleCible, setRoleCible] = useState<RoleCible>("member");
  const [envoyeParEmail, setEnvoyeParEmail] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preview state
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Send state
  const [isSending, setIsSending] = useState(false);

  // ── Reset on open ───────────────────────────────────────────────────────────
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

  // ── Close on Escape ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSending && !isLoadingPreview) {
        if (step === "preview") {
          setStep("compose");
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isSending, isLoadingPreview, step, onClose]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (recipientType === "user") {
      if (!destinataireId.trim()) {
        newErrors.destinataire = "L'ID du destinataire est obligatoire.";
      } else if (isNaN(Number(destinataireId)) || Number(destinataireId) <= 0) {
        newErrors.destinataire = "L'ID doit être un nombre entier positif.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Charger l'aperçu ────────────────────────────────────────────────────────
  const handleShowPreview = async () => {
    if (!validate()) return;

    setIsLoadingPreview(true);
    try {
      const result = await previewTemplate(template.id, manualVars);
      setPreview(result);
      setStep("preview");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Erreur lors de la génération de l'aperçu.";
      toast.error(msg);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // ── Envoyer ─────────────────────────────────────────────────────────────────
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
      toast.success(
        result.count === 1
          ? "Message envoyé avec succès !"
          : `${result.count} messages envoyés avec succès !`,
      );
      onSent();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Erreur lors de l'envoi.";
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  // ── Guard ────────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  // ── Shared close button ──────────────────────────────────────────────────────
  const CloseButton = () => (
    <button
      type="button"
      onClick={onClose}
      disabled={isSending || isLoadingPreview}
      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Fermer"
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
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={!isSending && !isLoadingPreview ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-template-title"
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ════════════════════════════════════════
              ÉTAPE 1 — Compose
          ════════════════════════════════════════ */}
          {step === "compose" && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <h2
                  id="send-template-title"
                  className="text-base font-semibold text-gray-900 flex items-center gap-2 min-w-0"
                >
                  <PaperPlaneIcon
                    className="flex-shrink-0"
                    style={{ fontSize: "16px" }}
                  />
                  <span className="truncate">
                    Envoyer : « {template.titre} »
                  </span>
                </h2>
                <CloseButton />
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* ── Variables manuelles ── */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <PencilAltIcon style={{ fontSize: "16px" }} />
                    Variables à remplir
                  </h3>

                  {manualVarNames.length === 0 ? (
                    <p className="text-sm text-gray-400 italic bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 flex items-center gap-2">
                      <CheckCircleIcon
                        className="text-green-600 flex-shrink-0"
                        style={{ fontSize: "14px" }}
                      />
                      Aucune variable manuelle pour ce template — prêt à envoyer
                      !
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {manualVarNames.map((varName) => (
                        <div key={varName}>
                          <label
                            htmlFor={`var-${varName}`}
                            className="block text-sm text-gray-600 mb-1"
                          >
                            <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs text-gray-700">
                              {`{{${varName}}}`}
                            </code>
                          </label>
                          <input
                            id={`var-${varName}`}
                            type="text"
                            value={manualVars[varName] ?? ""}
                            onChange={(e) =>
                              setManualVars((prev) => ({
                                ...prev,
                                [varName]: e.target.value,
                              }))
                            }
                            placeholder={`Valeur pour ${varName}…`}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* ── Destinataires ── */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <UsersIcon style={{ fontSize: "16px" }} />
                    Destinataires
                  </h3>

                  {/* Type de destinataire */}
                  <div className="flex flex-wrap gap-4 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="send-recipientType"
                        value="user"
                        checked={recipientType === "user"}
                        onChange={() => {
                          setRecipientType("user");
                          if (errors.destinataire) {
                            setErrors((prev) => {
                              const n = { ...prev };
                              delete n.destinataire;
                              return n;
                            });
                          }
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Un utilisateur
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="send-recipientType"
                        value="all"
                        checked={recipientType === "all"}
                        onChange={() => setRecipientType("all")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Tous</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="send-recipientType"
                        value="role"
                        checked={recipientType === "role"}
                        onChange={() => setRecipientType("role")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Par rôle</span>
                    </label>
                  </div>

                  {/* ID utilisateur */}
                  {recipientType === "user" && (
                    <div>
                      <input
                        type="number"
                        min={1}
                        value={destinataireId}
                        onChange={(e) => {
                          setDestinatataireId(e.target.value);
                          if (errors.destinataire) {
                            setErrors((prev) => {
                              const n = { ...prev };
                              delete n.destinataire;
                              return n;
                            });
                          }
                        }}
                        placeholder="ID utilisateur (numérique)"
                        className={[
                          "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                          errors.destinataire
                            ? "border-red-300 focus:ring-red-200 bg-red-50"
                            : "border-gray-300 focus:ring-blue-200 focus:border-blue-400",
                        ].join(" ")}
                      />
                      {errors.destinataire && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.destinataire}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Sélecteur rôle */}
                  {recipientType === "role" && (
                    <select
                      value={roleCible}
                      onChange={(e) =>
                        setRoleCible(e.target.value as RoleCible)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white transition-colors"
                    >
                      <option value="member">Membres</option>
                      <option value="professor">Professeurs</option>
                      <option value="admin">Admins</option>
                    </select>
                  )}

                  {/* Info broadcast */}
                  {recipientType !== "user" && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <span className="font-medium inline-flex items-center gap-1">
                        <ExclamationTriangleIcon style={{ fontSize: "14px" }} />{" "}
                        Envoi groupé :
                      </span>{" "}
                      {recipientType === "all"
                        ? "Le message sera envoyé à tous les utilisateurs actifs."
                        : `Le message sera envoyé à tous les utilisateurs ayant le rôle « ${roleCible} ».`}
                    </p>
                  )}
                </section>

                {/* ── Envoi par email ── */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={envoyeParEmail}
                    onChange={(e) => setEnvoyeParEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    Envoyer aussi par email
                  </span>
                </label>
              </div>

              {/* Footer étape 1 */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
                <button
                  type="button"
                  onClick={handleShowPreview}
                  disabled={isLoadingPreview || isSending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingPreview ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
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
                      Chargement…
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-4 h-4" />
                      Aperçu
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSending || isLoadingPreview}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isSending || isLoadingPreview}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                  >
                    {isSending ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
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
                        Envoi en cours…
                      </>
                    ) : (
                      <>
                        <PaperPlaneIcon className="w-4 h-4" />
                        Envoyer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════
              ÉTAPE 2 — Aperçu
          ════════════════════════════════════════ */}
          {step === "preview" && preview && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <h2
                  id="send-template-title"
                  className="text-base font-semibold text-gray-900 flex items-center gap-2"
                >
                  <EyeIcon className="w-4 h-4" />
                  Aperçu du message
                </h2>
                <CloseButton />
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Titre du message */}
                {preview.titre && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Titre
                    </p>
                    <p className="text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                      {preview.titre}
                    </p>
                  </div>
                )}

                {/* Contenu du message */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Contenu
                  </p>
                  <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                    {preview.contenu}
                  </div>
                </div>

                {/* Variables manquantes */}
                {preview.missingVariables.length === 0 ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                    <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Toutes les variables sont renseignées — prêt à envoyer.
                    </span>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                      <ExclamationTriangleIcon style={{ fontSize: "14px" }} />
                      Variables manquantes ({preview.missingVariables.length}) :
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {preview.missingVariables.map((v) => (
                        <code
                          key={v}
                          className="text-xs bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded font-mono"
                        >
                          {`{{${v}}}`}
                        </code>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-red-600">
                      Revenez à l'étape précédente pour renseigner ces valeurs.
                    </p>
                  </div>
                )}

                {/* Info destinataire */}
                <div className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <InfoCircleIcon
                    className="flex-shrink-0"
                    style={{ fontSize: "14px" }}
                  />
                  <span>
                    Aperçu généré avec l'exemple :{" "}
                    <span className="font-medium text-gray-600">
                      Jean Dupont (U-2025-0001)
                    </span>
                    . Le contenu réel variera selon le destinataire.
                  </span>
                </div>
              </div>

              {/* Footer étape 2 */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setStep("compose")}
                  disabled={isSending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Retour
                </button>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending || preview.missingVariables.length > 0}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1"
                >
                  {isSending ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
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
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      Confirmer l'envoi
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
