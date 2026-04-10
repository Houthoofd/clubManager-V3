/**
 * ComposeModal.tsx
 * Modal de composition d'un nouveau message
 */

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../shared/hooks/useAuth";
import { UserRole } from "@clubmanager/types";
import { useMessagingStore } from "../stores/messagingStore";
import type { SendMessagePayload } from "../api/messagingApi";
import { getTemplates } from "../api/templatesApi";
import type { Template } from "../api/templatesApi";

// ─── Types ────────────────────────────────────────────────────────────────────

type RecipientType = "user" | "all" | "role";

type RoleCible = "member" | "professor" | "admin";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onSent,
}) => {
  const { user } = useAuth();
  const sendMessage = useMessagingStore((s) => s.sendMessage);
  const isSending = useMessagingStore((s) => s.isSending);

  const userRole = (user?.role_app ?? UserRole.MEMBER) as UserRole;
  const canBroadcast =
    userRole === UserRole.ADMIN || userRole === UserRole.PROFESSOR;

  // ── Form state ────────────────────────────────────────────────────────────
  const [recipientType, setRecipientType] = useState<RecipientType>("user");
  const [destinataireId, setDestinatarioId] = useState<string>("");
  const [roleCible, setRoleCible] = useState<RoleCible>("member");
  const [sujet, setSujet] = useState("");
  const [contenu, setContenu] = useState("");
  const [envoyeParEmail, setEnvoyeParEmail] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Template picker state ─────────────────────────────────────────────────
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTemplates, setPickerTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const groupedPickerTemplates = useMemo(
    () =>
      pickerTemplates.reduce<Record<string, Template[]>>((acc, t) => {
        const key = t.type_nom ?? "Sans catégorie";
        if (!acc[key]) acc[key] = [];
        acc[key].push(t);
        return acc;
      }, {}),
    [pickerTemplates],
  );

  // ── Reset form when modal opens ───────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setRecipientType("user");
      setDestinatarioId("");
      setRoleCible("member");
      setSujet("");
      setContenu("");
      setEnvoyeParEmail(false);
      setErrors({});
      setIsPickerOpen(false);
      setPickerTemplates([]);
    }
  }, [isOpen]);

  // ── Close on Escape ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSending) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSending, onClose]);

  // ── Template Picker ───────────────────────────────────────────────────────
  const loadTemplates = async () => {
    if (pickerTemplates.length > 0) return; // already loaded
    setIsLoadingTemplates(true);
    try {
      const tpls = await getTemplates(undefined, true);
      setPickerTemplates(tpls);
    } catch {
      toast.error("Impossible de charger les templates.");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleOpenPicker = () => {
    const next = !isPickerOpen;
    setIsPickerOpen(next);
    if (next) loadTemplates();
  };

  const handleSelectTemplate = (template: Template) => {
    setSujet(template.titre);
    setContenu(template.contenu);
    setIsPickerOpen(false);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.contenu;
      return next;
    });
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!contenu.trim()) {
      newErrors.contenu = "Le contenu du message est obligatoire.";
    }

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

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload: SendMessagePayload = {
      contenu: contenu.trim(),
      envoye_par_email: envoyeParEmail,
    };

    if (sujet.trim()) {
      payload.sujet = sujet.trim();
    }

    if (recipientType === "user") {
      payload.destinataire_id = Number(destinataireId);
    } else if (recipientType === "all") {
      payload.cible = "tous";
    } else if (recipientType === "role") {
      payload.cible = roleCible;
    }

    try {
      await sendMessage(payload);
      toast.success("Message envoyé avec succès !");
      onSent();
      onClose();
    } catch {
      // L'erreur est déjà affichée via le store ou toast
      toast.error("Une erreur est survenue lors de l'envoi.");
    }
  };

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

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
        aria-labelledby="compose-modal-title"
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2
              id="compose-modal-title"
              className="text-lg font-semibold text-gray-900 flex items-center gap-2"
            >
              <span>✏️</span>
              Nouveau message
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
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
          </div>

          {/* ── Form ── */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-y-auto"
            noValidate
          >
            <div className="px-6 py-5 space-y-5 flex-1">
              {/* ── Template Picker ── */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleOpenPicker}
                  className={[
                    "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border rounded-lg transition-colors",
                    isPickerOpen
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-blue-200 bg-blue-50/40 text-blue-600 hover:bg-blue-50 hover:border-blue-300",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2">
                    <span>📋</span>
                    <span className="font-medium">Utiliser un template</span>
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={[
                      "w-4 h-4 transition-transform",
                      isPickerOpen ? "rotate-180" : "",
                    ].join(" ")}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isPickerOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 border border-gray-200 rounded-lg bg-white shadow-xl z-10 overflow-hidden max-h-64 overflow-y-auto">
                    {isLoadingTemplates ? (
                      <div className="flex items-center justify-center gap-2 py-6 text-gray-400 text-sm">
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
                        Chargement des templates…
                      </div>
                    ) : pickerTemplates.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6 px-4">
                        Aucun template actif disponible.
                      </p>
                    ) : (
                      Object.entries(groupedPickerTemplates).map(
                        ([typeName, tpls]) => (
                          <div key={typeName}>
                            <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-t border-gray-100 sticky top-0">
                              {typeName}
                            </p>
                            {tpls.map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => handleSelectTemplate(t)}
                                className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 group"
                              >
                                <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 truncate">
                                  {t.titre}
                                </p>
                                <p className="text-xs text-gray-400 truncate mt-0.5 font-mono">
                                  {t.contenu.slice(0, 80)}
                                  {t.contenu.length > 80 ? "…" : ""}
                                </p>
                              </button>
                            ))}
                          </div>
                        ),
                      )
                    )}
                  </div>
                )}
              </div>

              {/* ── Destinataire ── */}
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  Destinataire
                </legend>

                {/* Type de destinataire */}
                <div className="flex flex-wrap gap-4">
                  {/* Option : Un utilisateur (toujours visible) */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recipientType"
                      value="user"
                      checked={recipientType === "user"}
                      onChange={() => setRecipientType("user")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Un utilisateur
                    </span>
                  </label>

                  {/* Options broadcast — admin/professor seulement */}
                  {canBroadcast && (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recipientType"
                          value="all"
                          checked={recipientType === "all"}
                          onChange={() => setRecipientType("all")}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          Tous les membres
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recipientType"
                          value="role"
                          checked={recipientType === "role"}
                          onChange={() => setRecipientType("role")}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Par rôle</span>
                      </label>
                    </>
                  )}
                </div>

                {/* Champ ID utilisateur */}
                {recipientType === "user" && (
                  <div className="mt-3">
                    <label
                      htmlFor="destinataire-id"
                      className="block text-sm text-gray-600 mb-1"
                    >
                      ID numérique de l'utilisateur{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="destinataire-id"
                      type="number"
                      min={1}
                      value={destinataireId}
                      onChange={(e) => {
                        setDestinatarioId(e.target.value);
                        if (errors.destinataire) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.destinataire;
                            return next;
                          });
                        }
                      }}
                      placeholder="Entrez l'ID numérique de l'utilisateur"
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

                {/* Sélecteur de rôle */}
                {recipientType === "role" && (
                  <div className="mt-3">
                    <label
                      htmlFor="role-cible"
                      className="block text-sm text-gray-600 mb-1"
                    >
                      Rôle cible
                    </label>
                    <select
                      id="role-cible"
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
                  </div>
                )}
              </fieldset>

              {/* ── Sujet (optionnel) ── */}
              <div>
                <label
                  htmlFor="sujet"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sujet{" "}
                  <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  id="sujet"
                  type="text"
                  value={sujet}
                  onChange={(e) => setSujet(e.target.value)}
                  placeholder="Objet du message"
                  maxLength={200}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                />
              </div>

              {/* ── Contenu ── */}
              <div>
                <label
                  htmlFor="contenu"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contenu"
                  value={contenu}
                  onChange={(e) => {
                    setContenu(e.target.value);
                    if (errors.contenu) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.contenu;
                        return next;
                      });
                    }
                  }}
                  placeholder="Écrivez votre message ici…"
                  rows={6}
                  className={[
                    "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-y min-h-[120px]",
                    errors.contenu
                      ? "border-red-300 focus:ring-red-200 bg-red-50"
                      : "border-gray-300 focus:ring-blue-200 focus:border-blue-400",
                  ].join(" ")}
                />
                {errors.contenu && (
                  <p className="mt-1 text-xs text-red-600">{errors.contenu}</p>
                )}
              </div>

              {/* ── Envoi par email (admin/professor seulement) ── */}
              {canBroadcast && (
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
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSending}
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
                    <span>📤</span>
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ComposeModal;
