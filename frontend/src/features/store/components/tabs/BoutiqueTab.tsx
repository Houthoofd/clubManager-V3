/**
 * BoutiqueTab
 * Onglet permettant aux membres de commander des articles.
 *
 * Fonctionnalités :
 * - Affichage des articles disponibles à l'achat
 * - Recherche et filtrage par catégorie
 * - Ajout au panier
 * - Validation de commande via panier
 *
 * MIGRATION : Utilise les composants réutilisables de la bibliothèque shared
 * - SelectField pour les filtres
 * - PaginationBar pour la navigation
 * - Badge pour les compteurs
 * - AlertBanner pour les erreurs
 * - LoadingSpinner et EmptyState pour le feedback
 */

import { useTranslation } from "react-i18next";
import { Badge } from "../../../../shared/components/Badge/Badge";
import { AlertBanner } from "../../../../shared/components/Feedback/AlertBanner";
import { LoadingSpinner } from "../../../../shared/components/Layout/LoadingSpinner";
import { EmptyState } from "../../../../shared/components/Layout/EmptyState";
import { PaginationBar } from "../../../../shared/components/Navigation/PaginationBar";
import { SelectField } from "../../../../shared/components/Forms/SelectField";
import {
  useArticles,
  useCategories,
  useSizes,
  useStocks,
  useCreateOrder,
} from "../../hooks/useStore";
import { useStoreUI } from "../../stores/storeStore";
import { QuickOrderModal, CartModal } from "../";
import { getErrorMessage, formatCurrency } from "../../../../shared/utils";

export function BoutiqueTab() {
  const { t } = useTranslation("store");
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
            {t("boutique.title")}
          </h2>
          <Badge variant="info">
            {articlesQuery.data?.pagination.total ?? 0}{" "}
            {(articlesQuery.data?.pagination.total ?? 0) > 1
              ? t("boutique.count.articles")
              : t("boutique.count.article")}
          </Badge>
          {cartCount > 0 && (
            <Badge
              variant="success"
              icon={
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
              }
            >
              {cartCount}{" "}
              {cartCount > 1
                ? t("boutique.count.inCartPlural")
                : t("boutique.count.inCart")}
            </Badge>
          )}
        </div>
        {cartCount > 0 && (
          <button
            onClick={() => store.openCartModal()}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors"
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
            {t("boutique.viewCart")}
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
              placeholder={t("boutique.filters.search")}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Filtre catégorie - MIGRATION : SelectField */}
          <SelectField
            id="boutique-category-filter"
            label=""
            placeholder={t("boutique.filters.allCategories")}
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

        {articlesQuery.isLoading && (
          <LoadingSpinner text={t("common.loading")} />
        )}

        {!articlesQuery.isLoading &&
          !articlesQuery.isError &&
          !articlesQuery.data?.items.length && (
            <EmptyState
              title={t("boutique.empty.title")}
              description={t("boutique.empty.description")}
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
                      {article.categorie_nom ?? t("boutique.card.noCategory")}
                    </p>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                    {article.description || t("boutique.card.noDescription")}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(article.prix)}
                    </span>
                    <button
                      onClick={() => store.openQuickOrderModal(article as any)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      {t("boutique.card.order")}
                    </button>
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
              pageSize={articlesQuery.data.pagination.limit || 12}
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
