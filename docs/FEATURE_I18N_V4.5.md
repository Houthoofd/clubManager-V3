# Feature I18n v4.5 - Support Multilingue

## 📋 Vue d'ensemble

Cette feature ajoute le support multilingue dans ClubManager V3, permettant aux utilisateurs de choisir leur langue préférée pour l'interface utilisateur.

**Version :** 4.5  
**Date :** 2024  
**Branche :** `feature/i18n`  
**Langues supportées :** Français (fr), Anglais (en), Néerlandais (nl), Allemand (de), Espagnol (es)

---

## 🗄️ Modifications de la Base de Données

### 1. Schéma Consolidé (`db/creation/SCHEMA_CONSOLIDATE.sql`)

#### Colonne ajoutée
```sql
-- Internationalisation v4.5
langue_preferee VARCHAR(5) NOT NULL DEFAULT 'fr'
                COMMENT 'Langue préférée utilisateur (ISO 639-1: fr, en, nl, etc.)',
```

**Position :** Après `role_app` (ligne ~186)

#### Constraint ajouté
```sql
-- Constraints
CONSTRAINT chk_langue_preferee
    CHECK (langue_preferee IN ('fr', 'en', 'nl', 'de', 'es')),
```

#### Index ajouté
```sql
INDEX idx_langue_preferee (langue_preferee),
```

### 2. Migration (`db/migrations/V4.5__add_langue_preferee.sql`)

**Fichier complet créé** avec :
- ✅ ALTER TABLE pour ajouter la colonne
- ✅ ALTER TABLE pour ajouter le constraint
- ✅ CREATE INDEX pour l'optimisation
- ✅ Requêtes de vérification post-migration

#### Exécution de la migration
```bash
# Via Flyway ou directement en MySQL
mysql -u root -p clubmanager < db/migrations/V4.5__add_langue_preferee.sql
```

---

## 📦 Modifications des Types TypeScript

### 1. Interface `User` (`packages/types/src/domain/user/User.types.ts`)

```typescript
export interface User {
  // ... autres propriétés
  
  // Internationalisation v4.5
  langue_preferee?: string; // ISO 639-1: fr, en, nl, de, es
  
  // ... suite
}
```

### 2. Interface `UserPublic`

```typescript
export interface UserPublic {
  // ... autres propriétés
  langue_preferee?: string;
  // ...
}
```

### 3. DTOs utilisateur (`packages/types/src/dtos/users/UserDto.ts`)

#### `UpdateUserDto`
```typescript
export interface UpdateUserDto {
  // ... autres propriétés
  langue_preferee?: string; // ISO 639-1: fr, en, nl, de, es
}
```

#### `UserResponseDto`
```typescript
export interface UserResponseDto {
  // ... autres propriétés
  langue_preferee?: string; // ISO 639-1: fr, en, nl, de, es
}
```

#### `UserListItemDto`
```typescript
export interface UserListItemDto {
  // ... autres propriétés
  langue_preferee?: string; // ISO 639-1: fr, en, nl, de, es
}
```

#### Nouveau DTO `UpdateUserLanguageDto`
```typescript
/** DTO pour changer la langue préférée d'un utilisateur */
export interface UpdateUserLanguageDto {
  langue_preferee: string; // ISO 639-1: fr, en, nl, de, es
}
```

---

## 🔧 Modifications Backend (TypeScript)

### 1. Use Case créé : `UpdateUserLanguageUseCase`

**Fichier :** `backend/src/modules/users/application/use-cases/UpdateUserLanguageUseCase.ts`

```typescript
export class UpdateUserLanguageUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: UpdateUserLanguageInput): Promise<void> {
    // Validation : langue autorisée
    // Vérification : utilisateur existe
    // Mise à jour de la langue préférée
  }
}
```

**Validation intégrée :**
- Vérifie que la langue fait partie des langues autorisées : `['fr', 'en', 'nl', 'de', 'es']`
- Vérifie que l'utilisateur existe
- Lance une erreur si validation échoue

### 2. Interface `IUserRepository` modifiée

**Fichier :** `backend/src/modules/users/domain/repositories/IUserRepository.ts`

```typescript
export interface IUserRepository {
  // ... autres méthodes
  updateLanguage(id: number, langue_preferee: string): Promise<void>;
}
```

### 3. Implémentation `MySQLUserRepository`

**Fichier :** `backend/src/modules/users/infrastructure/repositories/MySQLUserRepository.ts`

```typescript
async updateLanguage(id: number, langue_preferee: string): Promise<void> {
  await pool.query(
    "UPDATE utilisateurs SET langue_preferee = ?, updated_at = NOW() WHERE id = ?",
    [langue_preferee, id],
  );
}
```

**Modifications supplémentaires :**
- ✅ Ajout de `langue_preferee` dans `UserRow` interface
- ✅ Ajout de `langue_preferee` dans `UserListRow` interface
- ✅ Ajout dans les requêtes SELECT (findAll, findById)
- ✅ Mapping dans `mapRowToUser()`

