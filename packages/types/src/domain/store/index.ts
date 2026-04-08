/**
 * Store Domain Types Index
 * Exports centralisés de tous les types du domaine Store
 */

// NOTE: Wildcard exports removed to prevent duplicate exports
// Base types (Article, Category, etc.) are exported from validators
// Only extended domain types are exported below

/**
 * Re-export des types les plus utilisés
 */

// Category
export type {
  CategoryWithRelations,
  CategoryWithStats,
  CategoryWithArticles,
  CategoryPublic,
  CategoryBasic,
  CategoryListItem,
  CategoryMenuItem,
} from "./Category.types.js";

// Size
export type {
  SizeWithRelations,
  SizeWithStats,
  SizeWithArticles,
  SizePublic,
  SizeBasic,
  SizeListItem,
  SizeOption,
  SizeWithAvailability,
} from "./Size.types.js";

// Article
export type {
  ArticleWithRelations,
  ArticleWithImages,
  ArticleWithStocks,
  ArticleWithStats,
  ArticlePublic,
  ArticleBasic,
  ArticleListItem,
  ArticleCatalogItem,
  ArticleDetail,
  ArticleCartItem,
  ArticleWithSizeAvailability,
  ArticleSummary,
} from "./Article.types.js";

// Image
export type {
  ImageWithRelations,
  ImageWithArticle,
  ImagePublic,
  ImageBasic,
  ImageListItem,
  ImageGalleryItem,
  ImageWithMetadata,
  ImageUploadData,
  ImageSorted,
} from "./Image.types.js";

// Stock
export type {
  StockWithRelations,
  StockWithDetails,
  StockWithStatus,
  StockWithHistory,
  StockPublic,
  StockBasic,
  StockListItem,
  StockInventoryItem,
  StockLowItem,
  StockGroupedByArticle,
  StockGroupedBySize,
  StockAvailability,
  StockStats,
  StockSummary,
  StockAdjustment,
  StockReplenishmentSuggestion,
} from "./Stock.types.js";

// Order
export type {
  OrderWithRelations,
  OrderWithItems,
  OrderWithDetails,
  OrderPublic,
  OrderBasic,
  OrderListItem,
  OrderHistoryItem,
  OrderDetail,
  OrderCart,
  OrderStats,
  OrderMonthlySummary,
  OrderDailySummary,
  OrderWithUser,
  OrderExport,
  OrderWithArticleDetails,
  OrderNotification,
} from "./Order.types.js";

// OrderItem
export type {
  OrderItemWithRelations,
  OrderItemWithDetails,
  OrderItemWithOrder,
  OrderItemPublic,
  OrderItemBasic,
  OrderItemListItem,
  OrderItemCart,
  OrderItemReceipt,
  OrderItemStats,
  OrderItemGroupedByArticle,
  OrderItemGroupedBySize,
  OrderItemExport,
  OrderItemWithStockValidation,
  OrderItemSummary,
  OrderItemNotification,
  OrderItemsBySummary,
  OrderItemPriceUpdate,
} from "./OrderItem.types.js";

// StockMovement
export type {
  StockMovementWithRelations,
  StockMovementWithDetails,
  StockMovementPublic,
  StockMovementBasic,
  StockMovementListItem,
  StockMovementHistoryItem,
  StockMovementGroupedByType,
  StockMovementGroupedByArticle,
  StockMovementGroupedByDate,
  StockMovementExport,
  StockMovementStats,
  StockMovementMonthlySummary,
  StockMovementWithValue,
  StockMovementAudit,
  StockMovementTimeline,
} from "./StockMovement.types.js";

// Re-export constants and enums from Order and StockMovement
export { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "./Order.types.js";

export {
  STOCK_MOVEMENT_TYPE_LABELS,
  STOCK_MOVEMENT_TYPE_COLORS,
  STOCK_MOVEMENT_TYPE_ICONS,
} from "./StockMovement.types.js";
