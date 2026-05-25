# Guide d'Internationalisation - StoreStatsPage.tsx

## État : ✅ Traductions JSON complétées | ⏳ Composant à modifier

---

## Fichier : `frontend/src/features/statistics/pages/StoreStatsPage.tsx`

### 1. Import déjà présent ✅
```typescript
import { useTranslation } from "react-i18next";
```

### 2. Hook déjà ajouté ✅
```typescript
const { t } = useTranslation("statistics");
```

---

## Modifications à effectuer

### 📍 Ligne ~274 : Fonction `getStockStatusLabel`

**AVANT :**
```typescript
const getStockStatusLabel = (status: string): string => {
  switch (status) {
    case "critique":
      return "Stock critique";
    case "bas":
      return "Stock bas";
    case "rupture":
      return "Rupture de stock";
    default:
      return "Normal";
  }
};
```

**APRÈS :**
```typescript
const getStockStatusLabel = (status: string): string => {
  switch (status) {
    case "critique":
      return t("storeStats.stockAlerts.statusCritical");
    case "bas":
      return t("storeStats.stockAlerts.statusLow");
    case "rupture":
      return t("storeStats.stockAlerts.statusOutOfStock");
    default:
      return t("storeStats.stockAlerts.statusNormal");
  }
};
```

---

### 📍 Ligne ~303 : Breadcrumb - Dashboard

**AVANT :**
```typescript
<button
  onClick={handleBackToDashboard}
  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
>
  Tableau de bord
</button>
```

**APRÈS :**
```typescript
<button
  onClick={handleBackToDashboard}
  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
>
  {t("storeStats.breadcrumb.dashboard")}
</button>
```

---

### 📍 Ligne ~323 : Breadcrumb - Statistiques Magasin

**AVANT :**
```typescript
<span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
  Statistiques Magasin
</span>
```

**APRÈS :**
```typescript
<span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
  {t("storeStats.breadcrumb.storeStats")}
</span>
```

---

### 📍 Ligne ~341 : Loading - Titre

**AVANT :**
```typescript
<h1 className="text-2xl font-bold text-gray-900 mb-4">
  Statistiques Magasin
</h1>
```

**APRÈS :**
```typescript
<h1 className="text-2xl font-bold text-gray-900 mb-4">
  {t("storeStats.title")}
</h1>
```

---

### 📍 Ligne ~344 : Loading - Text

**AVANT :**
```typescript
<LoadingSpinner size="lg" text="Chargement des statistiques..." />
```

**APRÈS :**
```typescript
<LoadingSpinner size="lg" text={t("storeStats.loading")} />
```

---

### 📍 Ligne ~358 : Error - Titre

**AVANT :**
```typescript
<h1 className="text-2xl font-bold text-gray-900 mb-4">
  Statistiques Magasin
</h1>
```

**APRÈS :**
```typescript
<h1 className="text-2xl font-bold text-gray-900 mb-4">
  {t("storeStats.title")}
</h1>
```

---

### 📍 Ligne ~362 : Error Banner

**AVANT :**
```typescript
<ErrorBanner
  variant="error"
  title="Erreur de chargement"
  message={error.message}
  dismissible
  onDismiss={handleRefresh}
/>
```

**APRÈS :**
```typescript
<ErrorBanner
  variant="error"
  title={t("storeStats.errorTitle")}
  message={error.message}
  dismissible
  onDismiss={handleRefresh}
/>
```

---

### 📍 Ligne ~368 : Error - Bouton Réessayer

**AVANT :**
```typescript
<Button variant="primary" onClick={handleRefresh}>
  Réessayer
</Button>
```

**APRÈS :**
```typescript
<Button variant="primary" onClick={handleRefresh}>
  {t("storeStats.retry")}
</Button>
```

---

### 📍 Ligne ~382 : Empty State - Titre

**AVANT :**
```typescript
<h1 className="text-2xl font-bold text-gray-900 mb-4">
  Statistiques Magasin
</h1>
```

**APRÈS :**
```typescript
<h1 className="text-2xl font-bold text-gray-900 mb-4">
  {t("storeStats.title")}
</h1>
```

---

### 📍 Ligne ~386 : Empty State

**AVANT :**
```typescript
<EmptyState
  icon={<ShoppingCartIcon className="h-12 w-12 text-gray-400" />}
  title="Aucune donnée disponible"
  description="Les statistiques du magasin ne sont pas encore disponibles."
/>
```

**APRÈS :**
```typescript
<EmptyState
  icon={<ShoppingCartIcon className="h-12 w-12 text-gray-400" />}
  title={t("storeStats.noData")}
  description={t("storeStats.noDataDescription")}
/>
```

