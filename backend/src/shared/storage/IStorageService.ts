/**
 * IStorageService
 * Interface abstraite pour le service de stockage de fichiers.
 * Permet de switcher entre stockage local (multer disk) et S3
 * uniquement via la variable d'environnement STORAGE_PROVIDER.
 */

/**
 * Résultat d'un upload de fichier
 */
export interface UploadResult {
  /** URL complète et publique du fichier (http://... ou https://...) */
  url: string;
  /** Clé/chemin relatif du fichier dans le storage (pour suppression ultérieure) */
  key: string;
}

/**
 * Fichier reçu par multer (memoryStorage)
 * Sous-ensemble de Express.Multer.File pour éviter la dépendance directe
 */
export interface UploadFile {
  /** Buffer contenant les octets du fichier */
  buffer: Buffer;
  /** Nom original du fichier uploadé par le client */
  originalname: string;
  /** MIME type du fichier (image/jpeg, image/png, etc.) */
  mimetype: string;
  /** Taille du fichier en octets */
  size: number;
}

/**
 * Contrat pour tous les services de stockage de fichiers.
 * Implémenté par LocalStorageService et S3StorageService.
 */
export interface IStorageService {
  /**
   * Upload un fichier dans le storage.
   *
   * @param file     - Fichier reçu via multer (buffer en mémoire)
   * @param folder   - Sous-dossier de destination (ex: "articles", "users")
   * @returns        - URL publique + clé du fichier uploadé
   */
  upload(file: UploadFile, folder: string): Promise<UploadResult>;

  /**
   * Supprime un fichier du storage via sa clé.
   *
   * @param key - Clé retournée lors de l'upload (chemin relatif ou S3 key)
   */
  delete(key: string): Promise<void>;

  /**
   * Retourne le nom du provider actif (pour logs/debug).
   */
  getProviderName(): string;
}
