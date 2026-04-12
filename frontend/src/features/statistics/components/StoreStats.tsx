/**
 * @fileoverview StoreStats Component
 * @module features/statistics/components
 *
 * Component for displaying store statistics and sales analytics.
 */

import React from 'react';
import {
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
  Skeleton,
  EmptyState,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  Label,
  Flex,
  FlexItem,
  Alert,
  AlertVariant,
  AlertActionCloseButton,
} from '@patternfly/react-core';
import {
  Chart,
  ChartDonut,
  ChartThemeColor,
} from '@patternfly/react-charts';
import {
  ShoppingCartIcon,
  DollarSignIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  BoxIcon,
  TrendUpIcon,
  CheckCircleIcon,
  ClockIcon,
  BanIcon,
} from '@patternfly/react-icons';
import type { StoreAnalyticsResponse } from '@clubmanager/types';
import { StatCard } from './StatCard';
import { formatCurrency, formatNumber, formatPercentage, formatStockStatus } from '../utils/formatting';

/**
 * Props for StoreStats component
 */
export interface StoreStatsProps {
  /** Store analytics data */
  data?: StoreAnalyticsResponse;

  /** Whether the data is loading */
  isLoading?: boolean;

  /** Error message if any */
  error?: Error | null;

  /** Whether to show in compact mode */
  isCompact?: boolean;
}

/**
 * Chart colors for category distribution
 */
const CATEGORY_COLORS = [
  'var(--pf-v5-global--palette--blue-300)',
  'var(--pf-v5-global--palette--purple-300)',
  'var(--pf-v5-global--palette--cyan-300)',
  'var(--pf-v5-global--palette--green-300)',
  'var(--pf-v5-global--palette--gold-300)',
  'var(--pf-v5-global--palette--orange-300)',
  'var(--pf-v5-global--palette--red-300)',
];

/**
 * StoreStats Component
 *
 * Displays comprehensive store statistics including:
 * - Total orders, revenue, and average cart value
 * - Order status distribution
 * - Popular products
 * - Sales by category
 * - Low stock alerts
 *
 * @example
 * ```tsx
 * <StoreStats data={storeAnalytics} isLoading={isLoading} />
 * ```
 */
