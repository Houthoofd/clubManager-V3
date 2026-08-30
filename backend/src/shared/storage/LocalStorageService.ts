/**
 * LocalStorageService
 * Implémentation du service de stockage pour l'environnement local (développement).
 * Les fichiers sont écrits sur le disque dans le dossier `uploads/` du projet backend.
 * Express sert ce dossier comme static files via /uploads.
 *
 * Variables d'environnement :
 *   UPLOAD_DIR  - Chemin absolu ou relatif du dossier de stockage (défaut: "./uploads")
 *   APP_URL     - URL de base de l'API pour construire les URLs publiques
 *                 (défaut: "http://localhost:3000")
 */

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { IStorageService, UploadFile, UploadResult } from "./IStorageService.js";

export class LocalStorageService implements IStorageService {
  private readonly uploadDir: string;
  private readonly appUrl: string;

  constructor() {
    this.uploadDir = process.env["UPLOAD_DIR"]
      ? path.resolve(process.env["UPLOAD_DIR"])
      : path.resolve(process.cwd(), "uploads");

    this.appUrl = (process.env["APP_URL"] ?? "http://localhost:3000").replace(
      /\/+$/,
      "",
    );
  }

  /**
   * Upload un fichier sur le disque local.
   * Crée le sous-dossier si nécessaire, génère un nom de fichier unique (UUID),
   * et retourne l'URL publique complète ainsi que la clé relative.
   */
  async upload(file: UploadFile, folder: string): Promise<UploadResult> {
    // Construire le chemin du sous-dossier
    const targetDir = path.join(this.uploadDir, folder);

    // Créer le dossier si inexistant (récursif)
    await fs.mkdir(targetDir, { recursive: true });

    // Générer un nom de fichier unique en conservant l'extension d'origine
    const ext = this.extractExtension(file.originalname, file.mimetype);
    const filename = `${randomUUID()}${ext}`;

    // Chemin complet sur le disque
    const filePath = path.join(targetDir, filename);

    // Écrire le buffer sur le disque
    await fs.writeFile(filePath, file.buffer);

    // La clé est le chemin relatif depuis uploadDir (ex: "articles/uuid.jpg")
    const key = `${folder}/${filename}`;

    // L'URL publique pointe vers le endpoint static d'Express
    const url = `${this.appUrl}/uploads/${key}`;

    return { url, key };
  }

  /**
   * Supprime un fichier du disque via sa clé relative.
   * Ne lève pas d'erreur si le fichier n'existe pas (ENOENT ignoré).
   */
  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);

    try {
      await fs.unlink(filePath);
    } catch (err: unknown) {
      // Ignorer les erreurs "fichier introuvable" — l'objectif est atteint
      if (this.isNodeError(err) && err.code === "ENOENT") {
        return;
      }
      throw err;
    }
  }

  getProviderName(): string {
    return "local";
  }

  // ==================== HELPERS PRIVÉS ====================

  /**
   * Extrait l'extension à partir du nom de fichier original.
   * Fallback sur le MIME type si l'extension est absente ou inconnue.
   */
  private extractExtension(originalname: string, mimetype: string): string {
    const extFromName = path.extname(originalname).toLowerCase();

    if (extFromName && extFromName !== ".") {
      return extFromName;
    }

    // Fallback basé sur le MIME type
    const mimeMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
    };

    return mimeMap[mimetype] ?? ".bin";
  }

  /**
   * Type guard pour les erreurs Node.js avec code d'erreur
   */
  private isNodeError(err: unknown): err is NodeJS.ErrnoException {
    return err instanceof Error && "code" in err;
  }
}
