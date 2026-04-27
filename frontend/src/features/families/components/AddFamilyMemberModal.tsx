/**
 * AddFamilyMemberModal
 * Modal d'ajout d'un membre à la famille. Utilise react-hook-form + zod + sonner.
 * Migré vers les composants centralisés Modal, Input, Button.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useRolesFamilial } from "../../../shared/hooks/useReferences";
import { InfoCircleIcon } from "@patternfly/react-icons";
import { useFamily } from "../hooks/useFamily";
import type { AddFamilyMemberDto } from "@clubmanager/types";
import { Modal, Input, Button, FormField } from "../../../shared/components";
import { FORM } from "../../../shared/styles/designTokens";

// ─── Schéma de validation ────────────────────────────────────────────────────

// Schema will be created inside component to access t() function

type AddMemberFormData = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  genre_id: string;
  role: string;
};

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
  const { t, i18n } = useTranslation("families");
  const { addMember } = useFamily();
  const rolesFamilial = useRolesFamilial();

  // Create schema with translation
  const addMemberSchema = z.object({
    first_name: z
      .string()
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100),
    last_name: z
      .string()
      .min(2, t("validation.minLength", { count: 2 }))
      .max(100),
    date_of_birth: z.string().min(1, t("validation.required")),
    genre_id: z.string().min(1, t("validation.required")),
    role: z.string().min(1, t("validation.required")),
  });

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
      role:
        rolesFamilial.length > 0
          ? (rolesFamilial[0]?.code ?? "enfant")
          : "enfant",
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
      role: data.role as import("@clubmanager/types").FamilyMemberRole,
    };

    const result = await addMember(dto);

    if (result.success) {
      toast.success(t("messages.success.memberAdded"), {
        description: t("messages.success.memberAddedDescription", {
          firstName: data.first_name,
          lastName: data.last_name,
        }),
      });
      reset();
      onSuccess();
    } else {
      toast.error(t("messages.error.addError"), {
        description: result.error ?? t("messages.error.genericError"),
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <Modal.Header title={t("modal.addTitle")} onClose={handleClose} />

      <Modal.Body>
        {/* ── Boîte d'information ── */}
        <div className="mb-5 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 leading-relaxed flex items-start gap-2">
          <InfoCircleIcon
            className="h-4 w-4 mt-0.5 flex-shrink-0"
            aria-hidden="true"
          />
          <span>
            <span className="font-medium">{t("modal.infoTitle")}</span>{" "}
            {t("modal.infoDescription")}
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
            <FormField
              id="first_name"
              label={t("fields.firstName")}
              required
              error={errors.first_name?.message}
            >
              <Input
                id="first_name"
                type="text"
                placeholder={t("placeholders.firstName")}
                autoComplete="off"
                {...register("first_name")}
              />
            </FormField>

            <FormField
              id="last_name"
              label={t("fields.lastName")}
              required
              error={errors.last_name?.message}
            >
              <Input
                id="last_name"
                type="text"
                placeholder={t("placeholders.lastName")}
                autoComplete="off"
                {...register("last_name")}
              />
            </FormField>
          </div>

          {/* Date de naissance */}
          <FormField
            id="date_of_birth"
            label={t("fields.dateOfBirth")}
            required
            error={errors.date_of_birth?.message}
          >
            <Input
              id="date_of_birth"
              type="date"
              max={getTodayString()}
              {...register("date_of_birth")}
            />
          </FormField>

          {/* Genre / Rôle (2 colonnes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="genre_id"
              label={t("fields.genre")}
              required
              error={errors.genre_id?.message}
            >
              <select
                id="genre_id"
                className={FORM.select}
                {...register("genre_id")}
              >
                <option value="">{t("genres.select")}</option>
                <option value="1">{t("genres.homme")}</option>
                <option value="2">{t("genres.femme")}</option>
                <option value="3">{t("genres.autre")}</option>
              </select>
            </FormField>

            <FormField
              id="role"
              label={t("fields.role")}
              required
              error={errors.role?.message}
            >
              <select id="role" className={FORM.select} {...register("role")}>
                {rolesFamilial.length > 0 ? (
                  rolesFamilial.map((r) => (
                    <option key={r.code} value={r.code}>
                      {i18n.language === "en" && r.nom_en ? r.nom_en : r.nom}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="parent">{t("roles.parent")}</option>
                    <option value="enfant">{t("roles.enfant")}</option>
                    <option value="conjoint">{t("roles.conjoint")}</option>
                    <option value="tuteur">{t("roles.tuteur")}</option>
                    <option value="autre">{t("roles.autre")}</option>
                  </>
                )}
              </select>
            </FormField>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer align="right">
        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
          {t("actions.cancel")}
        </Button>
        <Button
          type="submit"
          form="add-member-form"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {t("modal.addButton")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
