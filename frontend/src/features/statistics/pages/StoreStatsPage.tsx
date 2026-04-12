/**
 * @fileoverview Store Statistics Page
 * @module features/statistics/pages
 *
 * Detailed store and sales statistics page.
 * Displays order analytics, popular products, sales by category, and inventory alerts.
 */

import React, { useState } from 'react';
import {
  Page,
  PageSection,
  PageSectionVariants,
  Title,
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
  Skeleton,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Spinner,
  Alert,
  AlertVariant,
  Button,
  Flex,
  FlexItem,
  Label,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@patternfly/react-core';
import {
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  BoxIcon,
  TrendUpIcon,
  DollarSignIcon,
  WarningTriangleIcon,
} from '@patternfly/react-icons';
import { useStoreAnalytics, useInvalidateStatistics } from '../hooks/useStatistics';
import { PeriodSelector } from '../components/PeriodSelector';
import { StatCard } from '../components/StatCard';
import { StoreStats } from '../components/StoreStats';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatting';
import type { PopularProduct, SalesByCategory, LowStockAlert } from '@clubmanager/types';

/**
 * Store Statistics Page Component
 *
 * Provides detailed analytics for the club store including:
 * - Order statistics (total, paid, pending, cancelled)
 * - Revenue and average cart value
 * - Top selling products
 * - Sales breakdown by category
 * - Low stock inventory alerts
 *
 * @example
 * ```tsx
 * <Route path="/statistics/store" element={<StoreStatsPage />} />
 * ```
 */
export const StoreStatsPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useStoreAnalytics();
  const invalidateStats = useInvalidateStatistics();
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Handle manual refresh of statistics
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await invalidateStats();
    await refetch();
    setIsRefreshing(false);
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <Page>
        <PageSection variant={PageSectionVariants.light}>
          <Title headingLevel="h1" size="2xl">
            Statistiques Magasin
          </Title>
        </PageSection>
        <PageSection>
          <Grid hasGutter>
            {[...Array(8)].map((_, index) => (
              <GridItem key={index} md={6} lg={3}>
                <Card>
                  <CardBody>
                    <Skeleton height="100px" />
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </PageSection>
      </Page>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Page>
        <PageSection variant={PageSectionVariants.light}>
          <Title headingLevel="h1" size="2xl">
            Statistiques Magasin
          </Title>
        </PageSection>
        <PageSection>
          <Alert variant="danger" title="Erreur de chargement" isInline>
            {error.message}
            <Button variant="link" onClick={handleRefresh}>
              Réessayer
            </Button>
          </Alert>
        </PageSection>
      </Page>
    );
  }

  /**
   * Render empty state
   */
  if (!data) {
    return (
      <Page>
        <PageSection variant={PageSectionVariants.light}>
          <Title headingLevel="h1" size="2xl">
            Statistiques Magasin
          </Title>
        </PageSection>
        <PageSection>
          <EmptyState>
            <EmptyStateIcon icon={ShoppingCartIcon} />
            <Title headingLevel="h4" size="lg">
              Aucune donnée disponible
            </Title>
            <EmptyStateBody>
              Les statistiques du magasin ne sont pas encore disponibles.
            </EmptyStateBody>
          </EmptyState>
        </PageSection>
      </Page>
    );
  }

  const { overview, popular_products, by_category, low_stock } = data;

  /**
   * Get status variant for stock level
   */
  const getStockStatusVariant = (status: string): 'warning' | 'danger' | 'default' => {
    switch (status) {
      case 'critique':
        return 'danger';
      case 'bas':
        return 'warning';
      case 'rupture':
        return 'danger';
      default:
        return 'default';
    }
  };

  /**
   * Get status label for stock level
   */
  const getStockStatusLabel = (status: string): string => {
    switch (status) {
      case 'critique':
        return 'Stock critique';
      case 'bas':
        return 'Stock bas';
      case 'rupture':
        return 'Rupture de stock';
      default:
        return 'Normal';
    }
  };

  return (
    <Page>
      {/* Page Header */}
      <PageSection variant={PageSectionVariants.light}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              Statistiques Magasin
            </Title>
          </FlexItem>
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsMd' }}>
              <FlexItem>
                <PeriodSelector />
              </FlexItem>
              <FlexItem>
                <Button
                  variant="secondary"
                  onClick={handleRefresh}
                  isLoading={isRefreshing}
                  isDisabled={isRefreshing}
                >
                  Actualiser
                </Button>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      {/* Low Stock Alerts */}
      {low_stock && low_stock.length > 0 && (
        <PageSection>
          <Alert
            variant="warning"
            title={`${low_stock.length} article(s) nécessitent votre attention`}
            isInline
          >
            Des articles ont un stock bas ou sont en rupture de stock.
          </Alert>
        </PageSection>
      )}

      {/* Overview Cards */}
      <PageSection>
        <Grid hasGutter>
          <GridItem md={6} lg={3}>
            <StatCard
              title="Total Commandes"
              value={formatNumber(overview.total_commandes)}
              icon={ShoppingCartIcon}
              variant="primary"
            />
          </GridItem>

          <GridItem md={6} lg={3}>
            <StatCard
              title="Commandes Payées"
              value={formatNumber(overview.commandes_payees)}
              subtitle={formatPercentage(
                (overview.commandes_payees / overview.total_commandes) * 100
              )}
              icon={DollarSignIcon}
              variant="success"
            />
          </GridItem>

          <GridItem md={6} lg={3}>
            <StatCard
              title="Revenus Total"
              value={formatCurrency(overview.total_revenus)}
              icon={TrendUpIcon}
              variant="info"
            />
          </GridItem>

          <GridItem md={6} lg={3}>
            <StatCard
              title="Panier Moyen"
              value={formatCurrency(overview.panier_moyen)}
              icon={ShoppingCartIcon}
              variant="default"
            />
          </GridItem>

          <GridItem md={6} lg={3}>
            <StatCard
              title="En Attente"
              value={formatNumber(overview.commandes_en_attente)}
              icon={BoxIcon}
              variant="warning"
            />
          </GridItem>

          <GridItem md={6} lg={3}>
            <StatCard
              title="Annulées"
              value={formatNumber(overview.commandes_annulees)}
              icon={ExclamationTriangleIcon}
              variant="danger"
            />
          </GridItem>

          <GridItem md={6} lg={3}>
            <StatCard
              title="Articles Vendus"
              value={formatNumber(overview.total_articles_vendus)}
              icon={BoxIcon}
              variant="success"
            />
          </GridItem>

          <GridItem md={6} lg={3}>
            <StatCard
              title="Taux de Conversion"
              value={formatPercentage(overview.taux_conversion)}
              icon={TrendUpIcon}
              variant="primary"
            />
          </GridItem>
        </Grid>
      </PageSection>

      {/* Popular Products */}
      <PageSection>
        <Card>
          <CardTitle>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
              <FlexItem>
                <Title headingLevel="h2" size="xl">
                  Produits Populaires
                </Title>
              </FlexItem>
              <FlexItem>
                <Label color="blue">Top 10</Label>
              </FlexItem>
            </Flex>
          </CardTitle>
          <CardBody>
            {popular_products && popular_products.length > 0 ? (
              <DataList aria-label="Liste des produits populaires" isCompact>
                {popular_products.map((product: PopularProduct, index: number) => (
                  <DataListItem key={product.article_id}>
                    <DataListItemRow>
                      <DataListItemCells
                        dataListCells={[
                          <DataListCell key="rank" width={1}>
                            <strong>#{index + 1}</strong>
                          </DataListCell>,
                          <DataListCell key="name" width={3}>
                            <div>
                              <strong>{product.article_nom}</strong>
                              <div style={{ fontSize: '0.875rem', color: '#6a6e73' }}>
                                {product.categorie}
                              </div>
                            </div>
                          </DataListCell>,
                          <DataListCell key="quantity" width={2} alignRight>
                            <div>
                              <div>{formatNumber(product.quantite_vendue)} vendus</div>
                              <div style={{ fontSize: '0.875rem', color: '#6a6e73' }}>
                                {product.nombre_commandes} commandes
                              </div>
                            </div>
                          </DataListCell>,
                          <DataListCell key="revenue" width={2} alignRight>
                            <strong>{formatCurrency(product.revenus_total)}</strong>
                          </DataListCell>,
                        ]}
                      />
                    </DataListItemRow>
                  </DataListItem>
                ))}
              </DataList>
            ) : (
              <EmptyState>
                <EmptyStateIcon icon={BoxIcon} />
                <Title headingLevel="h4" size="md">
                  Aucun produit vendu
                </Title>
              </EmptyState>
            )}
          </CardBody>
        </Card>
      </PageSection>

      {/* Sales by Category */}
      <PageSection>
        <Grid hasGutter>
          <GridItem md={12} lg={6}>
            <Card isFullHeight>
              <CardTitle>
                <Title headingLevel="h2" size="xl">
                  Ventes par Catégorie
                </Title>
              </CardTitle>
              <CardBody>
                {by_category && by_category.length > 0 ? (
                  <DataList aria-label="Ventes par catégorie" isCompact>
                    {by_category.map((category: SalesByCategory) => (
                      <DataListItem key={category.categorie_id}>
                        <DataListItemRow>
                          <DataListItemCells
                            dataListCells={[
                              <DataListCell key="name" width={3}>
                                <strong>{category.categorie_nom}</strong>
                              </DataListCell>,
                              <DataListCell key="stats" width={3}>
                                <div>
                                  <div>{formatNumber(category.total_articles_vendus)} articles</div>
                                  <div style={{ fontSize: '0.875rem', color: '#6a6e73' }}>
                                    {category.nombre_commandes} commandes
                                  </div>
                                </div>
                              </DataListCell>,
                              <DataListCell key="revenue" width={2} alignRight>
                                <div>
                                  <strong>{formatCurrency(category.revenus_total)}</strong>
                                  <div style={{ fontSize: '0.875rem', color: '#6a6e73' }}>
                                    {formatPercentage(category.pourcentage_revenus)} du total
                                  </div>
                                </div>
                              </DataListCell>,
                            ]}
                          />
                        </DataListItemRow>
                      </DataListItem>
                    ))}
                  </DataList>
                ) : (
                  <EmptyState>
                    <EmptyStateIcon icon={BoxIcon} />
                    <Title headingLevel="h4" size="md">
                      Aucune catégorie
                    </Title>
                  </EmptyState>
                )}
              </CardBody>
            </Card>
          </GridItem>

          {/* Low Stock Alerts */}
          <GridItem md={12} lg={6}>
            <Card isFullHeight>
              <CardTitle>
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                  <FlexItem>
                    <Title headingLevel="h2" size="xl">
                      Alertes Stock
                    </Title>
                  </FlexItem>
                  {low_stock && low_stock.length > 0 && (
                    <FlexItem>
                      <Label color="orange" icon={<WarningTriangleIcon />}>
                        {low_stock.length} alerte(s)
                      </Label>
                    </FlexItem>
                  )}
                </Flex>
              </CardTitle>
              <CardBody>
                {low_stock && low_stock.length > 0 ? (
                  <DataList aria-label="Alertes de stock" isCompact>
                    {low_stock.map((item: LowStockAlert, index: number) => (
                      <DataListItem key={`${item.article_id}-${item.taille}`}>
                        <DataListItemRow>
                          <DataListItemCells
                            dataListCells={[
                              <DataListCell key="name" width={3}>
                                <div>
                                  <strong>{item.article_nom}</strong>
                                  <div style={{ fontSize: '0.875rem', color: '#6a6e73' }}>
                                    Taille: {item.taille}
                                  </div>
                                </div>
                              </DataListCell>,
                              <DataListCell key="quantity" width={2} alignRight>
                                <div>
                                  <div>
                                    <strong>{formatNumber(item.quantite_disponible)}</strong> /{' '}
                                    {formatNumber(item.quantite_minimum)}
                                  </div>
                                  <div style={{ fontSize: '0.875rem', color: '#6a6e73' }}>
                                    disponible / minimum
                                  </div>
                                </div>
                              </DataListCell>,
                              <DataListCell key="status" width={2} alignRight>
                                <Label color={getStockStatusVariant(item.statut)}>
                                  {getStockStatusLabel(item.statut)}
                                </Label>
                              </DataListCell>,
                            ]}
                          />
                        </DataListItemRow>
                      </DataListItem>
                    ))}
                  </DataList>
                ) : (
                  <EmptyState>
                    <EmptyStateIcon icon={BoxIcon} />
                    <Title headingLevel="h4" size="md">
                      Aucune alerte
                    </Title>
                    <EmptyStateBody>Tous les articles ont un stock suffisant.</EmptyStateBody>
                  </EmptyState>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>

      {/* Store Statistics Component (Charts and Trends) */}
      <PageSection>
        <StoreStats data={data} />
      </PageSection>
    </Page>
  );
};

export default StoreStatsPage;
