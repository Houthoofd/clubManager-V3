/**
 * ConfigurationTab
 * Onglet de configuration de la boutique (catégories et tailles)
 *
 * Extrait de StorePage.tsx pour une meilleure organisation du code
 */

import { useState } from "react";
import { useStoreUI } from "../../stores/storeStore";
import {
  useCategories,
  useSizes,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateSize,
  useUpdateSize,
  useDeleteSize,
} from "../../hooks/useStore";
import { CategoryModal, SizeModal } from "../";
import { AlertBanner } from "../../../../shared/components/Feedback/AlertBanner";
import { LoadingSpinner } from "../../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../../shared/components/Layout/EmptyState";
import {
  IconButton,
  PencilIcon,
  TrashIcon,
} from "../../../../shared/components/Button/IconButton";
import { ConfirmDialog } from "../../../../shared/components/Modal/ConfirmDialog";
import { getErrorMessage } from "../../../../shared/utils";

export function ConfigurationTab() {
  const store = useStoreUI();
  const categoriesQuery = useCategories();
  const sizesQuery = useSizes();

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const createSizeMutation = useCreateSize();
  const updateSizeMutation = useUpdateSize();
  const deleteSizeMutation = useDeleteSize();

  // États pour les ConfirmDialog
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<{
    isOpen: boolean;
    categoryId: number | null;
    categoryNom: string;
  }>({ isOpen: false, categoryId: null, categoryNom: "" });

  const [deleteSizeConfirm, setDeleteSizeConfirm] = useState<{
    isOpen: boolean;
    sizeId: number | null;
    sizeNom: string;
  }>({ isOpen: false, sizeId: null, sizeNom: "" });

  return (
    <div>
      {/* En-tête de l'onglet */}
      <div className="p-4 border-b border-gray-50">
        <h2 className="text-base font-semibold text-gray-900">
          Configuration de la boutique
        </h2>
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-8">
        {/* Section Catégories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Catégories</h3>
            <button
              onClick={() => store.openCategoryModal()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Nouvelle catégorie
            </button>
          </div>

          {categoriesQuery.isError && (
            <AlertBanner
              variant="error"
              message={getErrorMessage(categoriesQuery.error)}
            />
          )}

          {categoriesQuery.isLoading && <LoadingSpinner text="Chargement..." />}

          {!categoriesQuery.isLoading &&
            !categoriesQuery.isError &&
            !categoriesQuery.data?.length && (
              <EmptyState
                title="Aucune catégorie"
                description="Ajoutez des catégories pour organiser vos articles."
                variant="dashed"
              />
            )}

          {categoriesQuery.data && categoriesQuery.data.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Nom
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Ordre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categoriesQuery.data.map((category) => (
                      <tr
                        key={category.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {category.nom}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {category.description || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {category.ordre ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            {/* MIGRATION : IconButton pour éditer */}
                            <IconButton
                              icon={<PencilIcon className="h-4 w-4" />}
                              ariaLabel="Modifier la catégorie"
                              variant="ghost"
                              size="sm"
                              onClick={() => store.openCategoryModal(category)}
                              tooltip="Modifier"
                            />
                            {/* MIGRATION : IconButton pour supprimer */}
                            <IconButton
                              icon={<TrashIcon className="h-4 w-4" />}
                              ariaLabel="Supprimer la catégorie"
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setDeleteCategoryConfirm({
                                  isOpen: true,
                                  categoryId: category.id,
                                  categoryNom: category.nom,
                                })
                              }
                              tooltip="Supprimer"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Section Tailles */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tailles</h3>
            <button
              onClick={() => store.openSizeModal()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Nouvelle taille
            </button>
          </div>

          {sizesQuery.isError && (
            <AlertBanner
              variant="error"
              message={getErrorMessage(sizesQuery.error)}
            />
          )}

          {sizesQuery.isLoading && <LoadingSpinner text="Chargement..." />}

          {!sizesQuery.isLoading &&
            !sizesQuery.isError &&
            !sizesQuery.data?.length && (
              <EmptyState
                title="Aucune taille"
                description="Ajoutez des tailles pour vos articles (ex: XS, S, M, L, XL)."
                variant="dashed"
              />
            )}

          {sizesQuery.data && sizesQuery.data.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Nom
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Ordre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sizesQuery.data.map((size) => (
                      <tr
                        key={size.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {size.nom}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {size.ordre ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            {/* MIGRATION : IconButton pour éditer */}
                            <IconButton
                              icon={<PencilIcon className="h-4 w-4" />}
                              ariaLabel="Modifier la taille"
                              variant="ghost"
                              size="sm"
                              onClick={() => store.openSizeModal(size)}
                              tooltip="Modifier"
                            />
                            {/* MIGRATION : IconButton pour supprimer */}
                            <IconButton
                              icon={<TrashIcon className="h-4 w-4" />}
                              ariaLabel="Supprimer la taille"
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setDeleteSizeConfirm({
                                  isOpen: true,
                                  sizeId: size.id,
                                  sizeNom: size.nom,
                                })
                              }
                              tooltip="Supprimer"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={store.categoryModalOpen}
        onClose={store.closeCategoryModal}
        category={store.editingCategory ?? undefined}
        onSubmit={async (data) => {
          if (store.editingCategory) {
            await updateCategoryMutation.mutateAsync({
              id: store.editingCategory.id,
              data,
            });
          } else {
            await createCategoryMutation.mutateAsync(data);
          }
          store.closeCategoryModal();
        }}
      />

      <SizeModal
        isOpen={store.sizeModalOpen}
        onClose={store.closeSizeModal}
        size={store.editingSize ?? undefined}
        onSubmit={async (data: { nom: string; ordre?: number }) => {
          if (store.editingSize) {
            await updateSizeMutation.mutateAsync({
              id: store.editingSize.id,
              data,
            });
          } else {
            await createSizeMutation.mutateAsync(data);
          }
          store.closeSizeModal();
        }}
      />

      {/* MIGRATION : ConfirmDialog pour suppression de catégorie */}
      <ConfirmDialog
        isOpen={deleteCategoryConfirm.isOpen}
        onClose={() =>
          setDeleteCategoryConfirm({
            isOpen: false,
            categoryId: null,
            categoryNom: "",
          })
        }
        onConfirm={async () => {
          if (deleteCategoryConfirm.categoryId) {
            await deleteCategoryMutation.mutateAsync(
              deleteCategoryConfirm.categoryId,
            );
            setDeleteCategoryConfirm({
              isOpen: false,
              categoryId: null,
              categoryNom: "",
            });
          }
        }}
        title="Supprimer la catégorie"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${deleteCategoryConfirm.categoryNom}" ? Cette action est irréversible.`}
        variant="danger"
        isLoading={deleteCategoryMutation.isPending}
      />

      {/* MIGRATION : ConfirmDialog pour suppression de taille */}
      <ConfirmDialog
        isOpen={deleteSizeConfirm.isOpen}
        onClose={() =>
          setDeleteSizeConfirm({
            isOpen: false,
            sizeId: null,
            sizeNom: "",
          })
        }
        onConfirm={async () => {
          if (deleteSizeConfirm.sizeId) {
            await deleteSizeMutation.mutateAsync(deleteSizeConfirm.sizeId);
            setDeleteSizeConfirm({
              isOpen: false,
              sizeId: null,
              sizeNom: "",
            });
          }
        }}
        title="Supprimer la taille"
        message={`Êtes-vous sûr de vouloir supprimer la taille "${deleteSizeConfirm.sizeNom}" ? Cette action est irréversible.`}
        variant="danger"
        isLoading={deleteSizeMutation.isPending}
      />
    </div>
  );
}
