/**
 * ComposeModal.tsx
 * Modal de composition d'un nouveau message
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../../../shared/hooks/useAuth";
import { UserRole } from "@clubmanager/types";
import { useMessagingStore } from "../stores/messagingStore";
import type { SendMessagePayload } from "../api/messagingApi";
import { getTemplates } from "../api/templatesApi";
import { getUsers, type UserListItemDto } from "../../users/api/usersApi";
import type { Template } from "../api/templatesApi";
import { PaperPlaneIcon, PficonTemplateIcon } from "@patternfly/react-icons";
import { Modal, Input, Button, FormField } from "../../../shared/components";
import { FORM } from "../../../shared/styles/designTokens";

// ─── Types ────────────────────────────────────────────────────────────────────

type RecipientType = "user" | "all" | "role";

type RoleCible = "member" | "professor" | "admin";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────


// ==================== COMPOSANT DE SELECTION D'UTILISATEUR ====================
const UserSelect = ({
  value,
  onChange,
  error
}: {
  value: string;
  onChange: (id: string, name: string) => void;
  error?: string;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserListItemDto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation("messages");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Synchroniser searchTerm avec value initiale (quand le modal se rinitialise)
  useEffect(() => {
    if (value === "") {
      setSearchTerm("");
    }
  }, [value]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      setIsLoading(true);
      const timer = setTimeout(async () => {
        try {
          const res = await getUsers({ search: searchTerm, limit: 10 });
          setUsers(res.users);
          setIsOpen(true);
        } catch (e) {}
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setUsers([]);
      setIsOpen(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id="destinataire-search"
        type="text"
        placeholder="Rechercher par nom, prnom..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (value !== "") onChange("", ""); // Rinitialiser la slection
        }}
        onFocus={() => {
          if (users.length > 0) setIsOpen(true);
        }}
        className={error ? "border-red-500" : ""}
      />
      {isLoading && <div className="absolute right-3 top-2.5 text-xs text-gray-400">Recherche...</div>}
      
      {isOpen && users.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {users.map((u) => (
            <li
              key={u.id}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
              onMouseDown={(e) => {
                e.preventDefault();
                setSearchTerm(`${u.first_name} ${u.last_name}`);
                onChange(String(u.id), `${u.first_name} ${u.last_name}`);
                setIsOpen(false);
              }}
            >
              <div className="font-medium text-gray-800">{u.first_name} {u.last_name}</div>
              <div className="text-xs text-gray-500">{u.email}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
// ============================================================================

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onSent,
}) => {
  const { t } = useTranslation("messages");
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
  const [sendMethod, setSendMethod] = useState<"internal" | "email" | "both">("internal");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Template picker state ─────────────────────────────────────────────────
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTemplates, setPickerTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const groupedPickerTemplates = useMemo(
    () =>
      pickerTemplates.reduce<Record<string, Template[]>>((acc, tpl) => {
        const key = tpl.type_nom ?? t("compose.noCategory");
        if (!acc[key]) acc[key] = [];
        acc[key].push(tpl);
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
      setSendMethod("internal");
      setErrors({});
      setIsPickerOpen(false);
      setPickerTemplates([]);
    }
  }, [isOpen]);

  // ── Template Picker ───────────────────────────────────────────────────────
  const loadTemplates = async () => {
    if (pickerTemplates.length > 0) return; // already loaded
    setIsLoadingTemplates(true);
    try {
      const tpls = await getTemplates(undefined, true);
      setPickerTemplates(tpls);
    } catch {
      toast.error(t("errors.loadTemplates"));
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
      newErrors.contenu = t("errors.contentRequired");
    }

    if (recipientType === "user") {
      if (!destinataireId.trim()) {
        newErrors.destinataire = t("errors.recipientRequired");
      } else if (isNaN(Number(destinataireId)) || Number(destinataireId) <= 0) {
        newErrors.destinataire = t("errors.recipientRequired");
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
      envoye_par_email: sendMethod === "email" || sendMethod === "both",
        envoye_en_interne: sendMethod === "internal" || sendMethod === "both",
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
      toast.success(t("compose.sent"));
      onSent();
      onClose();
    } catch {
      // L'erreur est déjà affichée via le store ou toast
      toast.error(t("compose.error"));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header title={t("compose.title")} onClose={onClose} />

      <Modal.Body>
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
          id="compose-message-form"
        >
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
                <PficonTemplateIcon style={{ fontSize: "16px" }} />
                <span className="font-medium">{t("actions.useTemplate")}</span>
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
                    {t("loading.templates")}
                  </div>
                ) : pickerTemplates.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6 px-4">
                    {t("templates.emptyDescription")}
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
                            className="w-full text-left px-3 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 group"
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
              {t("compose.recipient")}
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
                  {t("compose.individual")}
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
                      {t("compose.broadcast")}
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
                    <span className="text-sm text-gray-700">
                      {t("roles.all")}
                    </span>
                  </label>
                </>
              )}
            </div>

            {/* Champ ID utilisateur */}
            {recipientType === "user" && (
              <div className="mt-3">
                <FormField
                  id="destinataire-id"
                  label={t("compose.recipient")}
                  required
                  error={errors.destinataire}
                >
                  <UserSelect
                    value={destinataireId}
                    onChange={(id, name) => {
                      setDestinatarioId(id);
                      if (errors.destinataire) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.destinataire;
                          return next;
                        });
                      }
                    }}
                    error={errors.destinataire}
                  />
                </FormField>
              </div>
            )}

            {/* Sélecteur de rôle */}
            {recipientType === "role" && (
              <div className="mt-3">
                <FormField id="role-cible" label={t("compose.targetRole")}>
                  <select
                    id="role-cible"
                    className={FORM.select}
                    value={roleCible}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setRoleCible(e.target.value as RoleCible)
                    }
                  >
                    <option value="member">{t("roles.member")}</option>
                    <option value="professor">{t("roles.professor")}</option>
                    <option value="admin">{t("roles.admin")}</option>
                  </select>
                </FormField>
              </div>
            )}
          </fieldset>

          {/* ── Sujet (optionnel) ── */}
          <FormField
            id="sujet"
            label={t("compose.subject")}
            helpText={t("compose.optional")}
          >
            <Input
              id="sujet"
              type="text"
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              placeholder={t("compose.subjectPlaceholder")}
              maxLength={200}
            />
          </FormField>

          {/* ── Contenu ── */}
          <FormField
            id="contenu"
            label={t("compose.content")}
            required
            error={errors.contenu}
          >
            <div className="relative">
              <textarea
                id="contenu"
                className={FORM.select}
                value={contenu}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setContenu(e.target.value);
                  if (errors.contenu) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.contenu;
                      return next;
                    });
                  }
                }}
                placeholder={t("compose.contentPlaceholder")}
                rows={6}
                maxLength={2000}
              />
              <div className="mt-1 text-right text-xs text-gray-500">
                {contenu.length} / 2000
              </div>
            </div>
          </FormField>

          
          {/* Mode d'envoi */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">Mode d'envoi</legend>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sendMethod"
                  value="internal"
                  checked={sendMethod === "internal"}
                  onChange={() => setSendMethod("internal")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Messagerie interne uniquement</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sendMethod"
                  value="email"
                  checked={sendMethod === "email"}
                  onChange={() => setSendMethod("email")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Email uniquement</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sendMethod"
                  value="both"
                  checked={sendMethod === "both"}
                  onChange={() => setSendMethod("both")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Les deux (Interne + Email)</span>
              </label>
            </div>
          </fieldset>

              </span>
            </label>
          )}
        </form>
      </Modal.Body>

      <Modal.Footer align="right">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSending}
        >
          {t("actions.cancel")}
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={isSending}
          loading={isSending}
          icon={!isSending ? <PaperPlaneIcon /> : undefined}
          form="compose-message-form"
          data-testid="compose-submit-btn"
        >
          {isSending ? t("compose.sending") : t("actions.send")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