---

### 📍 Ligne ~407 : PageHeader

**AVANT :**
```typescript
<PageHeader
  title="Statistiques Magasin"
  description="Vue détaillée des ventes, commandes et analytics du magasin"
  actions={
    <Button
      variant="ghost"
      onClick={handleBackToDashboard}
      icon={<ArrowLeftIcon className="h-4 w-4" />}
      iconPosition="left"
    >
      Retour au tableau de bord
    </Button>
  }
/>
```

**APRÈS :**
```typescript
<PageHeader
  title={t("storeStats.title")}
  description={t("storeStats.description")}
  actions={
    <Button
      variant="ghost"
      onClick={handleBackToDashboard}
      icon={<ArrowLeftIcon className="h-4 w-4" />}
      iconPosition="left"
    >
      {t("storeStats.backToDashboard")}
    </Button>
  }
/>
```

---

### 📍 Ligne ~424 : Bouton Actualiser

**AVANT :**
```typescript
<Button
  variant="outline"
  onClick={handleRefresh}
  loading={isRefreshing}
>
  {isRefreshing ? "Actualisation..." : "Actualiser"}
</Button>
```

**APRÈS :**
```typescript
<Button
  variant="outline"
  onClick={handleRefresh}
  loading={isRefreshing}
>
  {isRefreshing ? t("storeStats.refreshing") : t("storeStats.refresh")}
</Button>
```

---

### 📍 Ligne ~433 : Alerte Stock Bas

**AVANT :**
```typescript
<AlertBanner
  variant="warning"
  message={`${low_stock.length} article(s) nécessitent votre attention - Des articles ont un stock bas ou sont en rupture de stock.`}
  icon={<WarningTriangleIcon className="h-5 w-5" />}
/>
```

**APRÈS :**
```typescript
<AlertBanner
  variant="warning"
  message={`${low_stock.length} ${t("storeStats.lowStockAlert")}`}
  icon={<WarningTriangleIcon className="h-5 w-5" />}
/>
```

---

### 📍 Ligne ~441 : StatCard - Total Commandes

**AVANT :**
```typescript
<StatCard
  title="Total Commandes"
  value={formatNumber(overview.total_commandes)}
  icon={ShoppingCartIcon}
  variant="info"
/>
```

**APRÈS :**
```typescript
<StatCard
  title={t("storeStats.cards.totalOrders")}
  value={formatNumber(overview.total_commandes)}
  icon={ShoppingCartIcon}
  variant="info"
/>
```

---

### 📍 Ligne ~448 : StatCard - Commandes Payées

**AVANT :**
```typescript
<StatCard
  title="Commandes Payées"
  value={formatNumber(overview.commandes_payees)}
  description={formatPercentage(...)}
  icon={DollarSignIcon}
  variant="success"
/>
```

**APRÈS :**
```typescript
<StatCard
  title={t("storeStats.cards.paidOrders")}
  value={formatNumber(overview.commandes_payees)}
  description={formatPercentage(...)}
  icon={DollarSignIcon}
  variant="success"
/>
```

---

### 📍 Ligne ~458 : StatCard - Revenus Total

**AVANT :**
```typescript
<StatCard
  title="Revenus Total"
  value={formatCurrency(overview.total_revenus)}
  icon={TrendUpIcon}
  variant="info"
/>
```

**APRÈS :**
```typescript
<StatCard
  title={t("storeStats.cards.totalRevenue")}
  value={formatCurrency(overview.total_revenus)}
  icon={TrendUpIcon}
  variant="info"
/>
```

---

### 📍 Ligne ~465 : StatCard - Panier Moyen

**AVANT :**
```typescript
<StatCard
  title="Panier Moyen"
  value={formatCurrency(overview.panier_moyen)}
  icon={ShoppingCartIcon}
  variant="default"
/>
```

**APRÈS :**
```typescript
<StatCard
  title={t("storeStats.cards.averageBasket")}
  value={formatCurrency(overview.panier_moyen)}
  icon={ShoppingCartIcon}
  variant="default"
/>
```

---

### 📍 Ligne ~472 : StatCard - En Attente

**AVANT :**
```typescript
<StatCard
  title="En Attente"
  value={formatNumber(overview.commandes_en_attente)}
  icon={BoxIcon}
  variant="warning"
/>
```

**APRÈS :**
```typescript
<StatCard
  title={t("storeStats.cards.pending")}
  value={formatNumber(overview.commandes_en_attente)}
  icon={BoxIcon}
  variant="warning"
/>
```

