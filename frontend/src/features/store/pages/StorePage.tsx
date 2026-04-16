/**
 * StorePage
 * Page principale du module boutique.
 *
 * MIGRATION : Utilise les composants réutilisables de la bibliothèque shared
 * - TabGroup pour la navigation par onglets
 * - SelectField pour les filtres/dropdowns
 * - IconButton pour les actions (edit, delete, adjust)
 * - ConfirmDialog pour les confirmations
 * - LoadingSpinner, EmptyState, ErrorBanner pour le feedback
 */

import { useEffect, useState } from "react";
import { UserRole } from "@clubmanager/types";
import { useAuth } from "../../../shared/hooks/useAuth";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { StockBadge } from "../components/StockBadge";
import {
  CategoryModal,
  SizeModal,
  ArticleModal,
  StockAdjustModal,
  QuickOrderModal,
  OrderDetailModal,
  CartModal,
} from "../components";
import {
  useArticles,
  useCategories,
  useLowStocks,
  useMyOrders,
  useOrders,
  useSizes,
  useStocks,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateSize,
  useUpdateSize,
  useDeleteSize,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useToggleArticle,
  useAdjustStock,
  useCreateOrder,
  useUpdateOrderStatus,
} from "../hooks/useStore";
import { useStoreUI } from "../stores/storeStore";

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTS DES COMPOSANTS RÉUTILISABLES
// ═══════════════════════════════════════════════════════════════════════════

import { TabGroup } from "../../../shared/components/Navigation/TabGroup";
import { SelectField } from "../../../shared/components/Forms/SelectField";
import {
  IconButton,
  PencilIcon,
  TrashIcon,
} from "../../../shared/components/Button/IconButton";
import { ConfirmDialog } from "../../../shared/components/Modal/ConfirmDialog";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { LoadingSpinner } from "../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../shared/components/Layout/EmptyState";
import { AlertBanner } from "../../../shared/components/Feedback/AlertBanner";

// ═══════════════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Impossible de charger les données du module boutique.";
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("fr-FR");
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PAGINATION (Conservé car pas de composant réutilisable équivalent)
// ═══════════════════════════════════════════════════════════════════════════

