/**
 * ArticleController
 * Controller pour gérer les endpoints des articles et leurs images
 * Instantiation au niveau module (pattern Clean Architecture)
 */

import type { Response } from "express";
import type { AuthRequest } from "@/shared/middleware/authMiddleware.js";
import { MySQLArticleRepository } from "../../infrastructure/repositories/MySQLArticleRepository.js";
import { getStorageService } from "@/shared/storage/StorageServiceFactory.js";

// ==================== MODULE-LEVEL INSTANTIATION ====================

const repo = new MySQLArticleRepository();
const storageService = getStorageService();

// ==================== CONTROLLER ====================

export class ArticleController {
  /**
   * GET /api/store/articles
   * Retourne la liste paginée des articles avec filtres
   * Query params: search, categorie_id, actif, page, limit
   */
  async getArticles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const categorieId = req.query.categorie_id
        ? Number(req.query.categorie_id)
        : undefined;
      const actif =
        req.query.actif !== undefined
          ? req.query.actif === "true" || req.query.actif === "1"
          : undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await repo.findAll({
        search,
        categorie_id: categorieId,
        actif,
        page,
        limit,
      });

      res.json({
        success: true,
        message: "Articles récupérés",
        data: result,
      });
    } catch (error: unknown) {
      console.error("[ArticleController.getArticles]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * GET /api/store/articles/:id
   * Retourne un article par son ID avec toutes ses images
   */
  async getArticleById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const result = await repo.findById(id);

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Article introuvable",
        });
        return;
      }

      res.json({
        success: true,
        message: "Article récupéré",
        data: result,
      });
    } catch (error: unknown) {
      console.error("[ArticleController.getArticleById]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * POST /api/store/articles
   * Crée un nouvel article
   * Body: { nom, prix, description?, categorie_id?, actif? }
   */
  async createArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nom, prix, description, categorie_id, actif } = req.body;

      // Validation
      if (!nom || nom.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Le nom de l'article est requis",
        });
        return;
      }

      if (prix === undefined || prix === null) {
        res.status(400).json({
          success: false,
          message: "Le prix est requis",
        });
        return;
      }

      const prixNumber = Number(prix);
      if (isNaN(prixNumber) || prixNumber < 0) {
        res.status(400).json({
          success: false,
          message: "Le prix doit être un nombre positif",
        });
        return;
      }

      const id = await repo.create({
        nom: nom.trim(),
        prix: prixNumber,
        description: description ?? null,
        categorie_id: categorie_id ? Number(categorie_id) : null,
        actif: actif !== undefined ? Boolean(actif) : true,
      });

      const article = await repo.findById(id);

      res.status(201).json({
        success: true,
        message: "Article créé",
        data: article,
      });
    } catch (error: unknown) {
      console.error("[ArticleController.createArticle]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * PUT /api/store/articles/:id
   * Met à jour un article existant
   */
  async updateArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { nom, prix, description, categorie_id, actif } = req.body;

      // Vérifier que l'article existe
      const existing = await repo.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Article introuvable",
        });
        return;
      }

      // Validation du prix si fourni
      let prixNumber: number | undefined;
      if (prix !== undefined) {
        prixNumber = Number(prix);
        if (isNaN(prixNumber) || prixNumber < 0) {
          res.status(400).json({
            success: false,
            message: "Le prix doit être un nombre positif",
          });
          return;
        }
      }

      await repo.update(id, {
        nom: nom !== undefined ? nom.trim() : undefined,
        prix: prixNumber,
        description: description !== undefined ? description : undefined,
        categorie_id:
          categorie_id !== undefined ? Number(categorie_id) || null : undefined,
        actif: actif !== undefined ? Boolean(actif) : undefined,
      });

      const updated = await repo.findById(id);

      res.json({
        success: true,
        message: "Article mis à jour",
        data: updated,
      });
    } catch (error: unknown) {
      console.error("[ArticleController.updateArticle]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * DELETE /api/store/articles/:id
   * Supprime un article (et ses images en cascade)
   */
  async deleteArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      // Vérifier que l'article existe et récupérer ses images
      const existing = await repo.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Article introuvable",
        });
        return;
      }

      // Supprimer d'abord les images du storage
      for (const image of existing.images) {
        try {
          // Extraire la clé du storage depuis l'URL
          const key = this.extractStorageKeyFromUrl(image.url);
          if (key) {
            await storageService.delete(key);
          }
        } catch (err) {
          console.warn(`Erreur lors de la suppression de l'image ${image.url}:`, err);
          // Continue même si une image ne peut pas être supprimée
        }
      }

      // Puis supprimer l'article (les images en DB seront supprimées en cascade)
      await repo.delete(id);

      res.json({
        success: true,
        message: "Article supprimé",
      });
    } catch (error: unknown) {
      console.error("[ArticleController.deleteArticle]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * PATCH /api/store/articles/:id/toggle
   * Inverse le statut actif/inactif d'un article
   */
  async toggleArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);

      // Vérifier que l'article existe
      const existing = await repo.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Article introuvable",
        });
        return;
      }

      await repo.toggleActive(id);

      const updated = await repo.findById(id);

      res.json({
        success: true,
        message: "Statut de l'article basculé",
        data: updated,
      });
    } catch (error: unknown) {
      console.error("[ArticleController.toggleArticle]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * POST /api/store/articles/:id/images
   * Upload une image pour un article
   * Utilise le middleware uploadSingleImage qui fournit req.file
   */
  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const articleId = Number(req.params.id);

      // Vérifier que l'article existe
      const existing = await repo.findById(articleId);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Article introuvable",
        });
        return;
      }

      // Vérifier que le fichier a été uploadé
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "Aucun fichier fourni",
        });
        return;
      }

      // Upload vers le storage (local ou S3)
      const uploadResult = await storageService.upload(
        {
          buffer: req.file.buffer,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
        "articles",
      );

      // Déterminer l'ordre de la nouvelle image (max + 1)
      const ordre = existing.images.length > 0
        ? Math.max(...existing.images.map((img) => img.ordre)) + 1
        : 0;

      // Enregistrer l'image en DB
      const imageId = await repo.addImage(articleId, uploadResult.url, ordre);

      // Récupérer l'image créée
      const images = await repo.getImages(articleId);
      const newImage = images.find((img) => img.id === imageId);

      res.status(201).json({
        success: true,
        message: "Image uploadée",
        data: newImage,
      });
    } catch (error: unknown) {
      console.error("[ArticleController.uploadImage]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  /**
   * DELETE /api/store/articles/:articleId/images/:imageId
   * Supprime une image d'un article
   */
  async deleteImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const articleId = Number(req.params.articleId);
      const imageId = Number(req.params.imageId);

      // Vérifier que l'article existe
      const existing = await repo.findById(articleId);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Article introuvable",
        });
        return;
      }

      // Supprimer l'image de la DB (retourne l'URL pour nettoyage storage)
      const imageUrl = await repo.deleteImage(imageId);

      if (!imageUrl) {
        res.status(404).json({
          success: false,
          message: "Image introuvable",
        });
        return;
      }

      // Supprimer du storage
      try {
        const key = this.extractStorageKeyFromUrl(imageUrl);
        if (key) {
          await storageService.delete(key);
        }
      } catch (err) {
        console.warn(`Erreur lors de la suppression du fichier ${imageUrl}:`, err);
        // L'image DB est déjà supprimée, on continue
      }

      res.json({
        success: true,
        message: "Image supprimée",
      });
    } catch (error: unknown) {
      console.error("[ArticleController.deleteImage]", error);
      const msg = error instanceof Error ? error.message : "Erreur interne";
      res.status(500).json({ success: false, message: msg });
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Extrait la clé du storage depuis une URL complète
   * Ex: "http://localhost:3000/uploads/articles/uuid.jpg" → "articles/uuid.jpg"
   * Ex: "https://bucket.s3.region.amazonaws.com/articles/uuid.jpg" → "articles/uuid.jpg"
   */
  private extractStorageKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Pour le storage local : /uploads/articles/uuid.jpg → articles/uuid.jpg
      if (pathname.startsWith("/uploads/")) {
        return pathname.replace("/uploads/", "");
      }

      // Pour S3 : /articles/uuid.jpg → articles/uuid.jpg
      if (pathname.startsWith("/")) {
        return pathname.substring(1);
      }

      return pathname;
    } catch (err) {
      console.error("Erreur lors de l'extraction de la clé du storage:", err);
      return null;
    }
  }
}
