/**
 * ArticleModal
 * Modal pour créer ou modifier un article du store.
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal, Button } from "../../../shared/components";

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
          <div>
            <label
              htmlFor="article-nom"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Nom de l'article <span className="text-red-500">*</span>
            </label>
            <input
              id="article-nom"
              type="text"
              placeholder="Ex : T-shirt, Casquette, Gourde…"
              disabled={isSubmitting}
              className={`block w-full px-3 py-3 border rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                errors.nom ? "border-red-400" : "border-gray-300"
              }`}
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
            {errors.nom && (
              <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>
            )}
          </div>

          {/* Prix */}
          <div>
            <label
              htmlFor="article-prix"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Prix (€) <span className="text-red-500">*</span>
            </label>
            <input
              id="article-prix"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              disabled={isSubmitting}
              className={`block w-full px-3 py-3 border rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                errors.prix ? "border-red-400" : "border-gray-300"
              }`}
              {...register("prix", {
                required: "Le prix est requis.",
                min: {
                  value: 0,
                  message: "Le prix doit être supérieur ou égal à 0.",
                },
                valueAsNumber: true,
              })}
            />
            {errors.prix && (
              <p className="mt-1 text-xs text-red-600">{errors.prix.message}</p>
            )}
          </div>

          {/* Catégorie */}
          <div>
            <label
              htmlFor="article-categorie"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Catégorie
              <span className="ml-1 text-xs text-gray-400 font-normal">
                (optionnel)
              </span>
            </label>
            <select
              id="article-categorie"
              disabled={isSubmitting}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
              {...register("categorie_id", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
            >
              <option value="">Aucune catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="article-description"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Description
              <span className="ml-1 text-xs text-gray-400 font-normal">
                (optionnel)
              </span>
            </label>
            <textarea
              id="article-description"
              rows={3}
              placeholder="Décrivez l'article…"
              disabled={isSubmitting}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors resize-y"
              {...register("description")}
            />
          </div>

          {/* Actif */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="article-actif"
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
              {...register("actif")}
            />
            <label htmlFor="article-actif" className="text-sm text-gray-700">
              Article actif (visible dans le catalogue)
            </label>
          </div>
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