export const StoreStats: React.FC<StoreStatsProps> = ({
  data,
  isLoading = false,
  error = null,
  isCompact = false,
}) => {
  const [showLowStockAlert, setShowLowStockAlert] = React.useState(true);

  // Error state
  if (error) {
    return (
      <EmptyState>
        <EmptyStateIcon icon={ExclamationTriangleIcon} color="var(--pf-v5-global--danger-color--100)" />
        <Title headingLevel="h2" size="lg">
          Erreur de chargement
        </Title>
        <EmptyStateBody>
          Une erreur est survenue lors du chargement des statistiques du magasin.
          <br />
          {error.message}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  // No data state
  if (!isLoading && !data) {
    return (
      <EmptyState>
        <EmptyStateIcon icon={ShoppingCartIcon} />
        <Title headingLevel="h2" size="lg">
          Aucune donnée disponible
        </Title>
        <EmptyStateBody>
          Les statistiques du magasin ne sont pas disponibles pour le moment.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  // Prepare chart data for categories
  const categoryChartData = data?.by_category.map((item, index) => ({
    x: item.categorie_nom,
    y: item.revenus_total,
    label: `${item.categorie_nom}: ${formatCurrency(item.revenus_total)} (${formatPercentage(item.pourcentage_revenus, 1)})`,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  })) || [];

  const hasLowStock = data && data.low_stock.length > 0;
  const criticalStockCount = data?.low_stock.filter(
    (item) => item.statut === 'critique' || item.statut === 'rupture'
  ).length || 0;

  return (
    <div className="store-stats">
      {/* Low Stock Alert */}
      {hasLowStock && showLowStockAlert && (
        <Alert
          variant={criticalStockCount > 0 ? AlertVariant.danger : AlertVariant.warning}
          title={`${data.low_stock.length} article(s) avec stock bas ou en rupture`}
          actionClose={<AlertActionCloseButton onClose={() => setShowLowStockAlert(false)} />}
          className="pf-v5-u-mb-lg"
        >
          <p>
            {criticalStockCount > 0 && (
              <>
                <strong>{criticalStockCount}</strong> article(s) en stock critique ou en rupture.
                <br />
              </>
            )}
            Consultez la liste des alertes de stock ci-dessous pour effectuer le réapprovisionnement.
          </p>
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid hasGutter>
        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Total Commandes"
            value={data?.overview.total_commandes || 0}
            valueFormat="number"
            icon={ShoppingCartIcon}
            variant="info"
            isLoading={isLoading}
            isCompact={isCompact}
          />
        </GridItem>

        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Total Revenus"
            value={data?.overview.total_revenus || 0}
            valueFormat="currency"
            icon={DollarSignIcon}
            variant="success"
            isLoading={isLoading}
            isCompact={isCompact}
          />
        </GridItem>

        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Panier Moyen"
            value={data?.overview.panier_moyen || 0}
            valueFormat="currency"
            icon={TrendUpIcon}
            variant="default"
            isLoading={isLoading}
            isCompact={isCompact}
            description="Valeur moyenne par commande"
          />
        </GridItem>

        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Articles Vendus"
            value={data?.overview.total_articles_vendus || 0}
            valueFormat="number"
            icon={CubeIcon}
            variant="default"
            isLoading={isLoading}
            isCompact={isCompact}
          />
        </GridItem>
      </Grid>

      {/* Order Status KPIs */}
      <Grid hasGutter className="pf-v5-u-mt-lg">
        <GridItem span={12} md={4}>
          <StatCard
            title="Commandes Payées"
            value={data?.overview.commandes_payees || 0}
            valueFormat="number"
            icon={CheckCircleIcon}
            variant="success"
            isLoading={isLoading}
            isCompact={isCompact}
            description={
              data
                ? `${formatPercentage(
                    (data.overview.commandes_payees / data.overview.total_commandes) * 100,
                    1
                  )} du total`
                : undefined
            }
          />
        </GridItem>

        <GridItem span={12} md={4}>
          <StatCard
            title="Commandes En Attente"
            value={data?.overview.commandes_en_attente || 0}
            valueFormat="number"
            icon={ClockIcon}
            variant={
              data && data.overview.commandes_en_attente > data.overview.commandes_payees / 2
                ? 'warning'
                : 'default'
            }
            isLoading={isLoading}
            isCompact={isCompact}
            description={
              data
                ? `${formatPercentage(
                    (data.overview.commandes_en_attente / data.overview.total_commandes) * 100,
                    1
                  )} du total`
                : undefined
            }
          />
        </GridItem>

        <GridItem span={12} md={4}>
          <StatCard
            title="Commandes Annulées"
            value={data?.overview.commandes_annulees || 0}
            valueFormat="number"
            icon={BanIcon}
            variant={data && data.overview.commandes_annulees > 0 ? 'danger' : 'default'}
            isLoading={isLoading}
            isCompact={isCompact}
            description={
              data
                ? `${formatPercentage(
                    (data.overview.commandes_annulees / data.overview.total_commandes) * 100,
                    1
                  )} du total`
                : undefined
            }
          />
        </GridItem>
      </Grid>

      {/* Secondary KPI */}
      <Grid hasGutter className="pf-v5-u-mt-lg">
        <GridItem span={12}>
          <StatCard
            title="Taux de Conversion"
            value={data?.overview.taux_conversion || 0}
            valueFormat="percentage"
            icon={TrendUpIcon}
            variant={
              data && data.overview.taux_conversion >= 70
                ? 'success'
                : data && data.overview.taux_conversion >= 50
                ? 'warning'
                : 'danger'
            }
            isLoading={isLoading}
            isCompact={isCompact}
            description="Commandes payées / Total commandes"
          />
        </GridItem>
      </Grid>

      {/* Charts and Lists */}
      <Grid hasGutter className="pf-v5-u-mt-lg">
        {/* Sales by Category */}
        <GridItem span={12} lg={6}>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">
                Ventes par Catégorie
              </Title>
            </CardTitle>
            <CardBody>
              {isLoading ? (
                <Skeleton height="350px" />
              ) : categoryChartData.length > 0 ? (
                <div style={{ height: '350px' }}>
                  <ChartDonut
                    ariaDesc="Répartition des ventes par catégorie"
                    ariaTitle="Catégories"
                    constrainToVisibleArea
                    data={categoryChartData}
                    labels={({ datum }) => `${datum.x}: ${formatCurrency(datum.y)}`}
                    legendData={categoryChartData.map((d) => ({ name: d.label }))}
                    legendOrientation="vertical"
                    legendPosition="right"
                    padding={{
                      bottom: 20,
                      left: 20,
                      right: 220,
                      top: 20,
                    }}
                    subTitle="Revenus"
                    title={formatCurrency(data?.overview.total_revenus || 0)}
                    width={500}
                    height={350}
                    colorScale={categoryChartData.map((d) => d.color)}
                  />
                </div>
              ) : (
                <EmptyState>
                  <EmptyStateBody>Aucune donnée de catégorie disponible</EmptyStateBody>
                </EmptyState>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* Category Details */}
        <GridItem span={12} lg={6}>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">
                Détails par Catégorie
              </Title>
            </CardTitle>
            <CardBody>
              {isLoading ? (
                <Skeleton height="350px" />
              ) : data && data.by_category.length > 0 ? (
                <DataList aria-label="Détails par catégorie" isCompact>
                  {data.by_category.map((category) => (
                    <DataListItem key={category.categorie_id}>
                      <DataListItemRow>
                        <DataListItemCells
                          dataListCells={[
                            <DataListCell key="name" width={3}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem>
                                  <strong>{category.categorie_nom}</strong>
                                </FlexItem>
                                <FlexItem className="pf-v5-u-color-200 pf-v5-u-font-size-sm">
                                  {formatPercentage(category.pourcentage_revenus, 1)} des revenus
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                            <DataListCell key="revenue" width={2}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                  Revenus
                                </FlexItem>
                                <FlexItem>
                                  <strong>{formatCurrency(category.revenus_total)}</strong>
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                            <DataListCell key="items" width={2}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                  Articles vendus
                                </FlexItem>
                                <FlexItem>
                                  <strong>{formatNumber(category.total_articles_vendus)}</strong>
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                            <DataListCell key="orders" width={2}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                  Commandes
                                </FlexItem>
                                <FlexItem>
                                  <strong>{formatNumber(category.nombre_commandes)}</strong>
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                          ]}
                        />
                      </DataListItemRow>
                    </DataListItem>
                  ))}
                </DataList>
              ) : (
                <EmptyState>
                  <EmptyStateBody>Aucune donnée de catégorie disponible</EmptyStateBody>
                </EmptyState>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Popular Products */}
      <Grid hasGutter className="pf-v5-u-mt-lg">
        <GridItem span={12}>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">
                Produits Populaires (Top 10)
              </Title>
            </CardTitle>
            <CardBody>
              {isLoading ? (
                <Skeleton height="300px" />
              ) : data && data.popular_products.length > 0 ? (
                <DataList aria-label="Produits populaires" isCompact>
                  {data.popular_products.slice(0, 10).map((product, index) => (
                    <DataListItem key={product.article_id}>
                      <DataListItemRow>
                        <DataListItemCells
                          dataListCells={[
                            <DataListCell key="rank" width={1}>
                              <Label color="blue">#{index + 1}</Label>
                            </DataListCell>,
                            <DataListCell key="name" width={3}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem>
                                  <strong>{product.article_nom}</strong>
                                </FlexItem>
                                <FlexItem className="pf-v5-u-color-200 pf-v5-u-font-size-sm">
                                  <BoxIcon className="pf-v5-u-mr-xs" />
                                  {product.categorie}
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                            <DataListCell key="quantity" width={2}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                  Quantité vendue
                                </FlexItem>
                                <FlexItem>
                                  <strong>{formatNumber(product.quantite_vendue)}</strong>
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                            <DataListCell key="revenue" width={2}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                  Revenus
                                </FlexItem>
                                <FlexItem>
                                  <strong>{formatCurrency(product.revenus_total)}</strong>
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                            <DataListCell key="orders" width={2}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                  Nombre de commandes
                                </FlexItem>
                                <FlexItem>
                                  <strong>{formatNumber(product.nombre_commandes)}</strong>
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                          ]}
                        />
                      </DataListItemRow>
                    </DataListItem>
                  ))}
                </DataList>
              ) : (
                <EmptyState>
                  <EmptyStateBody>Aucun produit populaire à afficher</EmptyStateBody>
                </EmptyState>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Low Stock Alerts */}
      {hasLowStock && (
        <Grid hasGutter className="pf-v5-u-mt-lg">
          <GridItem span={12}>
            <Card>
              <CardTitle>
                <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                  <FlexItem>
                    <Title headingLevel="h3" size="lg">
                      Alertes de Stock
                    </Title>
                  </FlexItem>
                  <FlexItem>
                    <Label color={criticalStockCount > 0 ? 'red' : 'orange'} icon={<ExclamationTriangleIcon />}>
                      {data.low_stock.length} alerte(s)
                    </Label>
                  </FlexItem>
                </Flex>
              </CardTitle>
              <CardBody>
                {isLoading ? (
                  <Skeleton height="200px" />
                ) : (
                  <DataList aria-label="Alertes de stock" isCompact>
                    {data.low_stock.map((item) => {
                      const { label, color } = formatStockStatus(item.statut);
                      return (
                        <DataListItem key={`${item.article_id}-${item.taille}`}>
                          <DataListItemRow>
                            <DataListItemCells
                              dataListCells={[
                                <DataListCell key="status" width={1}>
                                  <Label color={color}>{label}</Label>
                                </DataListCell>,
                                <DataListCell key="name" width={3}>
                                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                    <FlexItem>
                                      <strong>{item.article_nom}</strong>
                                    </FlexItem>
                                    <FlexItem className="pf-v5-u-color-200 pf-v5-u-font-size-sm">
                                      Taille: {item.taille}
                                    </FlexItem>
                                  </Flex>
                                </DataListCell>,
                                <DataListCell key="available" width={2}>
                                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                    <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                      Stock disponible
                                    </FlexItem>
                                    <FlexItem>
                                      <strong
                                        className={
                                          item.quantite_disponible === 0
                                            ? 'pf-v5-u-danger-color-100'
                                            : item.quantite_disponible < item.quantite_minimum
                                            ? 'pf-v5-u-warning-color-100'
                                            : ''
                                        }
                                      >
                                        {formatNumber(item.quantite_disponible)}
                                      </strong>
                                    </FlexItem>
                                  </Flex>
                                </DataListCell>,
                                <DataListCell key="minimum" width={2}>
                                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                    <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                      Stock minimum
                                    </FlexItem>
                                    <FlexItem>
                                      <strong>{formatNumber(item.quantite_minimum)}</strong>
                                    </FlexItem>
                                  </Flex>
                                </DataListCell>,
                                <DataListCell key="action" width={3}>
                                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                    <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                      Action requise
                                    </FlexItem>
                                    <FlexItem>
                                      <strong>
                                        {item.statut === 'rupture'
                                          ? 'Réapprovisionner immédiatement'
                                          : item.statut === 'critique'
                                          ? 'Réapprovisionner rapidement'
                                          : 'Prévoir réapprovisionnement'}
                                      </strong>
                                    </FlexItem>
                                  </Flex>
                                </DataListCell>,
                              ]}
                            />
                          </DataListItemRow>
                        </DataListItem>
                      );
                    })}
                  </DataList>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      )}

      <style>{`
        .store-stats {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default StoreStats;
