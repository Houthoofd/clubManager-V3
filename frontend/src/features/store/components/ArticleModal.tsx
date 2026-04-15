/**
 * ArticleModal
 * Modal pour créer ou modifier un article du store.
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal, Input, Button } from "../../../shared/components";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  nom: string;
  description?: string | null;
  ordre: number;
  nombre_articles?: number;
  nombre_articles_actifs?: number;
}

interface Article {
  id: number;
  nom: string;
  description?: string | null;
  prix: number;
  image_url?: string | null;
  categorie_id?: number | null;
  categorie_nom?: string | null;
  actif: boolean;
  created_at: string;
}

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: Article;
  categories: Category[];
  onSubmit: (data: {
    nom: string;
    prix: number;
    description?: string;
    categorie_id?: number;
    actif?: boolean;
  }) => Promise<void>;
}

interface ArticleFormData {
  nom: string;
  prix: number;
  description?: string;
  categorie_id?: number;
  actif: boolean;
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * ArticleModal — Modal de création / modification d'un article.
 *
 * - Si `article` est fourni  → mode édition (pré-remplit les champs)
 * - Si `article` est absent  → mode création
 * Fermeture sur Escape ou clic overlay gérée automatiquement par Modal.
 */
export const ArticleModal: React.FC<ArticleModalProps> = ({
  isOpen,
  onClose,
  article,
  categories,
  onSubmit,
}) => {
  const isEditMode = !!article;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormData>({
    defaultValues: {
      nom: article?.nom ?? "",
      prix: article?.prix ?? undefined,
      description: article?.description ?? "",
      categorie_id: article?.categorie_id ?? undefined,
      actif: article?.actif ?? true,
    },
  });

  // ── Synchronise les valeurs quand l'article change ou que la modal s'ouvre ──
  useEffect(() => {
    if (isOpen) {
      reset({
        nom: article?.nom ?? "",
        prix: article?.prix ?? ("" as unknown as number),
        description: article?.description ?? "",
        categorie_id: article?.categorie_id ?? ("" as unknown as number),
        actif: article?.actif ?? true,
      });
    }
  }, [isOpen, article, reset]);

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: ArticleFormData) => {
    const payload: {
      nom: string;
      prix: number;
      description?: string;
      categorie_id?: number;
      actif?: boolean;
    } = {
      nom: data.nom,
      prix: Number(data.prix),
      description: data.description || undefined,
      categorie_id: data.categorie_id || undefined,
      actif: data.actif,
    };
    await onSubmit(payload);
    onClose();
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <Modal.Header
        title={isEditMode ? "Modifier l'article" : "Nouvel article"}
        subtitle={
          isEditMode
            ? "Modifiez les informations de l'article existant."
            : "Ajoutez un nouvel article au catalogue du store."
        }
        onClose={isSubmitting ? undefined : onClose}
      />

      <Modal.Body>
        <form
          id="article-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5"
        >
          {/* Nom */}
          <Input
            id="article-nom"
            label="Nom de l'article"
            type="text"
            placeholder="Ex : T-shirt, Casquette, Gourde…"
            disabled={isSubmitting}
            required
            error={errors.nom?.message}
            {...register("nom", {
              required: "Le nom de l'article est requis.",
              minLength: {
                value: 2,
                message: "Le nom doit comporter au moins 2 caractères.",
              },
              maxLength: {
                value: 100,
                message: "Le nom ne peut pas dépasser 100 caractères.",
              },
            })}
          />

          {/* Prix */}
          <Input
            id="article-prix"
            label="Prix (€)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            disabled={isSubmitting}
            required
            error={errors.prix?.message}
            {...register("prix", {
              required: "Le prix est requis.",
              min: {
                value: 0,
                message: "Le prix doit être supérieur ou égal à 0.",
              },
              valueAsNumber: true,
            })}
          />

          {/* Catégorie */}
          {/* @ts-ignore - Type issue with compound component */}
          <Input.Select
            id="article-categorie"
            label="Catégorie"
            disabled={isSubmitting}
            helperText="(optionnel)"
            options={[
              { value: "", label: "Aucune catégorie" },
              ...categories.map((cat) => ({
                value: cat.id,
                label: cat.nom,
              })),
            ]}
            {...register("categorie_id", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          />

          {/* Description */}
          {/* @ts-ignore - Type issue with compound component */}
          <Input.Textarea
            id="article-description"
            label="Description"
            rows={3}
            placeholder="Décrivez l'article…"
            disabled={isSubmitting}
            helperText="(optionnel)"
            {...register("description")}
          />

          {/* Actif */}
          {/* @ts-ignore - Type issue with compound component */}
          <Input.Checkbox
            id="article-actif"
            label="Article actif (visible dans le catalogue)"
            disabled={isSubmitting}
            {...register("actif")}
          />
        </form>
      </Modal.Body>

      <Modal.Footer align="right">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button
          type="submit"
          form="article-form"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEditMode ? "Mettre à jour" : "Créer l'article"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
