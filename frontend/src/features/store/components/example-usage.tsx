/**
 * EXEMPLE D'UTILISATION DES MODALS CategoryModal et SizeModal
 *
 * Ce fichier montre comment utiliser les modals CategoryModal et SizeModal
 * dans vos composants. Il ne fait pas partie du code source actif.
 */

import { useState } from "react";
import { CategoryModal, type CategoryFormData } from "./CategoryModal";
import { SizeModal, type SizeFormData } from "./SizeModal";
import type { Category, Size } from "../api/storeApi";
import { toast } from "react-hot-toast"; // ou votre bibliothèque de toast

// ============================================================================
// EXEMPLE 1 : Utilisation de CategoryModal
// ============================================================================

export function ExempleCategories() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

  // Handler pour créer une nouvelle catégorie
  const handleCreateCategory = () => {
    setSelectedCategory(undefined); // Pas de catégorie = mode création
    setIsCategoryModalOpen(true);
  };

  // Handler pour éditer une catégorie existante
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category); // Catégorie fournie = mode édition
    setIsCategoryModalOpen(true);
  };

  // Handler de soumission (création OU édition)
  const handleCategorySubmit = async (data: CategoryFormData) => {
    try {
      if (selectedCategory) {
        // Mode ÉDITION
        await fetch(`/api/categories/${selectedCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toast.success("Catégorie modifiée avec succès !");
      } else {
        // Mode CRÉATION
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toast.success("Catégorie créée avec succès !");
      }

      // Recharger la liste des catégories ici
      // await refetchCategories();
    } catch (error) {
      toast.error("Une erreur est survenue");
      throw error; // Re-throw pour que le modal reste ouvert
    }
  };

  return (
    <div>
      <button onClick={handleCreateCategory}>Nouvelle catégorie</button>

      {/* Liste des catégories avec bouton éditer */}
      {/* <CategoryList onEdit={handleEditCategory} /> */}

      {/* Modal de création/édition */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={selectedCategory}
        onSubmit={handleCategorySubmit}
      />
    </div>
  );
}

// ============================================================================
// EXEMPLE 2 : Utilisation de SizeModal
// ============================================================================

export function ExempleTailles() {
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | undefined>();

  // Handler pour créer une nouvelle taille
  const handleCreateSize = () => {
    setSelectedSize(undefined); // Pas de taille = mode création
    setIsSizeModalOpen(true);
  };

  // Handler pour éditer une taille existante
  const handleEditSize = (size: Size) => {
    setSelectedSize(size); // Taille fournie = mode édition
    setIsSizeModalOpen(true);
  };

  // Handler de soumission (création OU édition)
  const handleSizeSubmit = async (data: SizeFormData) => {
    try {
      if (selectedSize) {
        // Mode ÉDITION
        await fetch(`/api/sizes/${selectedSize.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toast.success("Taille modifiée avec succès !");
      } else {
        // Mode CRÉATION
        await fetch("/api/sizes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toast.success("Taille créée avec succès !");
      }

      // Recharger la liste des tailles ici
      // await refetchSizes();
    } catch (error) {
      toast.error("Une erreur est survenue");
      throw error; // Re-throw pour que le modal reste ouvert
    }
  };

  return (
    <div>
      <button onClick={handleCreateSize}>Nouvelle taille</button>

      {/* Liste des tailles avec bouton éditer */}
      {/* <SizeList onEdit={handleEditSize} /> */}

      {/* Modal de création/édition */}
      <SizeModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        size={selectedSize}
        onSubmit={handleSizeSubmit}
      />
    </div>
  );
}

// ============================================================================
// EXEMPLE 3 : Utilisation avec React Query / TanStack Query
// ============================================================================

export function ExempleAvecReactQuery() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

  // Mutation pour créer/éditer une catégorie
  // const createCategoryMutation = useMutation({
  //   mutationFn: (data: CategoryFormData) =>
  //     fetch("/api/categories", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(data),
  //     }).then(res => res.json()),
  //   onSuccess: () => {
  //     toast.success("Catégorie créée avec succès !");
  //     queryClient.invalidateQueries({ queryKey: ["categories"] });
  //   },
  //   onError: () => {
  //     toast.error("Erreur lors de la création");
  //   },
  // });

  const handleCategorySubmit = async (data: CategoryFormData) => {
    if (selectedCategory) {
      // await updateCategoryMutation.mutateAsync({ id: selectedCategory.id, ...data });
    } else {
      // await createCategoryMutation.mutateAsync(data);
    }
  };

  return (
    <div>
      <button onClick={() => setIsCategoryModalOpen(true)}>
        Nouvelle catégorie
      </button>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={selectedCategory}
        onSubmit={handleCategorySubmit}
      />
    </div>
  );
}

// ============================================================================
// EXEMPLE 4 : Utilisation avec Zustand Store
// ============================================================================

// Si vous utilisez le storeStore existant :
// import { useStoreStore } from "../stores/storeStore";

export function ExempleAvecZustand() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

  // const { createCategory, updateCategory } = useStoreStore();

  const handleCategorySubmit = async (data: CategoryFormData) => {
    try {
      if (selectedCategory) {
        // await updateCategory(selectedCategory.id, data);
        toast.success("Catégorie modifiée avec succès !");
      } else {
        // await createCategory(data);
        toast.success("Catégorie créée avec succès !");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
      throw error;
    }
  };

  return (
    <div>
      <button onClick={() => setIsCategoryModalOpen(true)}>
        Nouvelle catégorie
      </button>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={selectedCategory}
        onSubmit={handleCategorySubmit}
      />
    </div>
  );
}

// ============================================================================
// NOTES IMPORTANTES
// ============================================================================

/**
 * 1. GESTION DES TOASTS
 *    - Les toasts de succès sont gérés par le PARENT (pas dans le modal)
 *    - Les toasts d'erreur peuvent être gérés dans le parent ou le modal
 *
 * 2. FERMETURE DU MODAL
 *    - Le modal se ferme automatiquement après une soumission réussie
 *    - Si onSubmit lance une erreur, le modal reste ouvert
 *
 * 3. MODE ÉDITION VS CRÉATION
 *    - Si la prop category/size est fournie → mode édition
 *    - Si la prop category/size est undefined → mode création
 *
 * 4. RESET DU FORMULAIRE
 *    - Le formulaire est automatiquement réinitialisé quand le modal s'ouvre
 *    - Utilisé useEffect avec reset() dans le modal
 *
 * 5. BLOCAGE DU SCROLL
 *    - Le scroll du body est automatiquement bloqué quand le modal est ouvert
 *    - Restauré automatiquement à la fermeture
 *
 * 6. FERMETURE SUR ESCAPE
 *    - La touche Escape ferme le modal (sauf si isSubmitting)
 *    - Le clic sur l'overlay ferme aussi le modal (sauf si isSubmitting)
 *
 * 7. VALIDATION
 *    - Nom : requis, min 2 caractères (catégorie) / 1 caractère (taille)
 *    - Description : optionnel (catégorie uniquement)
 *    - Ordre : optionnel, >= 0
 */
