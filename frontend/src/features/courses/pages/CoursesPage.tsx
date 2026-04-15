/**
 * CoursesPage - Version migrée avec composants réutilisables
 * Page principale de gestion des cours.
 * Onglets : Planning hebdomadaire récurrent, Séances (instances), Professeurs.
 *
 * COMPOSANTS RÉUTILISABLES UTILISÉS :
 * - PageHeader : En-tête de page avec icône et description
 * - TabGroup : Navigation par onglets avec scroll
 * - LoadingSpinner : Indicateurs de chargement centrés
 * - EmptyState : États vides avec icône et message
 * - StatusBadge : Badges de statut (actif/inactif/annulé)
 * - ConfirmDialog : Dialogue de confirmation de suppression
 *
 * CONSERVÉS (pour compatibilité) :
 * - Formulaires custom avec inputs HTML natifs
 * - Icônes SVG personnalisées
 * - Modaux custom avec leur logique métier
 * - Tableau de séances custom
 */

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useCourses } from "../hooks/useCourses";
import { useAuth } from "../../../shared/hooks/useAuth";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { TabGroup } from "../../../shared/components/Navigation/TabGroup";
import { LoadingSpinner } from "../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../shared/components/Layout/EmptyState";
import { Badge } from "../../../shared/components/Badge";
import { ConfirmDialog } from "../../../shared/components/Modal/ConfirmDialog";
import { Modal } from "../../../shared/components/Modal/Modal";
import type {
  CourseRecurrentListItemDto,
  ProfessorListItemDto,
  CourseListItemDto,
  AttendanceSheetDto,
  BulkUpdatePresenceDto,
  CreateCourseRecurrentDto,
  UpdateCourseRecurrentDto,
  CreateProfessorDto,
  UpdateProfessorDto,
  GenerateCoursesDto,
  CreateCourseDto,
} from "@clubmanager/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

const DAY_OPTIONS = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 7, label: "Dimanche" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "planning" | "sessions" | "professeurs";

type ModalState =
  | { type: "none" }
  | { type: "createCourseRecurrent" }
  | { type: "editCourseRecurrent"; item: CourseRecurrentListItemDto }
  | { type: "deleteCourseRecurrent"; item: CourseRecurrentListItemDto }
  | { type: "createProfessor" }
  | { type: "editProfessor"; professor: ProfessorListItemDto }
  | { type: "createSession" }
  | { type: "generateCourses" }
  | { type: "attendance"; session: CourseListItemDto };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const datePart = dateStr.split("T")[0] ?? "";
  const parts = datePart.split("-");
  const yyyy = parts[0] ?? "";
  const mm = parts[1] ?? "";
  const dd = parts[2] ?? "";
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CalendarIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  );
}

function PencilIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}

function ClipboardIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
      />
    </svg>
  );
}

function SparklesIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
      />
    </svg>
  );
}

function MailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  );
}

