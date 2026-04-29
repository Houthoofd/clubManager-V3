/**
 * storeRoutes
 * Définition de toutes les routes du module boutique/store
 * Ordre important : routes statiques AVANT les routes paramétrées (/:id)
 */

import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { SizeController } from "../controllers/SizeController";
import { ArticleController } from "../controllers/ArticleController";
import { OrderController } from "../controllers/OrderController";
import { StockController } from "../controllers/StockController";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middleware/authMiddleware.js";
import { uploadSingleImage } from "@/shared/middleware/uploadMiddleware.js";
import { UserRole } from "@clubmanager/types";

const router = Router();

// ==================== INSTANTIATION DES CONTROLLERS ====================

const categoryCtrl = new CategoryController();
const sizeCtrl = new SizeController();
const articleCtrl = new ArticleController();
const orderCtrl = new OrderController();
const stockCtrl = new StockController();

// ============================================================
// CATEGORIES
// Accessible en lecture à tous les utilisateurs authentifiés
// Modifications réservées aux admins
// ============================================================

// POST /reorder DOIT être AVANT /:id
router.post(
  "/categories/reorder",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => categoryCtrl.reorderCategories(req as any, res),
);

router.get("/categories", authMiddleware, (req, res) =>
  categoryCtrl.getCategories(req as any, res),
);

router.get("/categories/:id", authMiddleware, (req, res) =>
  categoryCtrl.getCategoryById(req as any, res),
);

router.post(
  "/categories",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => categoryCtrl.createCategory(req as any, res),
);

router.put(
  "/categories/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => categoryCtrl.updateCategory(req as any, res),
);

router.delete(
  "/categories/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => categoryCtrl.deleteCategory(req as any, res),
);

// ============================================================
// SIZES (TAILLES)
// Accessible en lecture à tous, modifications admin only
// ============================================================

router.get("/sizes", authMiddleware, (req, res) =>
  sizeCtrl.getSizes(req as any, res),
);

router.get("/sizes/:id", authMiddleware, (req, res) =>
  sizeCtrl.getSizeById(req as any, res),
);

router.post("/sizes", authMiddleware, requireRole(UserRole.ADMIN), (req, res) =>
  sizeCtrl.createSize(req as any, res),
);

router.put(
  "/sizes/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => sizeCtrl.updateSize(req as any, res),
);

router.delete(
  "/sizes/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => sizeCtrl.deleteSize(req as any, res),
);

// ============================================================
// ARTICLES
// Lecture : tous les utilisateurs authentifiés
// Modifications : admin only
// Upload d'images : admin only
// ============================================================

router.get("/articles", authMiddleware, (req, res) =>
  articleCtrl.getArticles(req as any, res),
);

router.get("/articles/:id", authMiddleware, (req, res) =>
  articleCtrl.getArticleById(req as any, res),
);

router.post(
  "/articles",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => articleCtrl.createArticle(req as any, res),
);

router.put(
  "/articles/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => articleCtrl.updateArticle(req as any, res),
);

router.delete(
  "/articles/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => articleCtrl.deleteArticle(req as any, res),
);

// PATCH /toggle AVANT /:id/images pour éviter que "toggle" soit capturé comme id
router.patch(
  "/articles/:id/toggle",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => articleCtrl.toggleArticle(req as any, res),
);

// Upload d'une image pour un article (multipart/form-data)
router.post(
  "/articles/:id/images",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  uploadSingleImage,
  (req, res) => articleCtrl.uploadImage(req as any, res),
);

// Suppression d'une image d'un article
router.delete(
  "/articles/:articleId/images/:imageId",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => articleCtrl.deleteImage(req as any, res),
);

// ============================================================
// ORDERS (COMMANDES)
// Routes statiques AVANT les routes paramétrées
// IMPORTANT : /my DOIT être AVANT /:id
// ============================================================

// GET /orders/my - Mes commandes (utilisateur connecté)
router.get("/orders/my", authMiddleware, (req, res) =>
  orderCtrl.getMyOrders(req as any, res),
);

// GET /orders - Liste toutes les commandes (admin + professor)
router.get(
  "/orders",
  authMiddleware,
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => orderCtrl.getOrders(req as any, res),
);

// GET /orders/:id - Détail d'une commande (admin + professor)
router.get(
  "/orders/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN, UserRole.PROFESSOR),
  (req, res) => orderCtrl.getOrderById(req as any, res),
);

// POST /orders - Créer une commande (tous les utilisateurs authentifiés)
router.post("/orders", authMiddleware, (req, res) =>
  orderCtrl.createOrder(req as any, res),
);

// PATCH /orders/:id/status - Mettre à jour le statut (admin only)
router.patch(
  "/orders/:id/status",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => orderCtrl.updateOrderStatus(req as any, res),
);

// POST /orders/:id/cancel - Annuler une commande (propriétaire ou admin)
router.post("/orders/:id/cancel", authMiddleware, (req, res) =>
  orderCtrl.cancelOrder(req as any, res),
);

// ============================================================
// STOCKS
// Toutes les routes réservées aux admins
// Routes statiques AVANT /:id
// ============================================================

// GET /stocks/low - Stocks bas (alertes)
router.get(
  "/stocks/low",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => stockCtrl.getLowStocks(req as any, res),
);

// GET /stocks/article/:articleId - Stocks d'un article spécifique
router.get(
  "/stocks/article/:articleId",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => stockCtrl.getArticleStocks(req as any, res),
);

// GET /stocks/movements - Historique des mouvements de stock
router.get(
  "/stocks/movements",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => stockCtrl.getMovements(req as any, res),
);

// GET /stocks - Liste tous les stocks
router.get("/stocks", authMiddleware, requireRole(UserRole.ADMIN), (req, res) =>
  stockCtrl.getStocks(req as any, res),
);

// PUT /stocks/:id - Mettre à jour un stock
router.put(
  "/stocks/:id",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => stockCtrl.updateStock(req as any, res),
);

// POST /stocks/:id/adjust - Ajuster la quantité d'un stock
router.post(
  "/stocks/:id/adjust",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  (req, res) => stockCtrl.adjustStock(req as any, res),
);

export default router;