---

### 📍 Ligne ~479 : StatCard - Annulées

**AVANT :**
```typescript
<StatCard
  title="Annulées"
  value={formatNumber(overview.commandes_annulees)}
  icon={ExclamationTriangleIcon}
  variant="danger"
/>
```

**APRÈS :**
```typescript
<StatCard
  title={t("storeStats.cards.cancelled")}
  value={formatNumber(overview.commandes_annulees)}
  icon={ExclamationTriangleIcon}
  variant="danger"
/>
```

---

### 📍 Ligne ~486 : StatCard - Articles Vendus

**AVANT :**
```typescript
<StatCard
  title="Articles Vendus"
  value={formatNumber(overview.total_articles_vendus)}
  icon={BoxIcon}
  variant="success"
/>
```

**APRÈS :**
```typescript
<StatCard
  title={t("storeStats.cards.itemsSold")}
  value={formatNumber(overview.total_articles_vendus)}
  icon={BoxIcon}
  variant="success"
/>
```

---

### 📍 Ligne ~493 : StatCard - Taux de Conversion

**AVANT :**
```typescript
<StatCard
  title="Taux de Conversion"
  value={formatPercentage(overview.taux_conversion)}
  icon={TrendUpIcon}
  variant="info"
/>
```

**APRÈS :**
```typescript
<StatCard
  title={t("storeStats.cards.conversionRate")}
  value={formatPercentage(overview.taux_conversion)}
  icon={TrendUpIcon}
  variant="info"
/>
```

---

### 📍 Ligne ~507 : Produits Populaires - Titre

**AVANT :**
```typescript
<h2 className="text-xl font-bold text-gray-900">
  Produits Populaires
</h2>
```

**APRÈS :**
```typescript
<h2 className="text-xl font-bold text-gray-900">
  {t("storeStats.popularProducts.title")}
</h2>
```

---

### 📍 Ligne ~510 : Produits Populaires - Badge Top 10

**AVANT :**
```typescript
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
  Top 10
</span>
```

**APRÈS :**
```typescript
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
  {t("storeStats.popularProducts.topLabel")}
</span>
```

---

### 📍 Lignes ~519-526 : Table Headers

**AVANT :**
```typescript
<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Rang
</th>
<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Produit
</th>
<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
  Quantité
</th>
<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
  Revenus
</th>
```

**APRÈS :**
```typescript
<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  {t("storeStats.popularProducts.rank")}
</th>
<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  {t("storeStats.popularProducts.product")}
</th>
<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
  {t("storeStats.popularProducts.quantity")}
</th>
<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
  {t("storeStats.popularProducts.revenue")}
</th>
```

---

### 📍 Ligne ~549 : Quantité vendue

**AVANT :**
```typescript
<div className="text-sm text-gray-900">
  {formatNumber(product.quantite_vendue)} vendus
</div>
```

**APRÈS :**
```typescript
<div className="text-sm text-gray-900">
  {formatNumber(product.quantite_vendue)} {t("storeStats.popularProducts.sold")}
</div>
```

---

### 📍 Ligne ~552 : Nombre de commandes

**AVANT :**
```typescript
<div className="text-sm text-gray-500">
  {product.nombre_commandes} commandes
</div>
```

**APRÈS :**
```typescript
<div className="text-sm text-gray-500">
  {product.nombre_commandes} {t("storeStats.popularProducts.orders")}
</div>
```

---

### 📍 Ligne ~564 : Empty State - Aucun produit

**AVANT :**
```typescript
<EmptyState
  icon={<BoxIcon className="h-12 w-12 text-gray-400" />}
  title="Aucun produit vendu"
  description="Aucune vente n'a été enregistrée pour le moment."
/>
```

**APRÈS :**
```typescript
<EmptyState
  icon={<BoxIcon className="h-12 w-12 text-gray-400" />}
  title={t("storeStats.popularProducts.noProducts")}
  description={t("storeStats.popularProducts.noProductsDescription")}
/>
```

---

### 📍 Ligne ~577 : Ventes par Catégorie - Titre

**AVANT :**
```typescript
<h2 className="text-xl font-bold text-gray-900">
  Ventes par Catégorie
</h2>
```

**APRÈS :**
```typescript
<h2 className="text-xl font-bold text-gray-900">
  {t("storeStats.salesByCategory.title")}
</h2>
```

---

### 📍 Ligne ~592 : Articles et commandes

**AVANT :**
```typescript
<div className="text-sm text-gray-500 mt-1">
  {formatNumber(category.total_articles_vendus)}{" "}
  articles • {category.nombre_commandes} commandes
</div>
```