function Spinner({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-blue-600 ${className}`}
    />
  );
}

// ─── MODAL 1 : Create / Edit CourseRecurrent ──────────────────────────────────

interface CreateEditCourseRecurrentModalProps {
  isOpen: boolean;
  editItem: CourseRecurrentListItemDto | null;
  professors: ProfessorListItemDto[];
  planning: CourseRecurrentListItemDto[];
  onClose: () => void;
  onSubmit: (dto: CreateCourseRecurrentDto) => Promise<void>;
  onUpdate: (id: number, dto: UpdateCourseRecurrentDto) => Promise<void>;
}

function CreateEditCourseRecurrentModal({
  isOpen,
  editItem,
  professors,
  planning,
  onClose,
  onSubmit,
  onUpdate,
}: CreateEditCourseRecurrentModalProps) {
  const [form, setForm] = useState({
    type_cours: "",
    jour_semaine: 1,
    heure_debut: "",
    heure_fin: "",
    active: true,
    professeur_ids: [] as number[],
  });
  const [saving, setSaving] = useState(false);

  const conflictCourse =
    form.heure_debut && form.heure_fin && form.heure_fin > form.heure_debut
      ? (planning.find((c) => {
          if (editItem && c.id === editItem.id) return false;
          if (c.jour_semaine !== form.jour_semaine) return false;
          return (
            form.heure_debut < c.heure_fin.slice(0, 5) &&
            form.heure_fin > c.heure_debut.slice(0, 5)
          );
        }) ?? null)
      : null;

  useEffect(() => {
    if (!isOpen) return;
    if (editItem) {
      const profIds = professors
        .filter((p) => editItem.professeurs_noms.includes(p.nom_complet))
        .map((p) => p.id);
      setForm({
        type_cours: editItem.type_cours,
        jour_semaine: editItem.jour_semaine,
        heure_debut: formatTime(editItem.heure_debut),
        heure_fin: formatTime(editItem.heure_fin),
        active: editItem.active,
        professeur_ids: profIds,
      });
    } else {
      setForm({
        type_cours: "",
        jour_semaine: 1,
        heure_debut: "",
        heure_fin: "",
        active: true,
        professeur_ids: [],
      });
    }
  }, [isOpen, editItem, professors]);

  const toggleProfessor = (id: number) => {
    setForm((f) => ({
      ...f,
      professeur_ids: f.professeur_ids.includes(id)
        ? f.professeur_ids.filter((x) => x !== id)
        : [...f.professeur_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type_cours.trim() || !form.heure_debut || !form.heure_fin) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (form.heure_fin <= form.heure_debut) {
      toast.error("L'heure de fin doit être postérieure à l'heure de début.");
      return;
    }
    if (conflictCourse) {
      toast.error(
        `Créneau déjà occupé par "${conflictCourse.type_cours}" (${formatTime(conflictCourse.heure_debut)}–${formatTime(conflictCourse.heure_fin)}).`,
      );
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        await onUpdate(editItem.id, {
          id: editItem.id,
          type_cours: form.type_cours.trim(),
          jour_semaine: form.jour_semaine,
          heure_debut: form.heure_debut,
          heure_fin: form.heure_fin,
          active: form.active,
          professeur_ids: form.professeur_ids,
        });
        toast.success("Cours récurrent modifié avec succès");
      } else {
        await onSubmit({
          type_cours: form.type_cours.trim(),
          jour_semaine: form.jour_semaine,
          heure_debut: form.heure_debut,
          heure_fin: form.heure_fin,
          active: form.active,
          professeur_ids: form.professeur_ids,
        });
        toast.success("Cours récurrent créé avec succès");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title={
          editItem ? "Modifier le cours récurrent" : "Nouveau cours récurrent"
        }
      />
      <Modal.Body>
        <form
          id="course-recurrent-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {conflictCourse && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-800">
              <svg
                className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <span>
                Ce créneau chevauche{" "}
                <strong>{conflictCourse.type_cours}</strong> (
                {formatTime(conflictCourse.heure_debut)}–
                {formatTime(conflictCourse.heure_fin)}) le{" "}
                {conflictCourse.jour_semaine_nom}.
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de cours <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.type_cours}
              onChange={(e) =>
                setForm((f) => ({ ...f, type_cours: e.target.value }))
              }
              placeholder="Ex. Judo, Karaté, Aïkido…"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jour de la semaine <span className="text-red-500">*</span>
            </label>
            <select
              value={form.jour_semaine}
              onChange={(e) =>
                setForm((f) => ({ ...f, jour_semaine: Number(e.target.value) }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure début <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={form.heure_debut}
                onChange={(e) =>
                  setForm((f) => ({ ...f, heure_debut: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure fin <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={form.heure_fin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, heure_fin: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="cr-active"
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="cr-active"
              className="text-sm font-medium text-gray-700"
            >
              Cours actif
            </label>
          </div>

          {professors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professeurs assignés
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                {professors.map((prof) => (
                  <label
                    key={prof.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.professeur_ids.includes(prof.id)}
                      onChange={() => toggleProfessor(prof.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {prof.nom_complet}
                    </span>
                    {prof.specialite && (
                      <span className="text-xs text-gray-400">
                        — {prof.specialite}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
        </form>
      </Modal.Body>
      <Modal.Footer align="right">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          Annuler
        </button>
        <button
          type="submit"
          form="course-recurrent-form"
          disabled={saving || !!conflictCourse}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={(e) => {
            e.preventDefault();
            const form = document.getElementById(
              "course-recurrent-form",
            ) as HTMLFormElement;
            if (form) {
              form.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true }),
              );
            }
          }}
          title={
            conflictCourse
              ? `Créneau occupé par "${conflictCourse.type_cours}"`
              : undefined
          }
        >
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Enregistrement…" : editItem ? "Modifier" : "Créer"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

// ─── MODAL 2 : Create / Edit Professor ───────────────────────────────────────

interface CreateProfessorModalProps {
  isOpen: boolean;
  editProfessor: ProfessorListItemDto | null;
  onClose: () => void;
  onSubmit: (dto: CreateProfessorDto) => Promise<void>;
  onUpdate: (id: number, dto: UpdateProfessorDto) => Promise<void>;
}

function CreateProfessorModal({
  isOpen,
  editProfessor,
  onClose,
  onSubmit,
  onUpdate,
}: CreateProfessorModalProps) {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    specialite: "",
    actif: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editProfessor) {
      setForm({
        prenom: editProfessor.prenom,
        nom: editProfessor.nom,
        email: editProfessor.email ?? "",
        telephone: editProfessor.telephone ?? "",
        specialite: editProfessor.specialite ?? "",
        actif: editProfessor.actif,
      });
    } else {
      setForm({
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
        specialite: "",
        actif: true,
      });
    }
  }, [isOpen, editProfessor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prenom.trim() || !form.nom.trim()) {
      toast.error("Le prénom et le nom sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      if (editProfessor) {
        await onUpdate(editProfessor.id, {
          id: editProfessor.id,
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          email: form.email.trim() || undefined,
          telephone: form.telephone.trim() || undefined,
          specialite: form.specialite.trim() || undefined,
          actif: form.actif,
        });
        toast.success("Professeur modifié avec succès");
      } else {
        await onSubmit({
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          email: form.email.trim() || undefined,
          telephone: form.telephone.trim() || undefined,
          specialite: form.specialite.trim() || undefined,
          actif: form.actif,
        });
        toast.success("Professeur créé avec succès");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title={editProfessor ? "Modifier le professeur" : "Nouveau professeur"}
      />
      <Modal.Body>
        <form id="professor-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, prenom: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nom: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="prof@exemple.fr"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              value={form.telephone}
              onChange={(e) =>
                setForm((f) => ({ ...f, telephone: e.target.value }))
              }
              placeholder="+33 6 12 34 56 78"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spécialité
            </label>
            <input
              type="text"
              value={form.specialite}
              onChange={(e) =>
                setForm((f) => ({ ...f, specialite: e.target.value }))
              }
              placeholder="Ex. Judo, Ceinture noire 3e dan…"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="prof-actif"
              type="checkbox"
              checked={form.actif}
              onChange={(e) =>
                setForm((f) => ({ ...f, actif: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="prof-actif"
              className="text-sm font-medium text-gray-700"
            >
              Professeur actif
            </label>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer align="right">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
          onClick={(e) => {
            e.preventDefault();
            const form = document.getElementById(
              "professor-form",
            ) as HTMLFormElement;
            if (form) {
              form.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true }),
              );
            }
          }}
        >
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Enregistrement…" : editProfessor ? "Modifier" : "Créer"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

// ─── MODAL 3 : Generate Courses ───────────────────────────────────────────────

interface GenerateCoursesModalProps {
  isOpen: boolean;
  planning: CourseRecurrentListItemDto[];
  onClose: () => void;
  onSubmit: (dto: GenerateCoursesDto) => Promise<{ generated: number }>;
}

function GenerateCoursesModal({
  isOpen,
  planning,
  onClose,
  onSubmit,
}: GenerateCoursesModalProps) {
  const [form, setForm] = useState({
    cours_recurrent_id: 0,
    date_debut: "",
    date_fin: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        cours_recurrent_id: planning[0]?.id ?? 0,
        date_debut: "",
        date_fin: "",
      });
    }
  }, [isOpen, planning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cours_recurrent_id || !form.date_debut || !form.date_fin) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    setSaving(true);
    try {
      const result = await onSubmit({
        cours_recurrent_id: form.cours_recurrent_id,
        date_debut: form.date_debut,
        date_fin: form.date_fin,
      });
      toast.success(`${result.generated} séance(s) générée(s) avec succès`);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header title="Générer des séances depuis le planning" />
      <Modal.Body>
        <form
          id="generate-courses-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cours récurrent <span className="text-red-500">*</span>
            </label>
            <select
              value={form.cours_recurrent_id}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  cours_recurrent_id: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>— Sélectionner un cours —</option>
              {planning.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.type_cours} — {c.jour_semaine_nom}{" "}
                  {formatTime(c.heure_debut)}-{formatTime(c.heure_fin)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date_debut}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date_debut: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date_fin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date_fin: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer align="right">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
          onClick={(e) => {
            e.preventDefault();
            const form = document.getElementById(
              "generate-courses-form",
            ) as HTMLFormElement;
            if (form) {
              form.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true }),
              );
            }
          }}
        >
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Génération…" : "Générer"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

// ─── MODAL 4 : Create Session ─────────────────────────────────────────────────

interface CreateSessionModalProps {
  isOpen: boolean;
  planning: CourseRecurrentListItemDto[];
  onClose: () => void;
  onSubmit: (dto: CreateCourseDto) => Promise<void>;
}

function CreateSessionModal({
  isOpen,
  planning,
  onClose,
  onSubmit,
}: CreateSessionModalProps) {
  const [form, setForm] = useState({
    date_cours: "",
    type_cours: "",
    heure_debut: "",
    heure_fin: "",
    cours_recurrent_id: "" as string,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        date_cours: "",
        type_cours: "",
        heure_debut: "",
        heure_fin: "",
        cours_recurrent_id: "",
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.date_cours ||
      !form.type_cours.trim() ||
      !form.heure_debut ||
      !form.heure_fin
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        date_cours: form.date_cours,
        type_cours: form.type_cours.trim(),
        heure_debut: form.heure_debut,
        heure_fin: form.heure_fin,
        cours_recurrent_id: form.cours_recurrent_id
          ? Number(form.cours_recurrent_id)
          : undefined,
      });
      toast.success("Séance créée avec succès");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header title="Nouvelle séance" />
      <Modal.Body>
        <form
          id="create-session-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.date_cours}
              onChange={(e) =>
                setForm((f) => ({ ...f, date_cours: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de cours <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.type_cours}
              onChange={(e) =>
                setForm((f) => ({ ...f, type_cours: e.target.value }))
              }
              placeholder="Ex. Judo, Karaté…"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure début <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={form.heure_debut}
                onChange={(e) =>
                  setForm((f) => ({ ...f, heure_debut: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure fin <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={form.heure_fin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, heure_fin: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {planning.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cours récurrent lié (optionnel)
              </label>
              <select
                value={form.cours_recurrent_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cours_recurrent_id: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Aucun —</option>
                {planning.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.type_cours} — {c.jour_semaine_nom}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
      </Modal.Body>
      <Modal.Footer align="right">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
          onClick={(e) => {
            e.preventDefault();
            const form = document.getElementById(
              "create-session-form",
            ) as HTMLFormElement;
            if (form) {
              form.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true }),
              );
            }
          }}
        >
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Création…" : "Créer"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

// ─── MODAL 5 : Attendance Sheet ───────────────────────────────────────────────

interface AttendanceModalProps {
  isOpen: boolean;
  session: CourseListItemDto | null;
  attendanceSheet: AttendanceSheetDto | null;
  attendanceLoading: boolean;
  onClose: () => void;
  onSave: (cours_id: number, dto: BulkUpdatePresenceDto) => Promise<void>;
}

function AttendanceModal({
  isOpen,
  session,
  attendanceSheet,
  attendanceLoading,
  onClose,
  onSave,
}: AttendanceModalProps) {
  const [presenceMap, setPresenceMap] = useState<Record<number, number | null>>(
    {},
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (attendanceSheet && isOpen) {
      const initial: Record<number, number | null> = {};
      attendanceSheet.inscriptions.forEach((ins) => {
        initial[ins.id] = ins.status_id ?? null;
      });
      setPresenceMap(initial);
    }
  }, [attendanceSheet, isOpen]);

  const togglePresence = (inscriptionId: number) => {
    setPresenceMap((prev) => ({
      ...prev,
      [inscriptionId]: prev[inscriptionId] === 1 ? null : 1,
    }));
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    try {
      const updates = Object.entries(presenceMap).map(([id, status_id]) => ({
        inscription_id: Number(id),
        status_id,
      }));
      await onSave(session.id, { updates });
      toast.success("Présences sauvegardées");
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? "Erreur lors de la sauvegarde.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <Modal.Header
        title="Feuille d'appel"
        subtitle={
          session
            ? `${session.type_cours} — ${formatDate(session.date_cours)} ${formatTime(session.heure_debut)}–${formatTime(session.heure_fin)}`
            : undefined
        }
      />
      <Modal.Body padding="px-6 py-5">
        {attendanceLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : !attendanceSheet ? (
          <p className="text-center text-gray-500 py-12">
            Aucune donnée disponible.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-5 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                Total :{" "}
                <strong>{attendanceSheet.statistiques.total_inscrits}</strong>
              </span>
              <span className="text-sm text-green-700">
                Présents :{" "}
                <strong>{attendanceSheet.statistiques.nombre_presents}</strong>
              </span>
              <span className="text-sm text-red-600">
                Absents :{" "}
                <strong>{attendanceSheet.statistiques.nombre_absents}</strong>
              </span>
              {attendanceSheet.professeurs.length > 0 && (
                <span className="text-sm text-blue-600">
                  Prof :{" "}
                  {attendanceSheet.professeurs
                    .map((p) => p.nom_complet)
                    .join(", ")}
                </span>
              )}
            </div>

            {attendanceSheet.inscriptions.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                Aucun inscrit pour cette séance.
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 pr-4">
                      Nom complet
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 pr-4">
                      Grade
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 w-24">
                      Présent
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendanceSheet.inscriptions.map((ins) => (
                    <tr
                      key={ins.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 pr-4 text-sm font-medium text-gray-900">
                        {ins.nom_complet}
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-500">
                        {ins.grade ? (
                          <span className="inline-flex items-center gap-1.5">
                            {ins.grade.couleur && (
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: ins.grade.couleur }}
                              />
                            )}
                            {ins.grade.nom}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={presenceMap[ins.id] === 1}
                          onClick={() => togglePresence(ins.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            presenceMap[ins.id] === 1
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                              presenceMap[ins.id] === 1
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer align="right">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          Fermer
        </button>
        {attendanceSheet && attendanceSheet.inscriptions.length > 0 && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || attendanceLoading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving && <Spinner className="h-4 w-4" />}
            {saving ? "Sauvegarde…" : "Sauvegarder les présences"}
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CoursesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role_app === "admin";

  const [activeTab, setActiveTab] = useState<TabId>("planning");
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const attendanceCourseId =
    modal.type === "attendance" ? modal.session.id : null;

  const {
    planning,
    planningLoading,
    planningError,
    professors,
    professorsLoading,
    sessions,
    sessionsLoading,
    sessionsError,
    sessionFilters,
    attendanceSheet,
    attendanceLoading,
    bulkUpdatePresence: storeBulkUpdatePresence,
    createCourseRecurrent: storeCreateCourseRecurrent,
    updateCourseRecurrent: storeUpdateCourseRecurrent,
    deleteCourseRecurrent: storeDeleteCourseRecurrent,
    createProfessor: storeCreateProfessor,
    updateProfessor: storeUpdateProfessor,
    createSession: storeCreateSession,
    generateSessions,
    setSessionFilter,
    clearError,
  } = useCourses({ attendanceCourseId });

  useEffect(() => {
    if (planningError) {
      toast.error(planningError);
      clearError();
    }
  }, [planningError, clearError]);

  useEffect(() => {
    if (sessionsError) {
      toast.error(sessionsError);
      clearError();
    }
  }, [sessionsError, clearError]);

  const uniqueTypes = Array.from(
    new Set(sessions.map((s) => s.type_cours)),
  ).sort();

  const handleConfirmDelete = useCallback(async () => {
    if (modal.type !== "deleteCourseRecurrent") return;
    setDeleteLoading(true);
    try {
      await storeDeleteCourseRecurrent(modal.item.id);
      toast.success("Cours récurrent supprimé");
      setModal({ type: "none" });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? "Erreur lors de la suppression.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }, [modal, storeDeleteCourseRecurrent]);

  const tabs = [
    {
      id: "planning" as TabId,
      label: "Planning",
      icon: <CalendarIcon className="h-4 w-4" />,
    },
    {
      id: "sessions" as TabId,
      label: "Séances",
      icon: <ClipboardIcon className="h-4 w-4" />,
    },
    {
      id: "professeurs" as TabId,
      label: "Professeurs",
      icon: <SparklesIcon className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cours"
        description="Gestion du planning, des séances et des professeurs"
        icon={<CalendarIcon className="h-8 w-8 text-blue-600" />}
      />

      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabId)}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1 — PLANNING
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "planning" && (
        <div className="space-y-4">
          {isAdmin && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setModal({ type: "createCourseRecurrent" })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon />
                Nouveau cours récurrent
              </button>
            </div>
          )}

          {planningLoading && (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {!planningLoading && (
            <div className="overflow-x-auto rounded-lg">
              <div className="min-w-[800px] grid grid-cols-7 gap-3 pb-2">
                {DAYS.map((day, idx) => {
                  const dayNum = idx + 1;
                  const dayCourses = planning
                    .filter((c) => c.jour_semaine === dayNum)
                    .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
                  return (
                    <div key={day}>
                      <div className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2 mb-2 border-b border-gray-200">
                        {day}
                      </div>

                      <div className="space-y-2">
                        {dayCourses.length === 0 ? (
                          <div className="text-xs text-gray-300 text-center py-6 border border-dashed border-gray-200 rounded-lg">
                            —
                          </div>
                        ) : (
                          dayCourses.map((course) => (
                            <div
                              key={course.id}
                              className={`bg-white rounded-lg border shadow-sm p-2.5 transition-opacity ${
                                course.active
                                  ? "border-blue-100"
                                  : "border-gray-200 opacity-60"
                              }`}
                            >
                              <p className="text-xs font-bold text-gray-900 truncate">
                                {course.type_cours}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatTime(course.heure_debut)} –{" "}
                                {formatTime(course.heure_fin)}
                              </p>
                              {course.professeurs_noms.length > 0 && (
                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                  {course.professeurs_noms.join(", ")}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-1.5">
                                <Badge.Status
                                  status={course.active ? "active" : "inactive"}
                                  size="sm"
                                >
                                  {course.active ? "Actif" : "Inactif"}
                                </Badge.Status>
                                {isAdmin && (
                                  <div className="flex gap-0.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setModal({
                                          type: "editCourseRecurrent",
                                          item: course,
                                        })
                                      }
                                      className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                                      aria-label="Modifier"
                                    >
                                      <PencilIcon className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setModal({
                                          type: "deleteCourseRecurrent",
                                          item: course,
                                        })
                                      }
                                      className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                      aria-label="Supprimer"
                                    >
                                      <TrashIcon className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!planningLoading && planning.length === 0 && (
            <EmptyState
              icon={<CalendarIcon className="h-12 w-12" />}
              title="Aucun cours récurrent"
              description={
                isAdmin
                  ? "Créez votre premier cours récurrent pour commencer."
                  : "Le planning est vide pour le moment."
              }
            />
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — SÉANCES
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Date début
                </label>
                <input
                  type="date"
                  value={sessionFilters.date_debut}
                  onChange={(e) =>
                    setSessionFilter("date_debut", e.target.value)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Date fin
                </label>
                <input
                  type="date"
                  value={sessionFilters.date_fin}
                  onChange={(e) => setSessionFilter("date_fin", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Type de cours
                </label>
                <select
                  value={sessionFilters.type_cours}
                  onChange={(e) =>
                    setSessionFilter("type_cours", e.target.value)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous</option>
                  {uniqueTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setModal({ type: "createSession" })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PlusIcon />
                Nouvelle séance
              </button>
              <button
                type="button"
                onClick={() => setModal({ type: "generateCourses" })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <SparklesIcon />
                Générer depuis planning
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
            {sessionsLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : sessions.length === 0 ? (
              <EmptyState
                icon={<CalendarIcon className="h-12 w-12" />}
                title="Aucune séance trouvée"
                description="Modifiez les filtres ou générez des séances depuis le planning."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Date",
                        "Jour",
                        "Type",
                        "Horaire",
                        "Durée",
                        "Professeurs",
                        "Inscrits",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sessions.map((session) => (
                      <tr
                        key={session.id}
                        className={`hover:bg-gray-50 transition-colors ${session.annule ? "opacity-50" : ""}`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {formatDate(session.date_cours)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {session.jour_semaine_nom}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <span
                            className={
                              session.annule
                                ? "line-through text-gray-400"
                                : "text-gray-900 font-medium"
                            }
                          >
                            {session.type_cours}
                          </span>
                          {session.annule && (
                            <Badge.Status
                              status="error"
                              size="sm"
                              className="ml-2"
                            >
                              Annulé
                            </Badge.Status>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {formatTime(session.heure_debut)} –{" "}
                          {formatTime(session.heure_fin)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {session.duree_minutes} min
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-[160px]">
                          <span className="truncate block">
                            {session.professeurs_noms.length > 0 ? (
                              session.professeurs_noms.join(", ")
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {session.nombre_inscriptions}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              setModal({ type: "attendance", session })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                            title="Feuille d'appel"
                          >
                            <ClipboardIcon className="h-3.5 w-3.5" />
                            Appel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3 — PROFESSEURS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "professeurs" && (
        <div className="space-y-4">
          {isAdmin && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setModal({ type: "createProfessor" })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon />
                Nouveau professeur
              </button>
            </div>
          )}

          {professorsLoading && (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {!professorsLoading && professors.length === 0 ? (
            <EmptyState
              icon={<SparklesIcon className="h-12 w-12" />}
              title="Aucun professeur"
              description={
                isAdmin
                  ? "Ajoutez votre premier professeur."
                  : "La liste est vide pour le moment."
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {professors.map((prof) => (
                <div
                  key={prof.id}
                  className="bg-white rounded-lg shadow border border-gray-100 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-700 uppercase">
                        {prof.prenom.charAt(0)}
                        {prof.nom.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {prof.nom_complet}
                      </h3>
                      {prof.specialite && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {prof.specialite}
                        </p>
                      )}
                      {prof.grade_nom && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {prof.grade_couleur && (
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: prof.grade_couleur }}
                            />
                          )}
                          <span className="text-xs text-gray-500">
                            {prof.grade_nom}
                          </span>
                        </div>
                      )}
                    </div>
                    <Badge.Status
                      status={prof.actif ? "active" : "inactive"}
                      size="sm"
                    >
                      {prof.actif ? "Actif" : "Inactif"}
                    </Badge.Status>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>
                        {prof.nombre_cours} cours récurrent
                        {prof.nombre_cours !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {prof.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MailIcon className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{prof.email}</span>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setModal({ type: "editProfessor", professor: prof })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                        Modifier
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      <ConfirmDialog
        isOpen={modal.type === "deleteCourseRecurrent"}
        title="Supprimer le cours récurrent"
        message={
          modal.type === "deleteCourseRecurrent"
            ? `Vous êtes sur le point de supprimer le cours "${modal.item.type_cours}" du ${modal.item.jour_semaine_nom}. Cette action est irréversible.`
            : ""
        }
        onConfirm={handleConfirmDelete}
        onClose={() => setModal({ type: "none" })}
        isLoading={deleteLoading}
        variant="danger"
      />

      <CreateEditCourseRecurrentModal
        isOpen={
          modal.type === "createCourseRecurrent" ||
          modal.type === "editCourseRecurrent"
        }
        editItem={modal.type === "editCourseRecurrent" ? modal.item : null}
        professors={professors}
        planning={planning}
        onClose={() => setModal({ type: "none" })}
        onSubmit={storeCreateCourseRecurrent}
        onUpdate={storeUpdateCourseRecurrent}
      />

      <CreateProfessorModal
        isOpen={
          modal.type === "createProfessor" || modal.type === "editProfessor"
        }
        editProfessor={modal.type === "editProfessor" ? modal.professor : null}
        onClose={() => setModal({ type: "none" })}
        onSubmit={storeCreateProfessor}
        onUpdate={storeUpdateProfessor}
      />

      <CreateSessionModal
        isOpen={modal.type === "createSession"}
        planning={planning}
        onClose={() => setModal({ type: "none" })}
        onSubmit={storeCreateSession}
      />

      <GenerateCoursesModal
        isOpen={modal.type === "generateCourses"}
        planning={planning}
        onClose={() => setModal({ type: "none" })}
        onSubmit={generateSessions}
      />

      <AttendanceModal
        isOpen={modal.type === "attendance"}
        session={modal.type === "attendance" ? modal.session : null}
        attendanceSheet={attendanceSheet}
        attendanceLoading={attendanceLoading}
        onClose={() => setModal({ type: "none" })}
        onSave={storeBulkUpdatePresence}
      />
    </div>
  );
}
