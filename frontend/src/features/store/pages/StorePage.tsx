/**
 * StorePage
 * Page principale du module boutique.
 */

import { useEffect } from "react";
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

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
      <svg
        className="h-5 w-5 animate-spin text-blue-600"
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
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
        />
      </svg>
      <span className="text-sm">Chargement…</span>
    </div>
  );
}

function ErrorBanner({ error }: { error: unknown }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {getErrorMessage(error)}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "border-red-200 bg-red-50"
      : tone === "warning"
        ? "border-orange-200 bg-orange-50"
        : "border-gray-200 bg-white";

  return (
    <div className={classNames("rounded-xl border p-4", toneClass)}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50",
      )}
    >
      {label}
    </button>
  );
}

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
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 ring-1 ring-gray-200 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Précédent
      </button>
      <span className="text-sm text-gray-500">
        Page <span className="font-medium text-gray-700">{page}</span> /{" "}
        <span className="font-medium text-gray-700">{totalPages}</span>
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 ring-1 ring-gray-200 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Suivant
      </button>
    </div>
  );
}

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Catalogue</h2>
        <button
          onClick={() => store.openArticleModal()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Nouvel article
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Articles"
          value={articlesQuery.data?.pagination.total ?? 0}
        />
        <StatCard
          label="Catégories"
          value={categoriesQuery.data?.length ?? 0}
        />
        <StatCard
          label="Page"
          value={articlesQuery.data?.pagination.page ?? store.articlePage}
        />
        <StatCard
          label="Résultats / page"
          value={articlesQuery.data?.pagination.limit ?? 12}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={store.articleSearch}
            onChange={(event) => store.setArticleSearch(event.target.value)}
            placeholder="Rechercher un article…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={store.articleCategoryFilter ?? ""}
            onChange={(event) =>
              store.setArticleCategoryFilter(
                event.target.value ? Number(event.target.value) : null,
              )
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Toutes les catégories</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.nom}
              </option>
            ))}
          </select>

          <select
            value={store.articleActifFilter}
            onChange={(event) =>
              store.setArticleActifFilter(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>
        </div>
      </div>

      {categoriesQuery.isError ? (
        <ErrorBanner error={categoriesQuery.error} />
      ) : null}
      {articlesQuery.isError ? (
        <ErrorBanner error={articlesQuery.error} />
      ) : null}

      {articlesQuery.isLoading ? <Spinner /> : null}

      {!articlesQuery.isLoading &&
      !articlesQuery.isError &&
      !articlesQuery.data?.items.length ? (
        <EmptyState
          title="Aucun article trouvé"
          description="Ajustez les filtres ou ajoutez des articles dans le catalogue."
        />
      ) : null}

      {articlesQuery.data?.items.length ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {articlesQuery.data.items.map((article) => (
              <article
                key={article.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
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
                      onClick={async () => {
                        if (
                          window.confirm(
                            `Supprimer l'article "${article.nom}" ?`,
                          )
                        ) {
                          await deleteArticleMutation.mutateAsync(article.id);
                        }
                      }}
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
        </>
      ) : null}

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
    </div>
  );
}

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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Articles disponibles"
          value={articlesQuery.data?.pagination.total ?? 0}
        />
        <StatCard
          label="Catégories"
          value={categoriesQuery.data?.length ?? 0}
        />
        <StatCard
          label="Panier"
          value={store.cartItems.reduce(
            (total, item) => total + item.quantite,
            0,
          )}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={store.articleSearch}
            onChange={(event) => store.setArticleSearch(event.target.value)}
            placeholder="Rechercher un article…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={store.articleCategoryFilter ?? ""}
            onChange={(event) =>
              store.setArticleCategoryFilter(
                event.target.value ? Number(event.target.value) : null,
              )
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Toutes les catégories</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {categoriesQuery.isError ? (
        <ErrorBanner error={categoriesQuery.error} />
      ) : null}
      {articlesQuery.isError ? (
        <ErrorBanner error={articlesQuery.error} />
      ) : null}

      {articlesQuery.isLoading ? <Spinner /> : null}

      {!articlesQuery.isLoading &&
      !articlesQuery.isError &&
      !articlesQuery.data?.items.length ? (
        <EmptyState
          title="Aucun article disponible"
          description="La boutique ne contient pas encore d'articles actifs."
        />
      ) : null}

      {articlesQuery.data?.items.length ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {articlesQuery.data.items.map((article) => (
              <article
                key={article.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
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
                  <span className="text-lg font-semibold text-blue-700">
                    {formatCurrency(article.prix)}
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 min-h-[3.75rem] text-sm text-gray-600">
                  {article.description || "Aucune description disponible."}
                </p>

                <button
                  onClick={() => store.openQuickOrderModal(article as any)}
                  className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Commander
                </button>
              </article>
            ))}
          </div>

          <PaginationBar
            page={articlesQuery.data.pagination.page}
            totalPages={articlesQuery.data.pagination.totalPages}
            onPageChange={store.setArticlePage}
          />
        </>
      ) : null}

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

      {store.cartItems.length > 0 && (
        <button
          onClick={store.openCartModal}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-white shadow-lg transition hover:bg-blue-700"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Panier (
          {store.cartItems.reduce((total, item) => total + item.quantite, 0)})
        </button>
      )}
    </div>
  );
}

function OrdersTab() {
  const store = useStoreUI();
  const ordersQuery = useOrders({
    page: store.orderPage,
    limit: 10,
    statut: store.orderStatusFilter || undefined,
  });

  const updateOrderStatusMutation = useUpdateOrderStatus();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Commandes"
          value={ordersQuery.data?.pagination.total ?? 0}
        />
        <StatCard
          label="En attente"
          value={
            ordersQuery.data?.items.filter(
              (order) => order.statut === "en_attente",
            ).length ?? 0
          }
          tone="warning"
        />
        <StatCard
          label="Annulées"
          value={
            ordersQuery.data?.items.filter(
              (order) => order.statut === "annulee",
            ).length ?? 0
          }
          tone="danger"
        />
        <StatCard
          label="Page"
          value={ordersQuery.data?.pagination.page ?? store.orderPage}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Suivi des commandes
          </h2>

          <select
            value={store.orderStatusFilter}
            onChange={(event) => store.setOrderStatusFilter(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:w-56"
          >
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="payee">Payée</option>
            <option value="expediee">Expédiée</option>
            <option value="livree">Livrée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
      </div>

      {ordersQuery.isError ? <ErrorBanner error={ordersQuery.error} /> : null}
      {ordersQuery.isLoading ? <Spinner /> : null}

      {!ordersQuery.isLoading &&
      !ordersQuery.isError &&
      !ordersQuery.data?.items.length ? (
        <EmptyState
          title="Aucune commande"
          description="Aucune commande ne correspond au filtre sélectionné."
        />
      ) : null}

      {ordersQuery.data?.items.length ? (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      N°
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ordersQuery.data.items.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => store.openOrderDetailModal(order as any)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {order.numero_commande}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.user_first_name || order.user_last_name
                          ? `${order.user_first_name ?? ""} ${order.user_last_name ?? ""}`.trim()
                          : (order.user_email ?? "Utilisateur inconnu")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <OrderStatusBadge statut={order.statut} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDateTime(order.date_commande)}
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
        </>
      ) : null}

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

function MyOrdersTab() {
  const store = useStoreUI();
  const ordersQuery = useMyOrders();

  const updateOrderStatusMutation = useUpdateOrderStatus();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Mes commandes" value={ordersQuery.data?.length ?? 0} />
        <StatCard
          label="En attente"
          value={
            ordersQuery.data?.filter((order) => order.statut === "en_attente")
              .length ?? 0
          }
          tone="warning"
        />
        <StatCard
          label="Livrées"
          value={
            ordersQuery.data?.filter((order) => order.statut === "livree")
              .length ?? 0
          }
        />
      </div>

      {ordersQuery.isError ? <ErrorBanner error={ordersQuery.error} /> : null}
      {ordersQuery.isLoading ? <Spinner /> : null}

      {!ordersQuery.isLoading &&
      !ordersQuery.isError &&
      !ordersQuery.data?.length ? (
        <EmptyState
          title="Aucune commande passée"
          description="Vos commandes boutique apparaîtront ici."
        />
      ) : null}

      {ordersQuery.data?.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {ordersQuery.data.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Commande</p>
                  <h3 className="text-base font-semibold text-gray-900">
                    {order.numero_commande}
                  </h3>
                </div>
                <OrderStatusBadge statut={order.statut} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Total
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Date
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {formatDateTime(order.date_commande)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => store.openOrderDetailModal(order as any)}
                className="mt-4 w-full rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
              >
                Voir détails
              </button>
            </article>
          ))}
        </div>
      ) : null}

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

function StocksTab() {
  const store = useStoreUI();
  const stocksQuery = useStocks();
  const lowStocksQuery = useLowStocks();

  const adjustStockMutation = useAdjustStock();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Lignes de stock"
          value={stocksQuery.data?.length ?? 0}
        />
        <StatCard
          label="Stocks bas"
          value={lowStocksQuery.data?.length ?? 0}
          tone="warning"
        />
        <StatCard
          label="Ruptures"
          value={
            stocksQuery.data?.filter((stock) => stock.quantite <= 0).length ?? 0
          }
          tone="danger"
        />
        <StatCard
          label="Articles suivis"
          value={
            new Set((stocksQuery.data ?? []).map((stock) => stock.article_id))
              .size
          }
        />
      </div>

      {lowStocksQuery.isError ? (
        <ErrorBanner error={lowStocksQuery.error} />
      ) : null}
      {stocksQuery.isError ? <ErrorBanner error={stocksQuery.error} /> : null}

      {stocksQuery.isLoading || lowStocksQuery.isLoading ? <Spinner /> : null}

      {lowStocksQuery.data?.length ? (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <h2 className="text-sm font-semibold text-orange-900">
            Alertes stock faible
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {lowStocksQuery.data.map((stock) => (
              <span
                key={stock.id}
                className="rounded-full bg-white px-3 py-1 text-sm text-orange-800 ring-1 ring-orange-200"
              >
                {stock.article_nom} / {stock.taille_nom} : {stock.quantite}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {!stocksQuery.isLoading &&
      !stocksQuery.isError &&
      !stocksQuery.data?.length ? (
        <EmptyState
          title="Aucun stock configuré"
          description="Les niveaux de stock apparaîtront ici dès qu'ils seront disponibles."
        />
      ) : null}

      {stocksQuery.data?.length ? (
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
                  <tr key={stock.id} className="hover:bg-gray-50">
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
      ) : null}

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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Catégories"
          value={categoriesQuery.data?.length ?? 0}
        />
        <StatCard label="Tailles" value={sizesQuery.data?.length ?? 0} />
      </div>

      {categoriesQuery.isError ? (
        <ErrorBanner error={categoriesQuery.error} />
      ) : null}
      {sizesQuery.isError ? <ErrorBanner error={sizesQuery.error} /> : null}

      {categoriesQuery.isLoading || sizesQuery.isLoading ? <Spinner /> : null}

      {!categoriesQuery.isLoading &&
      !sizesQuery.isLoading &&
      !categoriesQuery.isError &&
      !sizesQuery.isError ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Catégories
              </h2>
              <button
                onClick={() => store.openCategoryModal()}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Nouvelle catégorie
              </button>
            </div>
            {!categoriesQuery.data?.length ? (
              <p className="mt-4 text-sm text-gray-500">
                Aucune catégorie configurée.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {categoriesQuery.data.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {category.nom}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {category.description || "Aucune description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        Ordre {category.ordre}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => store.openCategoryModal(category)}
                          className="rounded px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              window.confirm(
                                `Supprimer la catégorie "${category.nom}" ?`,
                              )
                            ) {
                              await deleteCategoryMutation.mutateAsync(
                                category.id,
                              );
                            }
                          }}
                          className="rounded px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Tailles</h2>
              <button
                onClick={() => store.openSizeModal()}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Nouvelle taille
              </button>
            </div>
            {!sizesQuery.data?.length ? (
              <p className="mt-4 text-sm text-gray-500">
                Aucune taille configurée.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {sizesQuery.data.map((size) => (
                  <div
                    key={size.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                  >
                    <p className="flex-1 text-sm font-medium text-gray-900">
                      {size.nom}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        Ordre {size.ordre}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => store.openSizeModal(size)}
                          className="rounded px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              window.confirm(
                                `Supprimer la taille "${size.nom}" ?`,
                              )
                            ) {
                              await deleteSizeMutation.mutateAsync(size.id);
                            }
                          }}
                          className="rounded px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

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
        onSubmit={async (data) => {
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
    </div>
  );
}

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

  const tabs = canManageStore
    ? [
        { key: "catalogue" as const, label: "Catalogue" },
        { key: "commandes" as const, label: "Commandes" },
        { key: "stocks" as const, label: "Stocks" },
        { key: "configuration" as const, label: "Configuration" },
      ]
    : [
        { key: "boutique" as const, label: "Boutique" },
        { key: "mes_commandes" as const, label: "Mes commandes" },
      ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white shadow-sm">
        <p className="text-sm font-medium text-blue-100">Module store</p>
        <h1 className="mt-2 text-3xl font-bold">
          {canManageStore ? "Gestion de la boutique" : "Boutique du club"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-blue-50">
          {canManageStore
            ? "Consultez le catalogue, les commandes, les stocks et la configuration de la boutique depuis un seul écran."
            : "Parcourez les articles disponibles et suivez l'état de vos commandes."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            active={activeTab === tab.key}
            label={tab.label}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
      </div>

      {activeTab === "catalogue" ? <CatalogueTab /> : null}
      {activeTab === "commandes" ? <OrdersTab /> : null}
      {activeTab === "stocks" ? <StocksTab /> : null}
      {activeTab === "configuration" ? <ConfigurationTab /> : null}
      {activeTab === "boutique" ? <BoutiqueTab /> : null}
      {activeTab === "mes_commandes" ? <MyOrdersTab /> : null}
    </div>
  );
}
