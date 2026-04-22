import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Modal } from "../../../../shared/components/Modal/Modal";
import { Input } from "../../../../shared/components/Input/Input";
import { Button } from "../../../../shared/components/Button/Button";
import { SubmitButton } from "../../../../shared/components/Button/SubmitButton";
import type {
  CourseRecurrentListItemDto,
  ProfessorListItemDto,
  CreateCourseRecurrentDto,
  UpdateCourseRecurrentDto,
} from "@clubmanager/types";

// ─── Constants ────────────────────────────────────────────────────────────────
// TODO: Migrer vers shared/utils
const DAY_OPTIONS = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 7, label: "Dimanche" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
// TODO: Migrer vers shared/utils
function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface CreateEditCourseRecurrentModalProps {
  isOpen: boolean;
  editItem: CourseRecurrentListItemDto | null;
  professors: ProfessorListItemDto[];
  planning: CourseRecurrentListItemDto[];
  onClose: () => void;
  onSubmit: (dto: CreateCourseRecurrentDto) => Promise<void>;
  onUpdate: (id: number, dto: UpdateCourseRecurrentDto) => Promise<void>;
}

export function CreateEditCourseRecurrentModal({
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
            <div className="flex items-start gap-2 px-3 py-3 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-800">
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

          <Input
            label="Type de cours"
            id="type_cours"
            type="text"
            value={form.type_cours}
            onChange={(e) =>
              setForm((f) => ({ ...f, type_cours: e.target.value }))
            }
            placeholder="Ex. Judo, Karaté, Aïkido…"
            required
          />

          <Input.Select
            label="Jour de la semaine"
            id="jour_semaine"
            value={form.jour_semaine}
            onChange={(e) =>
              setForm((f) => ({ ...f, jour_semaine: Number(e.target.value) }))
            }
            options={DAY_OPTIONS}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Heure début"
              id="heure_debut"
              type="time"
              value={form.heure_debut}
              onChange={(e) =>
                setForm((f) => ({ ...f, heure_debut: e.target.value }))
              }
              required
            />
            <Input
              label="Heure fin"
              id="heure_fin"
              type="time"
              value={form.heure_fin}
              onChange={(e) =>
                setForm((f) => ({ ...f, heure_fin: e.target.value }))
              }
              required
            />
          </div>

          <Input.Checkbox
            id="cr-active"
            label="Cours actif"
            checked={form.active}
            onChange={(e) =>
              setForm((f) => ({ ...f, active: e.target.checked }))
            }
          />

          {professors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professeurs assignés
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
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
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <SubmitButton
          type="button"
          onClick={() => {
            const formElement = document.getElementById(
              "course-recurrent-form",
            ) as HTMLFormElement;
            if (formElement) {
              formElement.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true }),
              );
            }
          }}
          isLoading={saving}
          disabled={!!conflictCourse}
          loadingText="Enregistrement…"
        >
          {editItem ? "Modifier" : "Créer"}
        </SubmitButton>
      </Modal.Footer>
    </Modal>
  );
}
