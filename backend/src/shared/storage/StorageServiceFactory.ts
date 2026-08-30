/**
 * StorageServiceFactory
 * Factory qui instancie le bon service de stockage selon la variable
 * d'environnement STORAGE_PROVIDER.
 *
 * Valeurs acceptées pour STORAGE_PROVIDER :
 *   "local"  - stockage disque local (développement) [défaut]
 *   "s3"     - stockage AWS S3 / compatible S3 (production)
 *
 * Usage :
 *   import { getStorageService } from "@/shared/storage/StorageServiceFactory.js";
 *   const storage = getStorageService();
 *   const result  = await storage.upload(file, "articles");
 */

import type { IStorageService } from "./IStorageService.js";
import { LocalStorageService } from "./LocalStorageService.js";
import { S3StorageService } from "./S3StorageService.js";

// ==================== SINGLETON ====================
// Une seule instance est créée au démarrage de l'application.
// Les instances sont lazy-initialized pour éviter les erreurs de
// configuration au chargement du module si les variables d'env ne sont
// pas encore chargées.

let _instance: IStorageService | null = null;

/**
 * Retourne l'instance singleton du service de stockage.
 * L'instance est créée lors du premier appel (lazy init).
 *
 * La sélection se fait via la variable d'environnement STORAGE_PROVIDER :
 *   - "s3"    → S3StorageService  (production)
 *   - "local" → LocalStorageService (développement, valeur par défaut)
 *
 * @throws Error si STORAGE_PROVIDER vaut "s3" et que les variables AWS
 *         requises sont absentes (levée dans S3StorageService constructor).
 */
export function getStorageService(): IStorageService {
  if (_instance !== null) {
    return _instance;
  }

  const provider = (process.env["STORAGE_PROVIDER"] ?? "local").toLowerCase().trim();

  switch (provider) {
    case "s3":
      _instance = new S3StorageService();
      console.log("[StorageFactory] Provider : S3");
      break;

    case "local":
    default:
      _instance = new LocalStorageService();
      console.log("[StorageFactory] Provider : local");
      break;
  }

  return _instance;
}

/**
 * Réinitialise le singleton.
 * Utile dans les tests unitaires pour forcer la recréation du service
 * avec des variables d'environnement différentes.
 *
 * @internal Ne pas utiliser en production.
 */
export function resetStorageServiceInstance(): void {
  _instance = null;
}

/**
 * Retourne le nom du provider actuellement configuré sans instancier
 * le service (lecture seule de l'env var).
 */
export function getStorageProviderName(): string {
  return (process.env["STORAGE_PROVIDER"] ?? "local").toLowerCase().trim();
}
