/**
 * ArticleModal
 * Modal pour créer ou modifier un article du store.
 * Utilise react-hook-form pour la gestion du formulaire.
 */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Modal, Button } from "../../../shared/components";
import { ImageUpload } from "../../../shared/components/ui/ImageUpload";
import { storeApi } from "../api/storeApi";

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
  image_url?: string;
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
  const { t } = useTranslation("store");
  const isEditMode = !!article;
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormData>({
    defaultValues: {
      nom: article?.nom ?? "",
      prix: article?.prix ?? undefined,
      description: article?.description ?? "",
      categorie_id: article?.categorie_id ?? undefined,
      actif: article?.actif ?? true,
      image_url: article?.image_url ?? undefined,
    },
  });

  const currentImageUrl = watch("image_url");

  // ── Synchronise les valeurs quand l'article change ou que la modal s'ouvre ──
  useEffect(() => {
    if (isOpen) {
      reset({
        nom: article?.nom ?? "",
        prix: article?.prix ?? ("" as unknown as number),
        description: article?.description ?? "",
        categorie_id: article?.categorie_id ?? ("" as unknown as number),
        actif: article?.actif ?? true,
        image_url: article?.image_url ?? undefined,
      });
      setIsUploadingImage(false);
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
      image_url?: string;
    } = {
      nom: data.nom,
      prix: Number(data.prix),
      description: data.description || undefined,
      categorie_id: data.categorie_id || undefined,
      actif: data.actif,
      image_url: data.image_url || undefined,
    };
    await onSubmit(payload);
    onClose();
  };

  // ── Upload Image ──────────────────────────────────────────────────────────
  const [localImages, setLocalImages] = useState<any[]>([]);

  useEffect(() => {
    if (article?.images) {
      setLocalImages(article.images);
    } else if (article?.image_url) {
      setLocalImages([{ id: 'fallback', url: article.image_url }]);
    } else {
      setLocalImages([]);
    }
  }, [article]);

  const handleImageSelected = async (file: File | null) => {
    if (!file) return;

    if (!article?.id) {
      alert("Veuillez créer l'article d'abord pour pouvoir uploader une image.");
      return;
    }

    try {
      setIsUploadingImage(true);
      const res = await storeApi.uploadArticleImage(article.id, file);
      setLocalImages((prev) => [...prev, res]);
    } catch (error) {
      console.error("Failed to upload image", error);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!article?.id) return;
    if (!confirm("Voulez-vous vraiment supprimer cette image ?")) return;

    try {
      await storeApi.deleteArticleImage(article.id, imageId);
      setLocalImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error("Failed to delete image", error);
      alert("Erreur lors de la suppression de l'image");
    }
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
        title={
          isEditMode
            ? t("articleModal.title.edit")
            : t("articleModal.title.create")
        }
        subtitle={
          isEditMode
            ? t("articleModal.subtitle.edit")
            : t("articleModal.subtitle.create")
        }
        onClose={isSubmitting ? undefined : onClose}
      />

      <Modal.Body>
        <form
          id="article-form"
          data-testid="article-form-modal"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5"
        >
          {/* Nom */}
          <div>
            <label
              htmlFor="article-nom"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              {t("articleModal.fields.name.label")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="article-nom"
              data-testid="input-article-name"
              type="text"
              placeholder={t("articleModal.fields.name.placeholder")}
              disabled={isSubmitting}
              className={`block w-full px-3 py-3 border rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                errors.nom ? "border-red-400" : "border-gray-300"
              }`}
              {...register("nom", {
                required: t("articleModal.fields.name.required"),
                minLength: {
                  value: 2,
                  message: t("articleModal.fields.name.minLength"),
                },
                maxLength: {
                  value: 100,
                  message: t("articleModal.fields.name.maxLength"),
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
              {t("articleModal.fields.price.label")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="article-prix"
              data-testid="input-article-price"
              type="number"
              step="0.01"
              min="0"
              placeholder={t("articleModal.fields.price.placeholder")}
              disabled={isSubmitting}
              className={`block w-full px-3 py-3 border rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                errors.prix ? "border-red-400" : "border-gray-300"
              }`}
              {...register("prix", {
                required: t("articleModal.fields.price.required"),
                min: {
                  value: 0,
                  message: t("articleModal.fields.price.min"),
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
              {t("articleModal.fields.category.label")}
              <span className="ml-1 text-xs text-gray-400 font-normal">
                {t("articleModal.fields.category.optional")}
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
              <option value="">{t("articleModal.fields.category.none")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Images
              <span className="ml-1 text-xs text-gray-400 font-normal">
                (Optionnel)
              </span>
            </label>
            
            {localImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {localImages.map((img) => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {img.id !== 'fallback' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {article?.id && (
              <ImageUpload
                currentImageUrl={null}
                onImageSelected={handleImageSelected}
                isUploading={isUploadingImage}
              />
            )}
            {!article?.id && (
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
                Vous pourrez ajouter des images une fois l'article créé.
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="article-description"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              {t("articleModal.fields.description.label")}
              <span className="ml-1 text-xs text-gray-400 font-normal">
                {t("articleModal.fields.description.optional")}
              </span>
            </label>
            <textarea
              id="article-description"
              rows={3}
              placeholder={t("articleModal.fields.description.placeholder")}
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
              {t("articleModal.fields.active.label")}
            </label>
          </div>
        </form>
      </Modal.Body>

      <Modal.Footer align="right">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          {t("articleModal.actions.cancel")}
        </Button>
        <Button
          type="submit"
          form="article-form"
          data-testid="btn-submit-article-form"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEditMode
            ? t("articleModal.actions.update")
            : t("articleModal.actions.create")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
