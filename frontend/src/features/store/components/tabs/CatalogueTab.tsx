/**
 * CatalogueTab
 * Onglet de gestion du catalogue des articles pour la boutique
 *
 * Extrait de StorePage.tsx pour une meilleure organisation du code
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStoreUI } from "../../stores/storeStore";
import {
  useCategories,
  useArticles,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useToggleArticle,
} from "../../hooks/useStore";
import { ArticleModal } from "../";
import { Badge } from "../../../../shared/components/Badge/Badge";
import { LoadingSpinner } from "../../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../../shared/components/Layout/EmptyState";
import { AlertBanner } from "../../../../shared/components/Feedback/AlertBanner";
import { ConfirmDialog } from "../../../../shared/components/Modal/ConfirmDialog";
import { PaginationBar } from "../../../../shared/components/Navigation/PaginationBar";
import { SelectField } from "../../../../shared/components/Forms/SelectField";
import {
  cn,
  getErrorMessage,
  formatCurrency,
  formatDate,
} from "../../../../shared/utils";

export function CatalogueTab() {
  const { t } = useTranslation("store");
  const store = useStoreUI();
  const categoriesQuery = useCategories();
  const actif =
    store.articleActifFilter === "true"
      ? true
      : store.articleActifFilter === "false"
        ? false
        : undefined;

  const articlesQuery = useArticles({
    search: store.articleSearch || undefined,
    categorie_id: store.articleCategoryFilter ?? undefined,
    actif,
    page: store.articlePage,
    limit: 12,
  });

  const createArticleMutation = useCreateArticle();
  const updateArticleMutation = useUpdateArticle();
  const deleteArticleMutation = useDeleteArticle();
  const toggleArticleMutation = useToggleArticle();

  // États pour les ConfirmDialog
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    articleId: number | null;
    articleNom: string;
  }>({ isOpen: false, articleId: null, articleNom: "" });

  return (
    <div>
      {/* En-tête de l'onglet */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">
            {t("catalogue.title")}
          </h2>
          <Badge variant="info">
            {articlesQuery.data?.pagination.total ?? 0}{" "}
            {(articlesQuery.data?.pagination.total ?? 0) > 1
              ? t("catalogue.count.articles")
              : t("catalogue.count.article")}
          </Badge>
          {categoriesQuery.data && categoriesQuery.data.length > 0 && (
            <Badge variant="purple">
              {categoriesQuery.data.length}{" "}
              {categoriesQuery.data.length > 1
                ? t("catalogue.count.categories")
                : t("catalogue.count.category")}
            </Badge>
          )}
        </div>
        <button
          onClick={() => store.openArticleModal()}
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
          {t("catalogue.newArticle")}
        </button>
      </div>

      {/* Filtres - MIGRATION : Utilisation de SelectField */}
      <div className="p-4 border-b border-gray-50">
        <div className="grid gap-3 md:grid-cols-3">
          {/* Barre de recherche (pas de composant réutilisable disponible) */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </span>
            <input
              value={store.articleSearch}
              onChange={(event) => store.setArticleSearch(event.target.value)}
              placeholder={t("catalogue.filters.search")}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Filtre catégorie - MIGRATION : SelectField */}
          <SelectField
            id="article-category-filter"
            label=""
            placeholder={t("catalogue.filters.allCategories")}
            options={
              categoriesQuery.data?.map((cat) => ({
                value: cat.id,
                label: cat.nom,
              })) ?? []
            }
            value={store.articleCategoryFilter ?? ""}
            onChange={(value) =>
              store.setArticleCategoryFilter(value ? Number(value) : null)
            }
            className="[&>label]:hidden"
          />

          {/* Filtre statut - MIGRATION : SelectField */}
          <SelectField
            id="article-status-filter"
            label=""
            placeholder={t("catalogue.filters.allStatuses")}
            options={[
              { value: "true", label: t("catalogue.filters.active") },
              { value: "false", label: t("catalogue.filters.inactive") },
            ]}
            value={store.articleActifFilter}
            onChange={(value) => store.setArticleActifFilter(String(value))}
            className="[&>label]:hidden"
          />
        </div>
      </div>

      {/* Contenu - MIGRATION : LoadingSpinner, ErrorBanner, EmptyState */}
      <div className="p-4">
        {categoriesQuery.isError && (
          <AlertBanner
            variant="error"
            message={getErrorMessage(categoriesQuery.error)}
          />
        )}
        {articlesQuery.isError && (
          <AlertBanner
            variant="error"
            message={getErrorMessage(articlesQuery.error)}
          />
        )}

        {articlesQuery.isLoading && (
          <LoadingSpinner text={t("common.loading")} />
        )}

        {!articlesQuery.isLoading &&
          !articlesQuery.isError &&
          !articlesQuery.data?.items.length && (
            <EmptyState
              title={t("catalogue.empty.title")}
              description={t("catalogue.empty.description")}
              variant="dashed"
            />
          )}

        {articlesQuery.data?.items.length ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {articlesQuery.data.items.map((article) => (
                <article
                  key={article.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {article.nom}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {article.categorie_nom ??
                          t("catalogue.card.noCategory")}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        article.actif
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {article.actif
                        ? t("catalogue.card.active")
                        : t("catalogue.card.inactive")}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-3 min-h-[3.75rem] text-sm text-gray-600">
                    {article.description || t("catalogue.card.noDescription")}
                  </p>

                  <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(article.prix)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {t("catalogue.card.createdOn")}{" "}
                        {formatDate(article.created_at)}
                      </span>
                    </div>

                    {/* Actions - MIGRATION : Utilisation de IconButton */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => store.openArticleModal(article)}
                        className="flex-1 rounded-lg border border-blue-600 bg-white px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        {t("catalogue.actions.edit")}
                      </button>
                      <button
                        onClick={async () => {
                          await toggleArticleMutation.mutateAsync(article.id);
                        }}
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        {article.actif
                          ? t("catalogue.actions.deactivate")
                          : t("catalogue.actions.activate")}
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            articleId: article.id,
                            articleNom: article.nom,
                          })
                        }
                        className="rounded-lg border border-red-600 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        {t("catalogue.actions.delete")}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <PaginationBar
              currentPage={articlesQuery.data.pagination.page}
              totalPages={articlesQuery.data.pagination.totalPages}
              onPageChange={store.setArticlePage}
              showResultsCount
              total={articlesQuery.data.pagination.total}
              pageSize={12}
            />
          </div>
        ) : null}
      </div>

      {/* Modal Article */}
      <ArticleModal
        isOpen={store.articleModalOpen}
        onClose={store.closeArticleModal}
        article={store.editingArticle ?? undefined}
        categories={categoriesQuery.data ?? []}
        onSubmit={async (data) => {
          if (store.editingArticle) {
            await updateArticleMutation.mutateAsync({
              id: store.editingArticle.id,
              data,
            });
          } else {
            await createArticleMutation.mutateAsync(data);
          }
          store.closeArticleModal();
        }}
      />

      {/* MIGRATION : ConfirmDialog pour la suppression */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, articleId: null, articleNom: "" })
        }
        onConfirm={async () => {
          if (deleteConfirm.articleId) {
            await deleteArticleMutation.mutateAsync(deleteConfirm.articleId);
            setDeleteConfirm({
              isOpen: false,
              articleId: null,
              articleNom: "",
            });
          }
        }}
        title={t("catalogue.delete.title")}
        message={t("catalogue.delete.message", {
          articleNom: deleteConfirm.articleNom,
        })}
        variant="danger"
        isLoading={deleteArticleMutation.isPending}
      />
    </div>
  );
}
