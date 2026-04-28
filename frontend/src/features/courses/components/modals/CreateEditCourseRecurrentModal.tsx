import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useTypesCours } from "../../../../shared/hooks/useReferences";
import type { TypeCours } from "../../../../shared/hooks/useReferences";
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
const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

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
  const { t, i18n } = useTranslation("courses");
  const typesCours: TypeCours[] = useTypesCours();
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
      toast.error(t("messages.error.requiredFields"));
      return;
    }
    if (form.heure_fin <= form.heure_debut) {
      toast.error(t("messages.error.endTimeAfterStart"));
      return;
    }
    if (conflictCourse) {
      toast.error(
        t("messages.error.timeConflict", {
          courseType: conflictCourse.type_cours,
          startTime: formatTime(conflictCourse.heure_debut),
          endTime: formatTime(conflictCourse.heure_fin),
        }),
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
        toast.success(t("messages.success.recurrentCourseUpdated"));
      } else {
        await onSubmit({
          type_cours: form.type_cours.trim(),
          jour_semaine: form.jour_semaine,
          heure_debut: form.heure_debut,
          heure_fin: form.heure_fin,
          active: form.active,
          professeur_ids: form.professeur_ids,
        });
        toast.success(t("messages.success.recurrentCourseCreated"));
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? t("messages.error.generic"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title={
          editItem
            ? t("modals.editRecurrentCourse")
            : t("modals.createRecurrentCourse")
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
              <span
                dangerouslySetInnerHTML={{
                  __html: t("messages.warning.timeConflict", {
                    courseType: conflictCourse.type_cours,
                    startTime: formatTime(conflictCourse.heure_debut),
                    endTime: formatTime(conflictCourse.heure_fin),
                    day: conflictCourse.jour_semaine_nom,
                  }),
                }}
              />
            </div>
          )}

          <Input.Select
            label={t("fields.courseType")}
            id="type_cours"
            value={form.type_cours}
            onChange={(e) =>
              setForm((f) => ({ ...f, type_cours: e.target.value }))
            }
            required
          >
            <option value="">{t("fields.selectType")}</option>
            {typesCours.length > 0 ? (
              typesCours.map((type) => (
                <option key={type.code} value={type.code}>
                  {i18n.language === "en" && type.nom_en
                    ? type.nom_en
                    : type.nom}
                </option>
              ))
            ) : (
              <>
                <option value="karate">Karaté</option>
                <option value="judo">Judo</option>
                <option value="taekwondo">Taekwondo</option>
                <option value="autre">Autre</option>
              </>
            )}
          </Input.Select>

          <Input.Select
            label={t("fields.dayOfWeek")}
            id="jour_semaine"
            value={form.jour_semaine}
            onChange={(e) =>
              setForm((f) => ({ ...f, jour_semaine: Number(e.target.value) }))
            }
            required
          >
            {DAY_KEYS.map((dayKey, idx) => (
              <option key={dayKey} value={idx + 1}>
                {t(`days.${dayKey}`)}
              </option>
            ))}
          </Input.Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("fields.startTime")}
              id="heure_debut"
              type="time"
              value={form.heure_debut}
              onChange={(e) =>
                setForm((f) => ({ ...f, heure_debut: e.target.value }))
              }
              required
            />
            <Input
              label={t("fields.endTime")}
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
            label={t("fields.active")}
            checked={form.active}
            onChange={(e) =>
              setForm((f) => ({ ...f, active: e.target.checked }))
            }
          />

          {professors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("fields.professors")}
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
                        {t("labels.specialitySeparator")} {prof.specialite}
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
          {t("buttons.cancel")}
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
          loadingText={t("loadingText.saving")}
        >
          {editItem ? t("buttons.modify") : t("buttons.create")}
        </SubmitButton>
      </Modal.Footer>
    </Modal>
  );
}
