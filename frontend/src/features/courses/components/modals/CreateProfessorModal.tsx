import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Modal } from "../../../../shared/components/Modal/Modal";
import { Input } from "../../../../shared/components/Input/Input";
import { Button } from "../../../../shared/components/Button/Button";
import { SubmitButton } from "../../../../shared/components/Button/SubmitButton";
import type {
  ProfessorListItemDto,
  CreateProfessorDto,
  UpdateProfessorDto,
} from "@clubmanager/types";

// ─── Component ────────────────────────────────────────────────────────────────

export interface CreateProfessorModalProps {
  isOpen: boolean;
  editProfessor: ProfessorListItemDto | null;
  onClose: () => void;
  onSubmit: (dto: CreateProfessorDto) => Promise<void>;
  onUpdate: (id: number, dto: UpdateProfessorDto) => Promise<void>;
}

export function CreateProfessorModal({
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
            <Input
              label="Prénom"
              id="prenom"
              type="text"
              value={form.prenom}
              onChange={(e) =>
                setForm((f) => ({ ...f, prenom: e.target.value }))
              }
              required
            />
            <Input
              label="Nom"
              id="nom"
              type="text"
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              required
            />
          </div>

          <Input
            label="Email"
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="prof@exemple.fr"
          />

          <Input
            label="Téléphone"
            id="telephone"
            type="tel"
            value={form.telephone}
            onChange={(e) =>
              setForm((f) => ({ ...f, telephone: e.target.value }))
            }
            placeholder="+33 6 12 34 56 78"
          />

          <Input
            label="Spécialité"
            id="specialite"
            type="text"
            value={form.specialite}
            onChange={(e) =>
              setForm((f) => ({ ...f, specialite: e.target.value }))
            }
            placeholder="Ex. Judo, Ceinture noire 3e dan…"
          />

          <Input.Checkbox
            id="prof-actif"
            label="Professeur actif"
            checked={form.actif}
            onChange={(e) =>
              setForm((f) => ({ ...f, actif: e.target.checked }))
            }
          />
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
              "professor-form",
            ) as HTMLFormElement;
            if (formElement) {
              formElement.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true }),
              );
            }
          }}
          isLoading={saving}
          loadingText="Enregistrement…"
        >
          {editProfessor ? "Modifier" : "Créer"}
        </SubmitButton>
      </Modal.Footer>
    </Modal>
  );
}
