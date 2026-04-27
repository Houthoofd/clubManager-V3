/**
 * ConfigurationTab
 * Onglet de configuration de la boutique (catégories et tailles)
 *
 * Extrait de StorePage.tsx pour une meilleure organisation du code
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("store");
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
          {t("configuration.title")}
        </h2>
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-8">
        {/* Section Catégories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("configuration.categories.title")}
            </h3>
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
              {t("configuration.categories.new")}
            </button>
          </div>

          {categoriesQuery.isError && (
            <AlertBanner
              variant="error"
              message={getErrorMessage(categoriesQuery.error)}
            />
          )}

          {categoriesQuery.isLoading && (
            <LoadingSpinner text={t("common.loading")} />
          )}

          {!categoriesQuery.isLoading &&
            !categoriesQuery.isError &&
            !categoriesQuery.data?.length && (
              <EmptyState
                title={t("configuration.categories.empty.title")}
                description={t("configuration.categories.empty.description")}
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
                        {t("configuration.categories.table.name")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t("configuration.categories.table.description")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t("configuration.categories.table.order")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t("configuration.categories.table.actions")}
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
                              ariaLabel={t(
                                "configuration.actions.editCategory",
                              )}
                              variant="ghost"
                              size="sm"
                              onClick={() => store.openCategoryModal(category)}
                              tooltip={t("configuration.actions.edit")}
                            />
                            {/* MIGRATION : IconButton pour supprimer */}
                            <IconButton
                              icon={<TrashIcon className="h-4 w-4" />}
                              ariaLabel={t(
                                "configuration.actions.deleteCategory",
                              )}
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setDeleteCategoryConfirm({
                                  isOpen: true,
                                  categoryId: category.id,
                                  categoryNom: category.nom,
                                })
                              }
                              tooltip={t("configuration.actions.delete")}
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
            <h3 className="text-lg font-semibold text-gray-900">
              {t("configuration.sizes.title")}
            </h3>
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
              {t("configuration.sizes.new")}
            </button>
          </div>

          {sizesQuery.isError && (
            <AlertBanner
              variant="error"
              message={getErrorMessage(sizesQuery.error)}
            />
          )}

          {sizesQuery.isLoading && (
            <LoadingSpinner text={t("common.loading")} />
          )}

          {!sizesQuery.isLoading &&
            !sizesQuery.isError &&
            !sizesQuery.data?.length && (
              <EmptyState
                title={t("configuration.sizes.empty.title")}
                description={t("configuration.sizes.empty.description")}
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
                        {t("configuration.sizes.table.name")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t("configuration.sizes.table.order")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t("configuration.sizes.table.actions")}
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
                              ariaLabel={t("configuration.actions.editSize")}
                              variant="ghost"
                              size="sm"
                              onClick={() => store.openSizeModal(size)}
                              tooltip={t("configuration.actions.edit")}
                            />
                            {/* MIGRATION : IconButton pour supprimer */}
                            <IconButton
                              icon={<TrashIcon className="h-4 w-4" />}
                              ariaLabel={t("configuration.actions.deleteSize")}
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                setDeleteSizeConfirm({
                                  isOpen: true,
                                  sizeId: size.id,
                                  sizeNom: size.nom,
                                })
                              }
                              tooltip={t("configuration.actions.delete")}
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
        title={t("configuration.categories.delete.title")}
        message={t("configuration.categories.delete.message", {
          categoryNom: deleteCategoryConfirm.categoryNom,
        })}
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
        title={t("configuration.sizes.delete.title")}
        message={t("configuration.sizes.delete.message", {
          sizeNom: deleteSizeConfirm.sizeNom,
        })}
        variant="danger"
        isLoading={deleteSizeMutation.isPending}
      />
    </div>
  );
}
