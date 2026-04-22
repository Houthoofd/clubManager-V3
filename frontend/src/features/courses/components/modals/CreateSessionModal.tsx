import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Modal } from "../../../../shared/components/Modal/Modal";
import { Input } from "../../../../shared/components/Input/Input";
import { Button } from "../../../../shared/components/Button/Button";
import { SubmitButton } from "../../../../shared/components/Button/SubmitButton";
import type {
  CourseRecurrentListItemDto,
  CreateCourseDto,
} from "@clubmanager/types";

// ─── Component ────────────────────────────────────────────────────────────────

export interface CreateSessionModalProps {
  isOpen: boolean;
  planning: CourseRecurrentListItemDto[];
  onClose: () => void;
  onSubmit: (dto: CreateCourseDto) => Promise<void>;
}

export function CreateSessionModal({
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
          <Input
            label="Date"
            id="date_cours"
            type="date"
            value={form.date_cours}
            onChange={(e) =>
              setForm((f) => ({ ...f, date_cours: e.target.value }))
            }
            required
          />

          <Input
            label="Type de cours"
            id="type_cours"
            type="text"
            value={form.type_cours}
            onChange={(e) =>
              setForm((f) => ({ ...f, type_cours: e.target.value }))
            }
            placeholder="Ex. Judo, Karaté…"
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

          {planning.length > 0 && (
            <Input.Select
              label="Cours récurrent lié (optionnel)"
              id="cours_recurrent_id"
              value={form.cours_recurrent_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, cours_recurrent_id: e.target.value }))
              }
            >
              <option value="">— Aucun —</option>
              {planning.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.type_cours} — {c.jour_semaine_nom}
                </option>
              ))}
            </Input.Select>
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
              "create-session-form",
            ) as HTMLFormElement;
            if (formElement) {
              formElement.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true }),
              );
            }
          }}
          isLoading={saving}
          loadingText="Création…"
        >
          Créer
        </SubmitButton>
      </Modal.Footer>
    </Modal>
  );
}