### 4. Controller `UserController` modifié

**Fichier :** `backend/src/modules/users/presentation/controllers/UserController.ts`

```typescript
/**
 * PATCH /api/users/:id/language
 * Met à jour la langue préférée d'un utilisateur
 * Note : Un utilisateur ne peut modifier que sa propre langue (sauf admin)
 */
async updateLanguage(req: AuthRequest, res: Response): Promise<void> {
  // Vérification de sécurité : utilisateur ne peut modifier que sa propre langue
  // Sauf si role_app = 'admin'
  // Appelle le use case
}
```

**Sécurité :**
- ✅ Un utilisateur membre/professor ne peut modifier que **sa propre langue**
- ✅ Un admin peut modifier la langue de **n'importe quel utilisateur**
- ✅ Retourne HTTP 403 Forbidden si tentative non autorisée

### 5. Routes modifiées (`userRoutes.ts`)

**Fichier :** `backend/src/modules/users/presentation/routes/userRoutes.ts`

```typescript
// PATCH /api/users/:id/language — utilisateur authentifié
router.patch("/:id/language", (req, res) =>
  ctrl.updateLanguage(req as any, res),
);
```

**Note :** Tous les utilisateurs authentifiés peuvent accéder à cette route, mais la vérification de sécurité se fait dans le controller.

### 6. Modification `MySQLAuthRepository`

**Fichier :** `backend/src/modules/auth/infrastructure/repositories/MySQLAuthRepository.ts`

- ✅ Ajout de `langue_preferee` dans `UserRow` interface
- ✅ Mapping dans `mapRowToUser()`

---

## 🌐 API Endpoints

### Nouveau endpoint : Mettre à jour la langue préférée

```http
PATCH /api/users/:id/language
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "langue_preferee": "en"
}
```

**Réponse succès (200) :**
```json
{
  "success": true,
  "message": "Langue préférée mise à jour"
}
```

**Réponse erreur validation (400) :**
```json
{
  "success": false,
  "message": "Langue non autorisée. Valeurs acceptées : fr, en, nl, de, es"
}
```

**Réponse erreur autorisation (403) :**
```json
{
  "success": false,
  "message": "Vous ne pouvez modifier que votre propre langue préférée"
}
```

**Réponse erreur utilisateur introuvable (404) :**
```json
{
  "success": false,
  "message": "Utilisateur introuvable"
}
```

### Endpoints existants modifiés

Les endpoints suivants retournent maintenant `langue_preferee` dans les données utilisateur :

- ✅ `GET /api/auth/me` — Inclut `langue_preferee`
- ✅ `GET /api/users` — Liste avec `langue_preferee` pour chaque utilisateur
- ✅ `GET /api/users/:id` — Détails utilisateur avec `langue_preferee`

---

## 🧪 Tests à effectuer

### 1. Tests de base de données

```sql
-- Vérifier que la colonne existe
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'utilisateurs' AND COLUMN_NAME = 'langue_preferee';

-- Vérifier le constraint
SELECT CONSTRAINT_NAME, CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE CONSTRAINT_NAME = 'chk_langue_preferee';

-- Vérifier l'index
SHOW INDEX FROM utilisateurs WHERE Key_name = 'idx_langue_preferee';

-- Tester les valeurs valides
UPDATE utilisateurs SET langue_preferee = 'en' WHERE id = 1; -- OK
UPDATE utilisateurs SET langue_preferee = 'nl' WHERE id = 1; -- OK
UPDATE utilisateurs SET langue_preferee = 'fr' WHERE id = 1; -- OK

-- Tester les valeurs invalides (doit échouer)
UPDATE utilisateurs SET langue_preferee = 'invalid' WHERE id = 1; -- ERROR
UPDATE utilisateurs SET langue_preferee = 'zh' WHERE id = 1; -- ERROR
```

### 2. Tests API (avec Postman/Thunder Client)

#### Test 1 : Mettre à jour sa propre langue (membre)
```bash
# Login en tant que membre
POST /api/auth/login
Body: { "userId": "U-2024-0001", "password": "..." }

# Mettre à jour sa propre langue
PATCH /api/users/1/language
Authorization: Bearer {accessToken_du_membre}
Body: { "langue_preferee": "en" }
# Expected: 200 OK
```

#### Test 2 : Tentative de modification de langue d'un autre utilisateur (membre)
```bash
# Avec le même token membre
PATCH /api/users/2/language
Authorization: Bearer {accessToken_du_membre}
Body: { "langue_preferee": "nl" }
# Expected: 403 Forbidden
```

#### Test 3 : Admin peut modifier n'importe quelle langue
```bash
# Login en tant qu'admin
POST /api/auth/login
Body: { "userId": "U-2024-ADMIN", "password": "..." }

# Modifier la langue d'un autre utilisateur
PATCH /api/users/2/language
Authorization: Bearer {accessToken_admin}
Body: { "langue_preferee": "de" }
# Expected: 200 OK
```

