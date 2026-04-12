/**
 * uploadMiddleware
 * Middleware multer configuré avec memoryStorage.
 * Les fichiers sont gardés en mémoire (Buffer) pour être ensuite
 * transmis au StorageService (local ou S3) sans écriture intermédiaire.
 *
 * Validations appliquées :
 *   - Types MIME autorisés : JPEG, PNG, GIF, WebP, SVG
 *   - Taille maximale par fichier : 5 Mo (configurable via MAX_UPLOAD_SIZE_MB)
 */

import multer from "multer";
import type { Request } from "express";
import type { FileFilterCallback } from "multer";

// ==================== CONSTANTES ====================

/** Taille maximale d'un fichier uploadé en octets (défaut : 5 Mo) */
const MAX_FILE_SIZE_BYTES =
  (parseInt(process.env["MAX_UPLOAD_SIZE_MB"] ?? "5", 10) || 5) * 1024 * 1024;

/** Types MIME acceptés pour les images */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

/** Extensions acceptées (vérification secondaire sur le nom du fichier) */
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg)$/i;

// ==================== CONFIGURATION MULTER ====================

/**
 * Filtre de fichier : rejette tout ce qui n'est pas une image reconnue.
 * Vérifie à la fois le MIME type et l'extension du fichier original.
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
): void => {
  const mimeOk = ALLOWED_MIME_TYPES.has(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.test(file.originalname);

  if (mimeOk && extOk) {
    callback(null, true);
  } else {
    callback(
      new Error(
        `Type de fichier non supporté : "${file.mimetype}". ` +
          `Formats acceptés : JPEG, PNG, GIF, WebP, SVG.`,
      ),
    );
  }
};

/**
 * Instance multer avec stockage en mémoire.
 * Le fichier sera disponible dans req.file.buffer après le middleware.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 10, // Maximum 10 fichiers par requête (pour les uploads multiples)
  },
  fileFilter,
});

// ==================== EXPORTS ====================

/**
 * Middleware pour l'upload d'une seule image.
 * Le fichier est attendu dans le champ `image` du formulaire multipart.
 * Après exécution : req.file contient le fichier (ou undefined si absent).
 *
 * Usage dans une route :
 *   router.post("/articles/:id/images", uploadSingleImage, (req, res) => { ... })
 */
export const uploadSingleImage = upload.single("image");

/**
 * Middleware pour l'upload de plusieurs images.
 * Les fichiers sont attendus dans le champ `images` du formulaire multipart.
 * Limite : 10 images maximum par requête.
 * Après exécution : req.files contient le tableau de fichiers.
 *
 * Usage dans une route :
 *   router.post("/articles/:id/images/bulk", uploadMultipleImages, (req, res) => { ... })
 */
export const uploadMultipleImages = upload.array("images", 10);

/**
 * Instance multer brute, utile si on veut configurer des champs personnalisés.
 *
 * @example
 *   uploadMiddleware.fields([{ name: "cover", maxCount: 1 }, { name: "gallery", maxCount: 5 }])
 */
export const uploadMiddleware = upload;
