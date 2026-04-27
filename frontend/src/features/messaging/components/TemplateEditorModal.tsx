/**
 * TemplateEditorModal.tsx
 * Modal de création / modification d'un template — layout 2 colonnes avec aperçu temps réel
 * MIGRÉ vers composants centralisés (Modal, Input, Button)
 */

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { createTemplate, updateTemplate } from "../api/templatesApi";
import type { Template, TemplateType } from "../api/templatesApi";
import {
  CheckCircleIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  PencilAltIcon,
  SaveIcon,
} from "@patternfly/react-icons";
import { Modal, Input, Button } from "../../../shared/components";

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
  const { t } = useTranslation("messages");
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
  }, [isOpen, template, types, defaultTypeId]);

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
      newErrors.typeId = t("templateEditor.validation.categoryRequired");
    if (!titre.trim())
      newErrors.titre = t("templateEditor.validation.titleRequired");
    else if (titre.trim().length > 200)
      newErrors.titre = t("templateEditor.validation.titleMaxLength");
    if (!contenu.trim())
      newErrors.contenu = t("templateEditor.validation.contentRequired");
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
        toast.success(t("success.templateUpdated"));
      } else {
        await createTemplate({
          type_id: typeId as number,
          titre: titre.trim(),
          contenu: contenu.trim(),
          actif,
        });
        toast.success(t("success.templateCreated"));
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? t("errors.generic");
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      closeOnEscape={!isSaving}
    >
      <Modal.Header
        title={
          isEditing
            ? t("templateEditor.editTitle", { titre: template!.titre })
            : t("templateEditor.title")
        }
        showCloseButton
        onClose={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <Modal.Body className="space-y-5">
          {/* ── Ligne : Catégorie + Titre ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Catégorie */}
            <Input.Select
              id="tpl-type"
              label={t("templateEditor.fields.category")}
              required
              value={typeId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setTypeId(Number(e.target.value));
                if (errors.typeId) {
                  setErrors((prev) => {
                    const { typeId, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              error={errors.typeId}
            >
              <option value="">
                {t("templateEditor.placeholders.selectCategory")}
              </option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nom}
                </option>
              ))}
            </Input.Select>

            {/* Titre */}
            <Input
              id="tpl-titre"
              label={t("templateEditor.fields.title")}
              type="text"
              required
              value={titre}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTitre(e.target.value);
                if (errors.titre) {
                  setErrors((prev) => {
                    const { titre, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              placeholder={t("templateEditor.examplePlaceholder")}
              maxLength={200}
              error={errors.titre}
            />
          </div>

          {/* ── Colonnes : Contenu | Aperçu ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Colonne gauche : éditeur */}
            <div className="flex flex-col">
              <Input.Textarea
                id="tpl-contenu"
                label={t("templateEditor.fields.content")}
                required
                value={contenu}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setContenu(e.target.value);
                  if (errors.contenu) {
                    setErrors((prev) => {
                      const { contenu, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                placeholder={t("templateEditor.placeholders.content")}
                rows={10}
                error={errors.contenu}
                helperText={t("templateEditor.helpers.variables")}
                className="font-mono"
              />
            </div>

            {/* Colonne droite : aperçu */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-medium text-gray-700">
                  {t("templateEditor.preview.title")}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {t("templateEditor.preview.realtime")}
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
                      {t("templateEditor.preview.empty")}
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
                {t("templateEditor.variables.detected")}
              </p>
              <div className="flex flex-wrap gap-2">
                {autoVars.map((v) => (
                  <div
                    key={v}
                    className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-2.5 py-1.5 shadow-sm"
                  >
                    <CheckCircleIcon
                      className="text-green-600"
                      style={{ fontSize: "12px" }}
                    />
                    <code className="text-xs font-mono text-gray-700">{`{{${v}}}`}</code>
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                      {t("templateEditor.variables.auto")}
                    </span>
                  </div>
                ))}
                {manualVars.map((v) => (
                  <div
                    key={v}
                    className="flex items-center gap-2 bg-white border border-orange-200 rounded-lg px-2.5 py-1.5 shadow-sm"
                  >
                    <PencilAltIcon
                      className="text-orange-500"
                      style={{ fontSize: "12px" }}
                    />
                    <code className="text-xs font-mono text-gray-700">{`{{${v}}}`}</code>
                    <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                      {t("templateEditor.variables.manual")}
                    </span>
                  </div>
                ))}
              </div>
              {manualVars.length > 0 && (
                <p className="mt-2.5 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                  <span className="font-medium flex items-center gap-1">
                    <ExclamationTriangleIcon style={{ fontSize: "12px" }} />
                    {t("templateEditor.variables.manualLabel")}
                  </span>{" "}
                  {t("templateEditor.variables.manualWarning")}
                </p>
              )}
            </div>
          )}

          {detectedVars.length === 0 && contenu.trim() !== "" && (
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <InfoCircleIcon style={{ fontSize: "12px" }} />
              {t("templateEditor.variables.noneDetected")}
            </p>
          )}

          {/* ── Checkbox actif ── */}
          <Input.Checkbox
            id="tpl-actif"
            label={t("templateEditor.fields.active")}
            checked={actif}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setActif(e.target.checked)
            }
          />
        </Modal.Body>

        <Modal.Footer align="right">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
            loading={isSaving}
            icon={!isSaving ? <SaveIcon className="w-4 h-4" /> : undefined}
          >
            {t("actions.save")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
