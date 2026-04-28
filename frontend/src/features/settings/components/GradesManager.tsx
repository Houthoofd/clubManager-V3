/**
 * GradesManager - Gestion des grades / ceintures
 *
 * Composant admin pour créer, modifier et supprimer les grades du club.
 * Utilise React Query v5, Modal + ConfirmDialog partagés, i18n (namespace: settings).
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

import { gradesApi } from "../api/gradesApi";
import type { Grade, CreateGradeDto, UpdateGradeDto } from "../api/gradesApi";
import { Modal } from "../../../shared/components/Modal/Modal";
import { ConfirmDialog } from "../../../shared/components/Modal/ConfirmDialog";
import { Button } from "../../../shared/components/Button/Button";
import { FormField } from "../../../shared/components/Forms/FormField";
import { Input } from "../../../shared/components/Input";
import { useAuth } from "../../../shared/hooks/useAuth";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface GradeFormState {
  nom: string;
  ordre: string;
  couleur: string;
  hasCouleur: boolean;
}

interface FormErrors {
  nom?: string;
  ordre?: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DEFAULT_COLOR = "#6366f1";

const emptyForm = (): GradeFormState => ({
  nom: "",
  ordre: "0",
  couleur: DEFAULT_COLOR,
  hasCouleur: false,
});

// ─── VALIDATION ───────────────────────────────────────────────────────────────

function validateForm(values: GradeFormState): FormErrors {
  const errors: FormErrors = {};

  if (!values.nom.trim() || values.nom.trim().length < 2) {
    errors.nom = "Le nom doit contenir au moins 2 caractères.";
  }

  const ordreNum = parseInt(values.ordre, 10);
  if (isNaN(ordreNum) || ordreNum < 0) {
    errors.ordre = "L'ordre doit être un nombre entier positif ou nul.";
  }

  return errors;
}

// ─── COMPOSANT ────────────────────────────────────────────────────────────────

export function GradesManager() {
  const { t } = useTranslation("settings");
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const queryClient = useQueryClient();

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formValues, setFormValues] = useState<GradeFormState>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // ── Delete confirm state ───────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Grade | null>(null);

  // ── Query ──────────────────────────────────────────────────────────────────
  const { data: grades = [], isLoading } = useQuery({
    queryKey: ["grades"],
    queryFn: gradesApi.getGrades,
  });

  const sortedGrades = [...grades].sort((a, b) => a.ordre - b.ordre);

  // ── Create mutation ────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateGradeDto) => gradesApi.createGrade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast.success(t("grades.messages.created", "Grade créé"));
      closeModal();
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ??
        error.message ??
        t("grades.messages.createError", "Impossible de créer ce grade");
      toast.error(msg);
    },
  });

  // ── Update mutation ────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGradeDto }) =>
      gradesApi.updateGrade(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast.success(t("grades.messages.updated", "Grade mis à jour"));
      closeModal();
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ??
        error.message ??
        t(
          "grades.messages.updateError",
          "Impossible de mettre à jour ce grade",
        );
      toast.error(msg);
    },
  });

  // ── Delete mutation ────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: number) => gradesApi.deleteGrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast.success(t("grades.messages.deleted", "Grade supprimé"));
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ??
        error.message ??
        t("grades.messages.deleteError", "Impossible de supprimer ce grade");
      toast.error(msg);
    },
  });

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingGrade(null);
    setFormValues(emptyForm());
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (grade: Grade) => {
    setEditingGrade(grade);
    setFormValues({
      nom: grade.nom,
      ordre: String(grade.ordre),
      couleur: grade.couleur ?? DEFAULT_COLOR,
      hasCouleur: grade.couleur !== null,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingGrade(null);
    setFormValues(emptyForm());
    setFormErrors({});
  };

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm(formValues);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      nom: formValues.nom.trim(),
      ordre: parseInt(formValues.ordre, 10),
      couleur: formValues.hasCouleur ? formValues.couleur : null,
    };

    if (editingGrade) {
      updateMutation.mutate({ id: editingGrade.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Card principale ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-xl p-2.5 bg-purple-100 text-purple-600 flex-shrink-0">
              <AcademicCapIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t("grades.title", "Gestion des grades / ceintures")}
              </h2>
              <p className="text-sm text-gray-500">
                {t(
                  "grades.description",
                  "Créez et organisez les grades de votre club",
                )}
              </p>
            </div>
          </div>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              icon={<PlusIcon className="h-4 w-4" />}
              onClick={openCreateModal}
            >
              {t("grades.actions.create", "Nouveau grade")}
            </Button>
          )}
        </div>

        {/* Table / states */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : sortedGrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AcademicCapIcon
              className="h-12 w-12 text-gray-300 mb-3"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-gray-500">
              {t("grades.empty", "Aucun grade défini")}
            </p>
            {isAdmin && (
              <p className="text-xs text-gray-400 mt-1">
                {t(
                  "grades.emptyHint",
                  "Cliquez sur « Nouveau grade » pour commencer.",
                )}
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
                  >
                    {t("grades.table.ordre", "Ordre")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
                  >
                    {t("grades.table.couleur", "Couleur")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("grades.table.nom", "Nom")}
                  </th>
                  {isAdmin && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-28"
                    >
                      {t("grades.table.actions", "Actions")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {sortedGrades.map((grade) => (
                  <tr
                    key={grade.id}
                    className="hover:bg-gray-50 transition-colors duration-100"
                  >
                    {/* Ordre */}
                    <td className="px-6 py-3.5 text-sm font-semibold text-gray-700">
                      {grade.ordre}
                    </td>

                    {/* Couleur */}
                    <td className="px-6 py-3.5">
                      <span
                        className="inline-block w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: grade.couleur ?? "#e5e7eb" }}
                        title={
                          grade.couleur ??
                          t("grades.noCouleur", "Aucune couleur")
                        }
                        aria-label={
                          grade.couleur
                            ? grade.couleur
                            : t("grades.noCouleur", "Aucune couleur")
                        }
                      />
                    </td>

                    {/* Nom */}
                    <td className="px-6 py-3.5 text-sm text-gray-800">
                      {grade.nom}
                    </td>

                    {/* Actions (admin only) */}
                    {isAdmin && (
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(grade)}
                            title={t("grades.actions.edit", "Modifier")}
                            aria-label={`${t("grades.actions.edit", "Modifier")} ${grade.nom}`}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(grade)}
                            title={t("grades.actions.delete", "Supprimer")}
                            aria-label={`${t("grades.actions.delete", "Supprimer")} ${grade.nom}`}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Création / Édition ──────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={closeModal} size="sm">
        <Modal.Header
          title={
            editingGrade
              ? t("grades.modal.editTitle", "Modifier le grade")
              : t("grades.modal.createTitle", "Nouveau grade")
          }
          subtitle={
            editingGrade
              ? t(
                  "grades.modal.editSubtitle",
                  "Mettez à jour les informations du grade",
                )
              : t(
                  "grades.modal.createSubtitle",
                  "Remplissez les informations du nouveau grade",
                )
          }
          onClose={closeModal}
        />

        <form onSubmit={handleSubmit} noValidate>
          <Modal.Body>
            <div className="space-y-5">
              {/* Nom */}
              <FormField
                id="grade-nom"
                label={t("grades.form.nom", "Nom")}
                required
                error={formErrors.nom}
              >
                <Input
                  id="grade-nom"
                  type="text"
                  value={formValues.nom}
                  onChange={(e) =>
                    setFormValues({ ...formValues, nom: e.target.value })
                  }
                  placeholder={t(
                    "grades.form.nomPlaceholder",
                    "Ex: Ceinture blanche",
                  )}
                  autoFocus
                  error={formErrors.nom}
                />
              </FormField>

              {/* Ordre */}
              <FormField
                id="grade-ordre"
                label={t("grades.form.ordre", "Ordre")}
                required
                error={formErrors.ordre}
                helpText={
                  !formErrors.ordre
                    ? t(
                        "grades.form.ordreHelp",
                        "Détermine la position dans la liste (0 = premier)",
                      )
                    : undefined
                }
              >
                <Input
                  id="grade-ordre"
                  type="number"
                  min={0}
                  step={1}
                  value={formValues.ordre}
                  onChange={(e) =>
                    setFormValues({ ...formValues, ordre: e.target.value })
                  }
                  error={formErrors.ordre}
                />
              </FormField>

              {/* Couleur */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  {t("grades.form.couleur", "Couleur")}
                </label>

                <div className="flex items-center gap-4">
                  {/* Native color picker */}
                  <input
                    type="color"
                    id="grade-couleur"
                    value={formValues.couleur}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        couleur: e.target.value,
                        hasCouleur: true,
                      })
                    }
                    disabled={!formValues.hasCouleur}
                    className="h-9 w-16 cursor-pointer rounded-md border border-gray-300 p-0.5 shadow-sm
                               disabled:cursor-not-allowed disabled:opacity-40 transition-opacity"
                    aria-label={t("grades.form.couleur", "Couleur")}
                  />

                  {/* Colour hex preview */}
                  {formValues.hasCouleur && (
                    <span className="text-xs font-mono text-gray-500 uppercase">
                      {formValues.couleur}
                    </span>
                  )}

                  {/* "No colour" toggle */}
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none ml-auto">
                    <input
                      type="checkbox"
                      checked={!formValues.hasCouleur}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          hasCouleur: !e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-purple-600
                                 focus:ring-purple-500 h-4 w-4"
                    />
                    {t("grades.form.noCouleur", "Aucune couleur")}
                  </label>
                </div>

                {/* Visual preview */}
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <span
                    className="inline-block w-5 h-5 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                    style={{
                      backgroundColor: formValues.hasCouleur
                        ? formValues.couleur
                        : "#e5e7eb",
                    }}
                  />
                  <span>
                    {t(
                      "grades.form.preview",
                      "Aperçu de la couleur affichée dans le tableau",
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer align="right">
            <Button
              variant="outline"
              type="button"
              onClick={closeModal}
              disabled={isMutating}
            >
              {t("actions.cancel", "Annuler")}
            </Button>

            <Button variant="primary" type="submit" loading={isMutating}>
              {editingGrade
                ? t("grades.actions.update", "Mettre à jour")
                : t("grades.actions.create", "Créer")}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* ── ConfirmDialog Suppression ─────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget.id);
          }
        }}
        title={t("grades.deleteConfirm.title", "Supprimer le grade")}
        message={
          deleteTarget
            ? t("grades.deleteConfirm.message", {
                name: deleteTarget.nom,
                defaultValue: `Voulez-vous vraiment supprimer le grade "{{name}}" ? Cette action peut échouer si le grade est utilisé par des membres.`,
              })
            : ""
        }
        variant="danger"
        confirmLabel={t("grades.actions.delete", "Supprimer")}
        cancelLabel={t("actions.cancel", "Annuler")}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

export default GradesManager;