#### Test 4 : Validation des langues
```bash
PATCH /api/users/1/language
Body: { "langue_preferee": "zh" }
# Expected: 400 Bad Request
# Message: "Langue non autorisée. Valeurs acceptées : fr, en, nl, de, es"
```

#### Test 5 : Vérifier que /me retourne la langue
```bash
GET /api/auth/me
Authorization: Bearer {accessToken}
# Expected: { ..., "langue_preferee": "en", ... }
```

### 3. Tests d'intégration

```typescript
// Exemple de test Jest
describe('UpdateUserLanguageUseCase', () => {
  it('should update user language successfully', async () => {
    // Arrange
    const useCase = new UpdateUserLanguageUseCase(mockRepo);
    
    // Act
    await useCase.execute({ userId: 1, langue_preferee: 'en' });
    
    // Assert
    expect(mockRepo.updateLanguage).toHaveBeenCalledWith(1, 'en');
  });

  it('should throw error for invalid language', async () => {
    // Arrange
    const useCase = new UpdateUserLanguageUseCase(mockRepo);
    
    // Act & Assert
    await expect(
      useCase.execute({ userId: 1, langue_preferee: 'invalid' })
    ).rejects.toThrow('Langue non autorisée');
  });
});
```

---

## 📚 Utilisation Frontend (à venir)

### Exemple d'intégration

```typescript
// Dans le composant de profil utilisateur
const handleLanguageChange = async (newLanguage: string) => {
  try {
    const response = await fetch(`/api/users/${currentUser.id}/language`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ langue_preferee: newLanguage })
    });
    
    if (response.ok) {
      // Recharger l'interface avec la nouvelle langue
      i18n.changeLanguage(newLanguage);
      toast.success('Langue mise à jour');
    }
  } catch (error) {
    toast.error('Erreur lors de la mise à jour');
  }
};
```

### Composant React (exemple)

```tsx
<Select 
  value={user.langue_preferee || 'fr'}
  onChange={(e) => handleLanguageChange(e.target.value)}
>
  <option value="fr">🇫🇷 Français</option>
  <option value="en">🇬🇧 English</option>
  <option value="nl">🇳🇱 Nederlands</option>
  <option value="de">🇩🇪 Deutsch</option>
  <option value="es">🇪🇸 Español</option>
</Select>
```

---

## ✅ Checklist de déploiement

- [x] ✅ Modifier `SCHEMA_CONSOLIDATE.sql`
- [x] ✅ Créer la migration `V4.5__add_langue_preferee.sql`
- [x] ✅ Modifier les types TypeScript (`User`, `UserPublic`, DTOs)
- [x] ✅ Créer le use case `UpdateUserLanguageUseCase`
- [x] ✅ Modifier l'interface `IUserRepository`
- [x] ✅ Implémenter dans `MySQLUserRepository`
- [x] ✅ Modifier `MySQLAuthRepository`
- [x] ✅ Ajouter la méthode dans `UserController`
- [x] ✅ Ajouter la route dans `userRoutes`
- [x] ✅ Ajouter la sécurité (vérification ownership/admin)
- [ ] ⏳ Exécuter la migration en base de données
- [ ] ⏳ Tester les endpoints API
- [ ] ⏳ Intégrer dans le frontend (sélecteur de langue)
- [ ] ⏳ Connecter avec i18next ou react-intl
- [ ] ⏳ Ajouter les tests unitaires
- [ ] ⏳ Ajouter les tests d'intégration

---

## 🔄 Prochaines étapes

### Phase 2 : Frontend
1. Créer un composant `LanguageSelector`
2. Intégrer i18next ou react-intl
3. Charger les fichiers de traduction (fr.json, en.json, nl.json, etc.)
4. Synchroniser la langue de l'interface avec `langue_preferee`

### Phase 3 : Contenus multilingues
1. Ajouter des tables de traduction pour les contenus dynamiques (grades, status, etc.)
2. Adapter les requêtes pour retourner les libellés dans la langue préférée
3. Système de fallback (fr par défaut si traduction manquante)

### Phase 4 : Emails multilingues
1. Templates d'emails dans différentes langues
2. Envoi d'emails dans la langue préférée de l'utilisateur
3. Personnalisation selon `langue_preferee`

---

## 📝 Notes importantes

- **Valeur par défaut :** `'fr'` (Français) pour tous les nouveaux utilisateurs
- **Migration existante :** Les utilisateurs existants auront automatiquement `'fr'`
- **Extensibilité :** Pour ajouter une nouvelle langue, il faut :
  1. Modifier le CHECK constraint dans le schéma
  2. Créer une nouvelle migration pour ajouter la langue au constraint
  3. Modifier le tableau `ALLOWED_LANGUAGES` dans `UpdateUserLanguageUseCase`
  4. Ajouter les fichiers de traduction frontend

---

## 🐛 Problèmes connus

Aucun pour le moment.

---

## 👥 Contributeurs

- ClubManager V3 Team
- Date : Décembre 2024

---

**Status :** ✅ Backend complété | ⏳ Frontend en attente