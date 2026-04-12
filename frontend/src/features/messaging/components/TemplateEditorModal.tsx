/**
 * TemplateEditorModal.tsx
 * Modal de création / modification d'un template — layout 2 colonnes avec aperçu temps réel
 */

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { createTemplate, updateTemplate } from "../api/templatesApi";
import type { Template, TemplateType } from "../api/templatesApi";
import {
  CheckCircleIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  PencilAltIcon,
  PlusCircleIcon,
  SaveIcon,
} from "@patternfly/react-icons";

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTO_VARS: Record<string, string> = {
  prenom: "Jean",
  nom: "Dupont",
  nom_complet: "Jean Dupont",
  userId: "U-2025-0001",
};

const VAR_REGEX = /\{\{(\w+)\}\}/g;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extrait la liste de toutes les variables {{...}} uniques du texte */
function extractVariables(text: string): string[] {
  const matches = new Set<string>();
  let m: RegExpExecArray | null;
  const re = new RegExp(VAR_REGEX.source, "g");
  while ((m = re.exec(text)) !== null) {
    matches.add(m[1]!);
  }
  return Array.from(matches);
}

/** Génère le HTML de l'aperçu avec remplacement des variables */
function buildPreviewHtml(text: string): string {
  // Échapper le HTML d'abord
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(/\{\{(\w+)\}\}/g, (_match, varName: string) => {
    if (AUTO_VARS[varName] !== undefined) {
      return `<span class="text-blue-700 font-medium">${AUTO_VARS[varName]}</span>`;
    }
    return `<span class="inline-block bg-yellow-100 text-yellow-800 border border-yellow-300 rounded px-1 text-xs font-mono">[${varName}]</span>`;
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TemplateEditorModalProps {
  template?: Template;
  types: TemplateType[];
  defaultTypeId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TemplateEditorModal = ({
  template,
  types,
  defaultTypeId,
  isOpen,
  onClose,
  onSaved,
}: TemplateEditorModalProps) => {
  const isEditing = Boolean(template);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [typeId, setTypeId] = useState<number | "">("");
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [actif, setActif] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Sync when opening ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTypeId(template?.type_id ?? defaultTypeId ?? types[0]?.id ?? "");
      setTitre(template?.titre ?? "");
      setContenu(template?.contenu ?? "");
      setActif(template?.actif ?? true);
      setErrors({});
      setIsSaving(false);
    }
  }, [isOpen, template, types]);

  // ── Close on Escape ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSaving) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isSaving, onClose]);

  // ── Derived: variables détectées ────────────────────────────────────────────
  const detectedVars = useMemo(() => extractVariables(contenu), [contenu]);

  const autoVars = useMemo(
    () => detectedVars.filter((v) => AUTO_VARS[v] !== undefined),
    [detectedVars],
  );
  const manualVars = useMemo(
    () => detectedVars.filter((v) => AUTO_VARS[v] === undefined),
    [detectedVars],
  );

  // ── Derived: aperçu HTML ────────────────────────────────────────────────────
  const previewTitre = useMemo(
    () =>
      titre.replace(
        /\{\{(\w+)\}\}/g,
        (_m, v: string) => AUTO_VARS[v] ?? `[${v}]`,
      ),
    [titre],
  );

  const previewHtml = useMemo(() => buildPreviewHtml(contenu), [contenu]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (typeId === "")
      newErrors.typeId = "Veuillez sélectionner une catégorie.";
    if (!titre.trim()) newErrors.titre = "Le titre est obligatoire.";
    else if (titre.trim().length > 200)
      newErrors.titre = "Le titre ne doit pas dépasser 200 caractères.";
    if (!contenu.trim()) newErrors.contenu = "Le contenu est obligatoire.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      if (isEditing && template) {
        await updateTemplate(template.id, {
          type_id: typeId as number,
          titre: titre.trim(),
          contenu: contenu.trim(),
          actif,
        });
        toast.success("Template mis à jour.");
      } else {
        await createTemplate({
          type_id: typeId as number,
          titre: titre.trim(),
          contenu: contenu.trim(),
          actif,
        });
        toast.success("Template créé avec succès.");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Une erreur est survenue.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Guard ────────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={!isSaving ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal — très large pour accueillir les 2 colonnes */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-editor-title"
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2
              id="template-editor-title"
              className="text-base font-semibold text-gray-900 flex items-center gap-2"
            >
              {isEditing ? (
                <PencilAltIcon style={{ fontSize: "16px" }} />
              ) : (
                <PlusCircleIcon style={{ fontSize: "16px" }} />
              )}
              {isEditing
                ? `Modifier « ${template!.titre} »`
                : "Nouveau template"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
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

          {/* ── Scrollable body ── */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* ── Ligne : Catégorie + Titre ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Catégorie */}
                <div>
                  <label
                    htmlFor="tpl-type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="tpl-type"
                    value={typeId}
                    onChange={(e) => {
                      setTypeId(Number(e.target.value));
                      if (errors.typeId)
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.typeId;
                          return n;
                        });
                    }}
                    className={[
                      "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white",
                      errors.typeId
                        ? "border-red-300 focus:ring-red-200 bg-red-50"
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400",
                    ].join(" ")}
                  >
                    <option value="">— Choisir une catégorie —</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nom}
                      </option>
                    ))}
                  </select>
                  {errors.typeId && (
                    <p className="mt-1 text-xs text-red-600">{errors.typeId}</p>
                  )}
                </div>

                {/* Titre */}
                <div>
                  <label
                    htmlFor="tpl-titre"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="tpl-titre"
                    type="text"
                    value={titre}
                    onChange={(e) => {
                      setTitre(e.target.value);
                      if (errors.titre)
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.titre;
                          return n;
                        });
                    }}
                    placeholder="Ex : Email de bienvenue"
                    maxLength={200}
                    className={[
                      "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                      errors.titre
                        ? "border-red-300 focus:ring-red-200 bg-red-50"
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400",
                    ].join(" ")}
                  />
                  {errors.titre && (
                    <p className="mt-1 text-xs text-red-600">{errors.titre}</p>
                  )}
                </div>
              </div>

              {/* ── Colonnes : Contenu | Aperçu ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Colonne gauche : éditeur */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="tpl-contenu"
                      className="text-sm font-medium text-gray-700"
                    >
                      Contenu <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-400">
                      Utilisez{" "}
                      <code className="bg-gray-100 px-1 rounded text-gray-600 font-mono text-xs">
                        {"{{"} variable {"}}"}
                      </code>{" "}
                      pour les variables
                    </span>
                  </div>
                  <textarea
                    id="tpl-contenu"
                    value={contenu}
                    onChange={(e) => {
                      setContenu(e.target.value);
                      if (errors.contenu)
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.contenu;
                          return n;
                        });
                    }}
                    placeholder={`Bonjour {{prenom}},\n\nVotre message ici…`}
                    rows={10}
                    className={[
                      "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-y font-mono",
                      errors.contenu
                        ? "border-red-300 focus:ring-red-200 bg-red-50"
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400",
                    ].join(" ")}
                  />
                  {errors.contenu && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.contenu}
                    </p>
                  )}
                </div>

                {/* Colonne droite : aperçu */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium text-gray-700">
                      Aperçu
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Temps réel
                    </span>
                  </div>
                  <div className="flex-1 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                    {contenu.trim() === "" && titre.trim() === "" ? (
                      <div className="flex items-center justify-center h-full min-h-[200px] text-gray-400 text-sm">
                        <div className="text-center">
                          <div
                            className="text-gray-300 mb-2 flex justify-center"
                            style={{ fontSize: "48px" }}
                          >
                            <EyeIcon />
                          </div>
                          L'aperçu apparaît ici
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 h-full min-h-[200px] overflow-y-auto">
                        {/* Titre preview */}
                        {previewTitre && (
                          <p className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                            {previewTitre}
                          </p>
                        )}
                        {/* Contenu preview avec variables remplacées */}
                        <div
                          className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Variables détectées ── */}
              {detectedVars.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                    Variables détectées
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {autoVars.map((v) => (
                      <div
                        key={v}
                        className="flex items-center gap-1.5 bg-white border border-green-200 rounded-lg px-2.5 py-1.5 shadow-sm"
                      >
                        <CheckCircleIcon
                          className="text-green-600"
                          style={{ fontSize: "12px" }}
                        />
                        <code className="text-xs font-mono text-gray-700">{`{{${v}}}`}</code>
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                          Auto
                        </span>
                      </div>
                    ))}
                    {manualVars.map((v) => (
                      <div
                        key={v}
                        className="flex items-center gap-1.5 bg-white border border-orange-200 rounded-lg px-2.5 py-1.5 shadow-sm"
                      >
                        <PencilAltIcon
                          className="text-orange-500"
                          style={{ fontSize: "12px" }}
                        />
                        <code className="text-xs font-mono text-gray-700">{`{{${v}}}`}</code>
                        <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                          Manuel
                        </span>
                      </div>
                    ))}
                  </div>
                  {manualVars.length > 0 && (
                    <p className="mt-2.5 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                      <span className="font-medium flex items-center gap-1">
                        <ExclamationTriangleIcon style={{ fontSize: "12px" }} />
                        Variables manuelles :
                      </span>{" "}
                      Ces variables devront être renseignées manuellement à
                      chaque envoi.
                    </p>
                  )}
                </div>
              )}

              {detectedVars.length === 0 && contenu.trim() !== "" && (
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <InfoCircleIcon style={{ fontSize: "12px" }} />
                  Aucune variable détectée. Utilisez{" "}
                  <code className="bg-gray-100 px-1 rounded font-mono">{`{{prenom}}`}</code>
                  ,{" "}
                  <code className="bg-gray-100 px-1 rounded font-mono">{`{{nom}}`}</code>
                  , etc. pour personnaliser le message.
                </p>
              )}

              {/* ── Checkbox actif ── */}
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <input
                  type="checkbox"
                  checked={actif}
                  onChange={(e) => setActif(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  Template actif
                </span>
              </label>
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
              >
                {isSaving ? (
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
                    Enregistrement…
                  </>
                ) : (
                  <>
                    <SaveIcon className="w-4 h-4" />
                    Enregistrer
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