**APRÈS :**
```typescript
<div className="text-sm text-gray-500 mt-1">
  {formatNumber(category.total_articles_vendus)}{" "}
  {t("storeStats.salesByCategory.articles")} • {category.nombre_commandes} {t("storeStats.salesByCategory.orders")}
</div>
```

---

### 📍 Ligne ~600 : Pourcentage du total

**AVANT :**
```typescript
<div className="text-sm text-gray-500">
  {formatPercentage(category.pourcentage_revenus)} du total
</div>
```

**APRÈS :**
```typescript
<div className="text-sm text-gray-500">
  {formatPercentage(category.pourcentage_revenus)} {t("storeStats.salesByCategory.ofTotal")}
</div>
```

---

### 📍 Ligne ~609 : Empty State - Aucune catégorie

**AVANT :**
```typescript
<EmptyState
  icon={<BoxIcon className="h-12 w-12 text-gray-400" />}
  title="Aucune catégorie"
  description="Aucune vente par catégorie disponible."
/>
```

**APRÈS :**
```typescript
<EmptyState
  icon={<BoxIcon className="h-12 w-12 text-gray-400" />}
  title={t("storeStats.salesByCategory.noCategories")}
  description={t("storeStats.salesByCategory.noCategoriesDescription")}
/>
```

---

### 📍 Ligne ~622 : Alertes Stock - Titre

**AVANT :**
```typescript
<h2 className="text-xl font-bold text-gray-900">Alertes Stock</h2>
```

**APRÈS :**
```typescript
<h2 className="text-xl font-bold text-gray-900">{t("storeStats.stockAlerts.title")}</h2>
```

---

### 📍 Ligne ~625 : Badge alerte(s)

**AVANT :**
```typescript
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
  <WarningTriangleIcon className="h-4 w-4 mr-1" />
  {low_stock.length} alerte(s)
</span>
```

**APRÈS :**
```typescript
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
  <WarningTriangleIcon className="h-4 w-4 mr-1" />
  {low_stock.length} {t("storeStats.stockAlerts.alertsCount")}
</span>
```

---

### 📍 Ligne ~647 : Taille

**AVANT :**
```typescript
<div className="text-sm text-gray-500 mt-1">
  Taille: {item.taille}
</div>
```

**APRÈS :**
```typescript
<div className="text-sm text-gray-500 mt-1">
  {t("storeStats.stockAlerts.size")}: {item.taille}
</div>
```

---

### 📍 Ligne ~656 : disponible / minimum

**AVANT :**
```typescript
<div className="text-xs text-gray-500 mt-1">
  disponible / minimum
</div>
```

**APRÈS :**
```typescript
<div className="text-xs text-gray-500 mt-1">
  {t("storeStats.stockAlerts.availableMinimum")}
</div>
```

---

### 📍 Ligne ~669 : Empty State - Aucune alerte

**AVANT :**
```typescript
<EmptyState
  icon={<BoxIcon className="h-12 w-12 text-gray-400" />}
  title="Aucune alerte"
  description="Tous les articles ont un stock suffisant."
/>
```

**APRÈS :**
```typescript
<EmptyState
  icon={<BoxIcon className="h-12 w-12 text-gray-400" />}
  title={t("storeStats.stockAlerts.noAlerts")}
  description={t("storeStats.stockAlerts.noAlertsDescription")}
/>
```

---

## ✅ Résumé des changements

### Fichiers JSON (Complété) ✅
- ✅ `fr/statistics.json` - Section `storeStats` complète (64 clés)
- ✅ `en/statistics.json` - Section `storeStats` complète (64 clés)

### Composants
- ✅ `FinanceStats.tsx` - 4 titres internationalisés
- ✅ `MemberStats.tsx` - 6 titres internationalisés
- ⏳ `StoreStatsPage.tsx` - 40+ textes à internationaliser (utiliser ce guide)

### Pages
- ✅ `CoursesStatsPage.tsx` - Titre et breadcrumb internationalisés
- ✅ `FinanceStatsPage.tsx` - Titre et breadcrumb internationalisés
- ✅ `MembersStatsPage.tsx` - Titre et breadcrumb internationalisés

---

## 🎯 Instructions finales

1. Ouvrir `StoreStatsPage.tsx`
2. Suivre chaque section ci-dessus ligne par ligne
3. Remplacer les textes hardcodés par les appels `t()`
4. Tester en changeant la langue (FR/EN)
5. Vérifier qu'aucun texte français ne reste en dur

**Total estimé : ~40 remplacements à effectuer**