function PaginationBar({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{page}</span> sur{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Précédent</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Suivant</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ONGLET : CATALOGUE (Admin/Prof)
// ═══════════════════════════════════════════════════════════════════════════

function CatalogueTab() {
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
            Catalogue des articles
          </h2>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {articlesQuery.data?.pagination.total ?? 0} article
            {(articlesQuery.data?.pagination.total ?? 0) > 1 ? "s" : ""}
          </span>
          {categoriesQuery.data && categoriesQuery.data.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
              {categoriesQuery.data.length} catégorie
              {categoriesQuery.data.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          onClick={() => store.openArticleModal()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
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
          Nouvel article
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
              placeholder="Rechercher un article…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Filtre catégorie - MIGRATION : SelectField */}
          <SelectField
            id="article-category-filter"
            label=""
            placeholder="Toutes les catégories"
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
            placeholder="Tous les statuts"
            options={[
              { value: "true", label: "Actifs" },
              { value: "false", label: "Inactifs" },
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

        {articlesQuery.isLoading && <LoadingSpinner text="Chargement..." />}

        {!articlesQuery.isLoading &&
          !articlesQuery.isError &&
          !articlesQuery.data?.items.length && (
            <EmptyState
              title="Aucun article trouvé"
              description="Ajustez les filtres ou ajoutez des articles dans le catalogue."
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
                        {article.categorie_nom ?? "Sans catégorie"}
                      </p>
                    </div>
                    <span
                      className={classNames(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        article.actif
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {article.actif ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-3 min-h-[3.75rem] text-sm text-gray-600">
                    {article.description || "Aucune description disponible."}
                  </p>

                  <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(article.prix)}
                      </span>
                      <span className="text-xs text-gray-400">
                        Créé le {formatDate(article.created_at)}
                      </span>
                    </div>

                    {/* Actions - MIGRATION : Utilisation de IconButton */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => store.openArticleModal(article)}
                        className="flex-1 rounded-lg border border-blue-600 bg-white px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={async () => {
                          await toggleArticleMutation.mutateAsync(article.id);
                        }}
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        {article.actif ? "Désactiver" : "Activer"}
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
                        Supprimer
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <PaginationBar
              page={articlesQuery.data.pagination.page}
              totalPages={articlesQuery.data.pagination.totalPages}
              onPageChange={store.setArticlePage}
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
        title="Supprimer l'article"
        message={`Êtes-vous sûr de vouloir supprimer l'article "${deleteConfirm.articleNom}" ? Cette action est irréversible.`}
        variant="danger"
        isLoading={deleteArticleMutation.isPending}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ONGLET : BOUTIQUE (Member)
// ═══════════════════════════════════════════════════════════════════════════

function BoutiqueTab() {
  const store = useStoreUI();
  const categoriesQuery = useCategories();
  const sizesQuery = useSizes();
  const articlesQuery = useArticles({
    search: store.articleSearch || undefined,
    categorie_id: store.articleCategoryFilter ?? undefined,
    actif: true,
    page: store.articlePage,
    limit: 12,
  });

  const createOrderMutation = useCreateOrder();
  const { data: stocksData } = useStocks();

  const cartCount = store.cartItems.reduce(
    (total, item) => total + item.quantite,
    0,
  );

  return (
    <div>
      {/* En-tête de l'onglet */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">
            Articles disponibles
          </h2>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {articlesQuery.data?.pagination.total ?? 0} article
            {(articlesQuery.data?.pagination.total ?? 0) > 1 ? "s" : ""}
          </span>
          {cartCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Panier ({cartCount})
            </span>
          )}
        </div>
        {cartCount > 0 && (
          <button
            onClick={() => store.openCartModal()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors"
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Voir le panier
          </button>
        )}
      </div>

      {/* Filtres - MIGRATION : SelectField */}
      <div className="p-4 border-b border-gray-50">
        <div className="grid gap-3 md:grid-cols-2">
          {/* Barre de recherche */}
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
              placeholder="Rechercher un article…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Filtre catégorie - MIGRATION : SelectField */}
          <SelectField
            id="boutique-category-filter"
            label=""
            placeholder="Toutes les catégories"
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

        {articlesQuery.isLoading && <LoadingSpinner text="Chargement..." />}

        {!articlesQuery.isLoading &&
          !articlesQuery.isError &&
          !articlesQuery.data?.items.length && (
            <EmptyState
              title="Aucun article disponible"
              description="Les articles seront bientôt disponibles à l'achat."
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
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt={article.nom}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}

                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {article.nom}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {article.categorie_nom ?? "Sans catégorie"}
                    </p>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                    {article.description || "Aucune description disponible."}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(article.prix)}
                    </span>
                    <button
                      onClick={() => store.openQuickOrderModal(article as any)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Commander
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <PaginationBar
              page={articlesQuery.data.pagination.page}
              totalPages={articlesQuery.data.pagination.totalPages}
              onPageChange={store.setArticlePage}
            />
          </div>
        ) : null}
      </div>

      {/* Modals */}
      {store.quickOrderArticle && (
        <QuickOrderModal
          isOpen={store.quickOrderModalOpen}
          onClose={store.closeQuickOrderModal}
          article={store.quickOrderArticle}
          sizes={sizesQuery.data ?? []}
          stocks={
            stocksData?.filter(
              (s) => s.article_id === store.quickOrderArticle?.id,
            ) ?? []
          }
          onSubmit={async (data) => {
            const article = store.quickOrderArticle;
            if (!article) return;

            for (const item of data.items) {
              const stock = stocksData?.find(
                (s) =>
                  s.article_id === item.article_id &&
                  s.taille_id === item.taille_id,
              );
              if (stock) {
                const cartItem = {
                  article_id: item.article_id,
                  article_nom: article.nom,
                  taille_id: item.taille_id,
                  taille_nom: stock.taille_nom || "",
                  prix: item.prix,
                  quantite: item.quantite,
                  image_url: article.image_url ?? null,
                };
                store.addToCart(cartItem as any);
              }
            }
            store.closeQuickOrderModal();
          }}
        />
      )}

      <CartModal
        isOpen={store.cartModalOpen}
        onClose={store.closeCartModal}
        cartItems={store.cartItems}
        onUpdateQuantity={(articleId, tailleId, newQuantity) => {
          const index = store.cartItems.findIndex(
            (item) =>
              item.article_id === articleId && item.taille_id === tailleId,
          );
          if (index !== -1) {
            const item = store.cartItems[index];
            store.removeFromCart(articleId, tailleId);
            if (newQuantity > 0) {
              store.addToCart({ ...item, quantite: newQuantity } as any);
            }
          }
        }}
        onRemoveItem={store.removeFromCart}
        onClearCart={store.clearCart}
        onCheckout={async () => {
          const items = store.cartItems.map((item) => ({
            article_id: item.article_id,
            taille_id: item.taille_id,
            quantite: item.quantite,
            prix: item.prix,
          }));
          await createOrderMutation.mutateAsync({ items });
          store.clearCart();
          store.closeCartModal();
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ONGLET : COMMANDES (Admin/Prof)
// ═══════════════════════════════════════════════════════════════════════════

function OrdersTab() {
  const store = useStoreUI();
  const ordersQuery = useOrders({
    page: store.orderPage,
    limit: 10,
    statut: store.orderStatusFilter || undefined,
  });

  const updateOrderStatusMutation = useUpdateOrderStatus();

  const enAttenteCount =
    ordersQuery.data?.items.filter((order) => order.statut === "en_attente")
      .length ?? 0;
  const annuleeCount =
    ordersQuery.data?.items.filter((order) => order.statut === "annulee")
      .length ?? 0;

  return (
    <div>
      {/* En-tête de l'onglet */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">
            Suivi des commandes
          </h2>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {ordersQuery.data?.pagination.total ?? 0} commande
            {(ordersQuery.data?.pagination.total ?? 0) > 1 ? "s" : ""}
          </span>
          {enAttenteCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
              {enAttenteCount} en attente
            </span>
          )}
          {annuleeCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
              {annuleeCount} annulée{annuleeCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Filtres - MIGRATION : SelectField */}
      <div className="p-4 border-b border-gray-50">
        <SelectField
          id="order-status-filter"
          label=""
          placeholder="Tous les statuts"
          options={[
            { value: "en_attente", label: "En attente" },
            { value: "payee", label: "Payée" },
            { value: "expediee", label: "Expédiée" },
            { value: "livree", label: "Livrée" },
            { value: "annulee", label: "Annulée" },
          ]}
          value={store.orderStatusFilter}
          onChange={(value) => store.setOrderStatusFilter(String(value))}
          className="[&>label]:hidden max-w-xs"
        />
      </div>

      {/* Contenu - MIGRATION : LoadingSpinner, ErrorBanner, EmptyState */}
      <div className="p-4">
        {ordersQuery.isError && (
          <AlertBanner
            variant="error"
            message={getErrorMessage(ordersQuery.error)}
          />
        )}

        {ordersQuery.isLoading && <LoadingSpinner text="Chargement..." />}

        {!ordersQuery.isLoading &&
          !ordersQuery.isError &&
          !ordersQuery.data?.items.length && (
            <EmptyState
              title="Aucune commande trouvée"
              description="Les commandes passées apparaîtront ici."
              variant="dashed"
            />
          )}

        {ordersQuery.data?.items.length ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Commande
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Membre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ordersQuery.data.items.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          #{order.numero_commande || order.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.user_first_name || order.user_last_name
                            ? `${order.user_first_name ?? ""} ${order.user_last_name ?? ""}`.trim()
                            : (order.user_email ?? "Utilisateur inconnu")}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDateTime(order.date_commande)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <OrderStatusBadge statut={order.statut} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                store.openOrderDetailModal(order as any)
                              }
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                            >
                              Détails
                            </button>
                            {order.statut === "en_attente" && (
                              <>
                                <button
                                  onClick={async () => {
                                    await updateOrderStatusMutation.mutateAsync(
                                      {
                                        id: order.id,
                                        statut: "payee",
                                      },
                                    );
                                  }}
                                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                                >
                                  Confirmer
                                </button>
                                <button
                                  onClick={async () => {
                                    await updateOrderStatusMutation.mutateAsync(
                                      {
                                        id: order.id,
                                        statut: "annulee",
                                      },
                                    );
                                  }}
                                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
                                >
                                  Annuler
                                </button>
                              </>
                            )}
                            {order.statut === "payee" && (
                              <button
                                onClick={async () => {
                                  await updateOrderStatusMutation.mutateAsync({
                                    id: order.id,
                                    statut: "expediee",
                                  });
                                }}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                              >
                                Expédier
                              </button>
                            )}
                            {order.statut === "expediee" && (
                              <button
                                onClick={async () => {
                                  await updateOrderStatusMutation.mutateAsync({
                                    id: order.id,
                                    statut: "livree",
                                  });
                                }}
                                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                              >
                                Marquer livrée
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <PaginationBar
              page={ordersQuery.data.pagination.page}
              totalPages={ordersQuery.data.pagination.totalPages}
              onPageChange={store.setOrderPage}
            />
          </div>
        ) : null}
      </div>

      {/* Modal détails commande */}
      {store.selectedOrder && (
        <OrderDetailModal
          isOpen={store.orderDetailModalOpen}
          onClose={store.closeOrderDetailModal}
          order={store.selectedOrder}
          canManage={true}
          onUpdateStatus={async (id, statut) => {
            await updateOrderStatusMutation.mutateAsync({ id, statut });
            store.closeOrderDetailModal();
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ONGLET : MES COMMANDES (Member)
// ═══════════════════════════════════════════════════════════════════════════

function MyOrdersTab() {
  const store = useStoreUI();
  const ordersQuery = useMyOrders();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const enAttenteCount =
    ordersQuery.data?.filter((order) => order.statut === "en_attente").length ??
    0;
  const livreeCount =
    ordersQuery.data?.filter((order) => order.statut === "livree").length ?? 0;

  return (
    <div>
      {/* En-tête de l'onglet */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">
            Mes commandes
          </h2>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {ordersQuery.data?.length ?? 0} commande
            {(ordersQuery.data?.length ?? 0) > 1 ? "s" : ""}
          </span>
          {enAttenteCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
              {enAttenteCount} en attente
            </span>
          )}
          {livreeCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
              {livreeCount} livrée{livreeCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Contenu - MIGRATION : LoadingSpinner, ErrorBanner, EmptyState */}
      <div className="p-4">
        {ordersQuery.isError && (
          <AlertBanner
            variant="error"
            message={getErrorMessage(ordersQuery.error)}
          />
        )}

        {ordersQuery.isLoading && <LoadingSpinner text="Chargement..." />}

        {!ordersQuery.isLoading &&
          !ordersQuery.isError &&
          !ordersQuery.data?.length && (
            <EmptyState
              title="Aucune commande"
              description="Vous n'avez pas encore passé de commande."
              variant="dashed"
            />
          )}

        {ordersQuery.data && ordersQuery.data.length > 0 && (
          <div className="space-y-4">
            {ordersQuery.data.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Commande #{order.numero_commande || order.id}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatDateTime(order.date_commande)}
                    </p>
                  </div>
                  <OrderStatusBadge statut={order.statut} />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => store.openOrderDetailModal(order as any)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Voir les détails
                    </button>
                    {order.statut === "en_attente" && (
                      <button
                        onClick={async () => {
                          if (
                            window.confirm(
                              "Êtes-vous sûr de vouloir annuler cette commande ?",
                            )
                          ) {
                            await updateOrderStatusMutation.mutateAsync({
                              id: order.id,
                              statut: "annulee",
                            });
                          }
                        }}
                        className="rounded-lg border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal détails commande */}
      {store.selectedOrder && (
        <OrderDetailModal
          isOpen={store.orderDetailModalOpen}
          onClose={store.closeOrderDetailModal}
          order={store.selectedOrder}
          canManage={false}
          onUpdateStatus={async (id, statut) => {
            await updateOrderStatusMutation.mutateAsync({ id, statut });
            store.closeOrderDetailModal();
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ONGLET : STOCKS (Admin/Prof)
// ═══════════════════════════════════════════════════════════════════════════

function StocksTab() {
  const store = useStoreUI();
  const stocksQuery = useStocks();
  const lowStocksQuery = useLowStocks();
  const adjustStockMutation = useAdjustStock();

  const ruptureCount =
    stocksQuery.data?.filter((stock) => stock.quantite <= 0).length ?? 0;
  const articlesCount = new Set(
    (stocksQuery.data ?? []).map((stock) => stock.article_id),
  ).size;

  return (
    <div>
      {/* En-tête de l'onglet */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-50">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">
            Gestion des stocks
          </h2>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {stocksQuery.data?.length ?? 0} ligne
            {(stocksQuery.data?.length ?? 0) > 1 ? "s" : ""}
          </span>
          {lowStocksQuery.data && lowStocksQuery.data.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
              {lowStocksQuery.data.length} stock
              {lowStocksQuery.data.length > 1 ? "s" : ""} bas
            </span>
          )}
          {ruptureCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
              {ruptureCount} rupture{ruptureCount > 1 ? "s" : ""}
            </span>
          )}
          {articlesCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
              {articlesCount} article{articlesCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Alertes stock faible */}
      {lowStocksQuery.data && lowStocksQuery.data.length > 0 && (
        <div className="p-4 border-b border-gray-50">
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <h3 className="text-sm font-semibold text-orange-900">
              ⚠️ Alertes stock faible
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {lowStocksQuery.data.map((stock) => (
                <span
                  key={stock.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm text-orange-800 ring-1 ring-orange-200"
                >
                  <span className="font-medium">{stock.article_nom}</span>
                  <span className="text-orange-600">/</span>
                  <span>{stock.taille_nom}</span>
                  <span className="text-orange-600">:</span>
                  <span className="font-semibold">{stock.quantite}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contenu - MIGRATION : LoadingSpinner, ErrorBanner, EmptyState */}
      <div className="p-4">
        {lowStocksQuery.isError && (
          <AlertBanner
            variant="error"
            message={getErrorMessage(lowStocksQuery.error)}
          />
        )}
        {stocksQuery.isError && (
          <AlertBanner
            variant="error"
            message={getErrorMessage(stocksQuery.error)}
          />
        )}

        {(stocksQuery.isLoading || lowStocksQuery.isLoading) && (
          <LoadingSpinner text="Chargement..." />
        )}

        {!stocksQuery.isLoading &&
          !stocksQuery.isError &&
          !stocksQuery.data?.length && (
            <EmptyState
              title="Aucun stock configuré"
              description="Les niveaux de stock apparaîtront ici dès qu'ils seront disponibles."
              variant="dashed"
            />
          )}

        {stocksQuery.data && stocksQuery.data.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Article
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Taille
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Quantité
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Minimum
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stocksQuery.data.map((stock) => (
                    <tr
                      key={stock.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {stock.article_nom ?? `Article #${stock.article_id}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {stock.taille_nom ?? `Taille #${stock.taille_id}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {stock.quantite}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {stock.quantite_minimum}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <StockBadge
                          quantite={stock.quantite}
                          quantite_minimum={stock.quantite_minimum}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <button
                          onClick={() => store.openStockAdjustModal(stock)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                        >
                          Ajuster
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'ajustement stock */}
      {store.adjustingStock && (
        <StockAdjustModal
          isOpen={store.stockAdjustModalOpen}
          onClose={store.closeStockAdjustModal}
          stock={store.adjustingStock}
          onSubmit={async (data) => {
            await adjustStockMutation.mutateAsync({
              id: store.adjustingStock!.id,
              data,
            });
            store.closeStockAdjustModal();
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ONGLET : CONFIGURATION (Admin/Prof)
// ═══════════════════════════════════════════════════════════════════════════

function ConfigurationTab() {
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
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
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

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL : STOREPAGE
// ═══════════════════════════════════════════════════════════════════════════

export function StorePage() {
  const { user } = useAuth();
  const { activeTab, setActiveTab } = useStoreUI();
  const userRole = (user?.role_app ?? UserRole.MEMBER) as UserRole;
  const canManageStore =
    userRole === UserRole.ADMIN || userRole === UserRole.PROFESSOR;

  useEffect(() => {
    if (canManageStore) {
      if (activeTab === "boutique" || activeTab === "mes_commandes") {
        setActiveTab("catalogue");
      }
      return;
    }

    if (
      activeTab === "catalogue" ||
      activeTab === "commandes" ||
      activeTab === "stocks" ||
      activeTab === "configuration"
    ) {
      setActiveTab("boutique");
    }
  }, [activeTab, canManageStore, setActiveTab]);

  // MIGRATION : TabGroup - Définition des onglets
  const tabs = canManageStore
    ? [
        { id: "catalogue", label: "Catalogue" },
        { id: "commandes", label: "Commandes" },
        { id: "stocks", label: "Stocks" },
        { id: "configuration", label: "Configuration" },
      ]
    : [
        { id: "boutique", label: "Boutique" },
        { id: "mes_commandes", label: "Mes commandes" },
      ];

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <PageHeader
        title="Boutique"
        description={
          canManageStore
            ? "Gestion de la boutique du club"
            : "Parcourez les articles disponibles et suivez vos commandes"
        }
      />

      {/* ── Conteneur onglets ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* MIGRATION : TabGroup pour la navigation */}
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
          scrollable
        />

        {/* ── Contenu des onglets ── */}
        {activeTab === "catalogue" && <CatalogueTab />}
        {activeTab === "commandes" && <OrdersTab />}
        {activeTab === "stocks" && <StocksTab />}
        {activeTab === "configuration" && <ConfigurationTab />}
        {activeTab === "boutique" && <BoutiqueTab />}
        {activeTab === "mes_commandes" && <MyOrdersTab />}
      </div>
    </div>
  );
}
