/**
 * S3StorageService
 * Implémentation du service de stockage pour AWS S3 (production).
 * Les fichiers sont uploadés dans un bucket S3 et l'URL publique est retournée.
 *
 * Variables d'environnement requises :
 *   STORAGE_S3_BUCKET        - Nom du bucket S3
 *   STORAGE_S3_REGION        - Région AWS (ex: eu-west-3)
 *   STORAGE_S3_ACCESS_KEY_ID     - Clé d'accès AWS IAM
 *   STORAGE_S3_SECRET_ACCESS_KEY - Secret AWS IAM
 *   STORAGE_S3_ENDPOINT      - (optionnel) Endpoint custom pour MinIO/compat S3
 *   STORAGE_S3_PUBLIC_URL    - (optionnel) URL publique custom (CDN, custom domain)
 *                              Si absent, l'URL standard S3 est utilisée.
 */

import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";
import type { IStorageService, UploadFile, UploadResult } from "./IStorageService.js";

export class S3StorageService implements IStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly publicUrlBase: string;

  constructor() {
    const bucket = process.env["STORAGE_S3_BUCKET"];
    const region = process.env["STORAGE_S3_REGION"];
    const accessKeyId = process.env["STORAGE_S3_ACCESS_KEY_ID"];
    const secretAccessKey = process.env["STORAGE_S3_SECRET_ACCESS_KEY"];

    if (!bucket) throw new Error("[S3StorageService] STORAGE_S3_BUCKET est requis");
    if (!region) throw new Error("[S3StorageService] STORAGE_S3_REGION est requis");
    if (!accessKeyId) throw new Error("[S3StorageService] STORAGE_S3_ACCESS_KEY_ID est requis");
    if (!secretAccessKey) throw new Error("[S3StorageService] STORAGE_S3_SECRET_ACCESS_KEY est requis");

    this.bucket = bucket;
    this.region = region;

    // Support d'un endpoint custom (MinIO, LocalStack, DigitalOcean Spaces, etc.)
    const endpoint = process.env["STORAGE_S3_ENDPOINT"];

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    });

    // URL publique : custom (CDN) ou standard S3
    const customPublicUrl = process.env["STORAGE_S3_PUBLIC_URL"];
    this.publicUrlBase = customPublicUrl
      ? customPublicUrl.replace(/\/+$/, "")
      : `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
  }

  /**
   * Upload un fichier dans le bucket S3.
   * Génère une clé unique (folder/uuid.ext), définit le Content-Type,
   * et retourne l'URL publique ainsi que la clé S3.
   */
  async upload(file: UploadFile, folder: string): Promise<UploadResult> {
    // Générer une clé unique avec le sous-dossier
    const ext = this.extractExtension(file.originalname, file.mimetype);
    const filename = `${randomUUID()}${ext}`;
    const key = `${folder}/${filename}`;

    // Commande PutObject vers S3
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
      // ACL retiré : géré au niveau du bucket (Block Public Access désactivé
      // + bucket policy public read, ou utilisation d'un CDN/presigned URL)
    });

    await this.client.send(command);

    const url = `${this.publicUrlBase}/${key}`;

    return { url, key };
  }

  /**
   * Supprime un objet S3 via sa clé.
   * Ne lève pas d'erreur si l'objet n'existe pas (S3 retourne 204 dans ce cas).
   */
  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  getProviderName(): string {
    return "s3";
  }

  // ==================== HELPERS PRIVÉS ====================

  /**
   * Extrait l'extension à partir du nom de fichier original.
   * Fallback sur le MIME type si l'extension est absente.
   */
  private extractExtension(originalname: string, mimetype: string): string {
    const extFromName = path.extname(originalname).toLowerCase();

    if (extFromName && extFromName !== ".") {
      return extFromName;
    }

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
}
