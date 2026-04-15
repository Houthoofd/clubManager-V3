/**
 * AddFamilyMemberModal
 * Modal d'ajout d'un membre à la famille. Utilise react-hook-form + zod + sonner.
 * Migré vers les composants centralisés Modal, Input, Button.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { InfoCircleIcon } from "@patternfly/react-icons";
import { useFamily } from "../hooks/useFamily";
import type { AddFamilyMemberDto } from "@clubmanager/types";
import { Modal, Input, Button } from "../../../shared/components";

// ─── Schéma de validation ────────────────────────────────────────────────────

const addMemberSchema = z.object({
  first_name: z.string().min(2, "Au moins 2 caractères").max(100),
  last_name: z.string().min(2, "Au moins 2 caractères").max(100),
  date_of_birth: z.string().min(1, "Requis"),
  genre_id: z.string().min(1, "Requis"),
  role: z.enum(["enfant", "conjoint", "autre"]),
});

type AddMemberFormData = z.infer<typeof addMemberSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────

interface AddFamilyMemberModalProps {
  /** Contrôle la visibilité de la modal */
  isOpen: boolean;
  /** Callback de fermeture de la modal */
  onClose: () => void;
  /** Callback appelé après un ajout réussi */
  onSuccess: () => void;
}

// ─── Utilitaire ──────────────────────────────────────────────────────────────

/** Retourne la date d'aujourd'hui au format YYYY-MM-DD pour l'attribut max. */
function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ─── Composant ───────────────────────────────────────────────────────────────

/**
 * AddFamilyMemberModal — Modal d'ajout d'un membre de famille.
 *
 * Affiche un formulaire validé par zod permettant d'ajouter un membre sans
 * email ni mot de passe. Utilise les composants centralisés Modal, Input, Button.
 */
export function AddFamilyMemberModal({
  isOpen,
  onClose,
  onSuccess,
}: AddFamilyMemberModalProps) {
  const { addMember } = useFamily();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    mode: "onBlur",
    defaultValues: {
      first_name: "",
      last_name: "",
      date_of_birth: "",
      genre_id: "",
      role: "enfant",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: AddMemberFormData) => {
    const dto: AddFamilyMemberDto = {
      first_name: data.first_name,
      last_name: data.last_name,
      date_of_birth: data.date_of_birth,
      genre_id: Number(data.genre_id),
      role: data.role,
    };

    const result = await addMember(dto);

    if (result.success) {
      toast.success("Membre ajouté !", {
        description: `${data.first_name} ${data.last_name} a été ajouté à la famille.`,
      });
      reset();
      onSuccess();
    } else {
      toast.error("Erreur lors de l'ajout", {
        description: result.error ?? "Une erreur est survenue.",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <Modal.Header
        title="Ajouter un membre de la famille"
        onClose={handleClose}
      />

      <Modal.Body>
        {/* ── Boîte d'information ── */}
        <div className="mb-5 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 leading-relaxed flex items-start gap-2">
          <InfoCircleIcon
            className="h-4 w-4 mt-0.5 flex-shrink-0"
            aria-hidden="true"
          />
          <span>
            <span className="font-medium">Sans compte requis —</span> Aucun
            email ni mot de passe requis. Un identifiant unique (userId) sera
            généré automatiquement.
          </span>
        </div>

        {/* ── Formulaire ── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
          id="add-member-form"
        >
          {/* Prénom / Nom (2 colonnes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="first_name"
              label="Prénom"
              type="text"
              placeholder="Marie"
              autoComplete="off"
              required
              error={errors.first_name?.message}
              {...register("first_name")}
            />

            <Input
              id="last_name"
              label="Nom"
              type="text"
              placeholder="Dupont"
              autoComplete="off"
              required
              error={errors.last_name?.message}
              {...register("last_name")}
            />
          </div>

          {/* Date de naissance */}
          <Input
            id="date_of_birth"
            label="Date de naissance"
            type="date"
            max={getTodayString()}
            required
            error={errors.date_of_birth?.message}
            {...register("date_of_birth")}
          />

          {/* Genre / Rôle (2 colonnes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input.Select
              id="genre_id"
              label="Genre"
              required
              error={errors.genre_id?.message}
              {...register("genre_id")}
            >
              <option value="">Sélectionner…</option>
              <option value="1">Homme</option>
              <option value="2">Femme</option>
              <option value="3">Autre / Non spécifié</option>
            </Input.Select>

            <Input.Select
              id="role"
              label="Rôle"
              required
              error={errors.role?.message}
              {...register("role")}
            >
              <option value="enfant">Enfant</option>
              <option value="conjoint">Conjoint(e)</option>
              <option value="autre">Autre</option>
            </Input.Select>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer align="right">
        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button
          type="submit"
          form="add-member-form"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Ajouter le membre
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
