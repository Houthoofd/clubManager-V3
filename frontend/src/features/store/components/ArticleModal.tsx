/**
 * ArticleModal
 * Modal pour créer ou modifier un article du store.
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * ArticleModal — Modal de création / modification d'un article.
 *
 * - Si `article` est fourni  → mode édition (pré-remplit les champs)
 * - Si `article` est absent  → mode création
 * Fermeture sur Escape ou clic overlay (hors chargement).
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

  // ── Fermeture sur Escape ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // ── Bloquer le scroll du body ─────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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

  if (!isOpen) return null;

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-form-title"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── En-tête ── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2
              id="article-form-title"
              className="text-xl font-semibold text-gray-900"
            >
              {isEditMode ? "Modifier l'article" : "Nouvel article"}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting) onClose();
              }}
              disabled={isSubmitting}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Fermer"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? "Modifiez les informations de l'article existant."
              : "Ajoutez un nouvel article au catalogue du store."}
          </p>
        </div>

        {/* ── Formulaire ── */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="px-6 py-5 space-y-5"
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
              className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm
                          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                          focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                          transition-colors
                          ${errors.nom ? "border-red-400" : "border-gray-300"}`}
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
              className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-sm
                          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                          focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                          transition-colors
                          ${errors.prix ? "border-red-400" : "border-gray-300"}`}
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
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
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
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed
                         transition-colors resize-none"
              {...register("description")}
            />
          </div>

          {/* Actif */}
          <div className="flex items-center">
            <input
              id="article-actif"
              type="checkbox"
              disabled={isSubmitting}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500
                         disabled:opacity-50 disabled:cursor-not-allowed"
              {...register("actif")}
            />
            <label
              htmlFor="article-actif"
              className="ml-2 block text-sm text-gray-700"
            >
              Article actif (visible dans le catalogue)
            </label>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting) onClose();
              }}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200
                         active:bg-gray-300 rounded-lg transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white
                         bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm
                         transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting && <SpinnerIcon />}
              {isSubmitting
                ? "Enregistrement…"
                : isEditMode
                  ? "Mettre à jour"
                  : "Créer l'article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
