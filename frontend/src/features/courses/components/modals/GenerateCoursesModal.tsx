import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Modal } from "../../../../shared/components/Modal/Modal";
import { Input } from "../../../../shared/components/Input/Input";
import { Button } from "../../../../shared/components/Button/Button";
import { SubmitButton } from "../../../../shared/components/Button/SubmitButton";
import type {
  CourseRecurrentListItemDto,
  GenerateCoursesDto,
} from "@clubmanager/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
// TODO: Migrer vers shared/utils
function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface GenerateCoursesModalProps {
  isOpen: boolean;
  planning: CourseRecurrentListItemDto[];
  onClose: () => void;
  onSubmit: (dto: GenerateCoursesDto) => Promise<{ generated: number }>;
}

export function GenerateCoursesModal({
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
          <Input.Select
            label="Cours récurrent"
            id="cours_recurrent_id"
            value={form.cours_recurrent_id}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                cours_recurrent_id: Number(e.target.value),
              }))
            }
            required
          >
            <option value={0}>— Sélectionner un cours —</option>
            {planning.map((c) => (
              <option key={c.id} value={c.id}>
                {c.type_cours} — {c.jour_semaine_nom}{" "}
                {formatTime(c.heure_debut)}-{formatTime(c.heure_fin)}
              </option>
            ))}
          </Input.Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date début"
              id="date_debut"
              type="date"
              value={form.date_debut}
              onChange={(e) =>
                setForm((f) => ({ ...f, date_debut: e.target.value }))
              }
              required
            />
            <Input
              label="Date fin"
              id="date_fin"
              type="date"
              value={form.date_fin}
              onChange={(e) =>
                setForm((f) => ({ ...f, date_fin: e.target.value }))
              }
              required
            />
          </div>
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
              "generate-courses-form",
            ) as HTMLFormElement;
            if (formElement) {
              formElement.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true }),
              );
            }
          }}
          isLoading={saving}
          loadingText="Génération…"
        >
          Générer
        </SubmitButton>
      </Modal.Footer>
    </Modal>
  );
}
