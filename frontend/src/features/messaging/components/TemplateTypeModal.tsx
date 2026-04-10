/**
 * TemplateTypeModal.tsx
 * Modal de création / modification d'un type de template (catégorie)
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createTemplateType, updateTemplateType } from "../api/templatesApi";
import type { TemplateType } from "../api/templatesApi";
import {
  PencilAltIcon,
  PlusCircleIcon,
  SaveIcon,
} from "@patternfly/react-icons";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TemplateTypeModalProps {
  type?: TemplateType;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TemplateTypeModal = ({
  type,
  isOpen,
  onClose,
  onSaved,
}: TemplateTypeModalProps) => {
  const isEditing = Boolean(type);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [actif, setActif] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Sync state when opening ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setNom(type?.nom ?? "");
      setDescription(type?.description ?? "");
      setActif(type?.actif ?? true);
      setErrors({});
      setIsSaving(false);
    }
  }, [isOpen, type]);

  // ── Close on Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSaving) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isSaving, onClose]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!nom.trim()) {
      newErrors.nom = "Le nom de la catégorie est obligatoire.";
    } else if (nom.trim().length > 100) {
      newErrors.nom = "Le nom ne doit pas dépasser 100 caractères.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      if (isEditing && type) {
        await updateTemplateType(type.id, {
          nom: nom.trim(),
          description: description.trim() || undefined,
          actif,
        });
        toast.success("Catégorie mise à jour.");
      } else {
        await createTemplateType({
          nom: nom.trim(),
          description: description.trim() || undefined,
        });
        toast.success("Catégorie créée avec succès.");
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

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={!isSaving ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="type-modal-title"
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2
              id="type-modal-title"
              className="text-base font-semibold text-gray-900 flex items-center gap-2"
            >
              {isEditing ? (
                <PencilAltIcon style={{ fontSize: "16px" }} />
              ) : (
                <PlusCircleIcon style={{ fontSize: "16px" }} />
              )}
              {isEditing ? "Modifier la catégorie" : "Nouvelle catégorie"}
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

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-4">
              {/* Nom */}
              <div>
                <label
                  htmlFor="type-nom"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  id="type-nom"
                  type="text"
                  value={nom}
                  onChange={(e) => {
                    setNom(e.target.value);
                    if (errors.nom)
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.nom;
                        return n;
                      });
                  }}
                  placeholder="Ex : Bienvenue, Cours annulé, Rappel…"
                  maxLength={100}
                  autoFocus
                  className={[
                    "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                    errors.nom
                      ? "border-red-300 focus:ring-red-200 bg-red-50"
                      : "border-gray-300 focus:ring-blue-200 focus:border-blue-400",
                  ].join(" ")}
                />
                {errors.nom && (
                  <p className="mt-1 text-xs text-red-600">{errors.nom}</p>
                )}
                <p className="mt-1 text-xs text-gray-400 text-right">
                  {nom.length}/100
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="type-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description{" "}
                  <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  id="type-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez l'usage de cette catégorie…"
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors resize-none"
                />
                <p className="mt-1 text-xs text-gray-400 text-right">
                  {description.length}/500
                </p>
              </div>

              {/* Actif (uniquement en édition) */}
              {isEditing && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={actif}
                    onChange={(e) => setActif(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    Catégorie active
                  </span>
                </label>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
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
