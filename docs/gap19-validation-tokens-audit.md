# GAP-19 — Audit de la table `validation_tokens`

**Date :** 2025  
**Auteur :** Audit automatisé (GAP-19)  
**Statut :** ✅ Complété — Migration de dépréciation générée

---

## 1. Structure de la table

Définie dans `db/creation/SCHEMA_CONSOLIDATE.sql` (section 2.9) :

```sql
CREATE TABLE validation_tokens (
    id INT UNSIGNED AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    type ENUM('email', 'password_reset', 'other') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_validation_tokens_utilisateur
        FOREIGN KEY (user_id) REFERENCES utilisateurs(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_expires_at (expires_at),
    INDEX idx_used (used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tokens de validation génériques';
```

### Colonnes

| Colonne | Type | Description |
|---|---|---|
| `id` | `INT UNSIGNED AUTO_INCREMENT` | Clé primaire |
| `user_id` | `INT UNSIGNED NOT NULL` | FK → `utilisateurs(id)` |
| `token` | `VARCHAR(255) NOT NULL UNIQUE` | Valeur du token (non hashée) |
| `type` | `ENUM('email','password_reset','other')` | Catégorie du token |
| `expires_at` | `TIMESTAMP NOT NULL` | Date d'expiration |
| `used` | `BOOLEAN DEFAULT FALSE` | Marqueur de consommation |
| `created_at` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | Horodatage de création |

---

## 2. Résultat de l'audit

### 2.1 Références dans le code TypeScript (`backend/src/`)

**Commande :** `grep -r "validation_tokens" backend/src --include="*.ts"`

```
Résultat : AUCUNE occurrence trouvée.
La table `validation_tokens` n'est référencée dans AUCUN fichier TypeScript.
```

Seule `email_validation_tokens` est utilisée dans le backend TypeScript, dans :

- `backend/src/modules/auth/infrastructure/repositories/MySQLAuthRepository.ts`
  - `INSERT INTO email_validation_tokens ...`
  - `SELECT user_id FROM email_validation_tokens ...`
  - `DELETE FROM email_validation_tokens WHERE token_hash = ?`
  - `DELETE FROM email_validation_tokens WHERE expires_at < NOW()`

### 2.2 Références dans les fichiers SQL (`db/`)

**Commande :** `grep -r "validation_tokens" db/ --include="*.sql"`

| Fichier | Occurrence | Table concernée |
|---|---|---|
| `db/creation/SCHEMA_CONSOLIDATE.sql` | Définition CREATE TABLE | `validation_tokens` ← **table générique** |
| `db/creation/SCHEMA_CONSOLIDATE.sql` | Définition CREATE TABLE | `email_validation_tokens` |
| `db/migrations/002_normalize_user_id.sql` | ALTER TABLE | `email_validation_tokens` |
| `db/procedures/create_email_validation_token.sql` | INSERT / DELETE | `email_validation_tokens` |
| `db/procedures/validate_email_token.sql` | SELECT / UPDATE | `email_validation_tokens` |

**Conclusion SQL :** `validation_tokens` n'apparaît que dans sa propre définition dans le schéma.
Aucune procédure, trigger ni migration ne l'utilise.

---

## 3. Tables de tokens spécifiques qui la remplacent

| Table spécifique | Rôle | Utilisée ? |
|---|---|---|
| `email_validation_tokens` | Vérification email + changement email | ✅ Oui (backend + procédures) |
| `password_reset_tokens` | Réinitialisation de mot de passe | ✅ Oui (backend) |
| `refresh_tokens` | Sessions JWT (refresh) | ✅ Oui (backend) |

---

## 4. Recommandation

### 🗑️ SUPPRIMER — Table non utilisée et doublon fonctionnel

La table `validation_tokens` est une table générique **morte** :

- ❌ Aucune référence dans le code TypeScript (`backend/src/`)
- ❌ Aucune procédure stockée ne l'utilise
- ❌ Aucune migration ne la peuple
- ✅ Son rôle est 100% couvert par `email_validation_tokens` et `password_reset_tokens`
- ⚠️ Elle introduit de la confusion : son champ `type` recouvre les mêmes cas (`email`,
  `password_reset`) que les tables spécifiques

**Action prise :** Création de `db/migrations/009_deprecate_validation_tokens.sql` pour
supprimer la table après vérification que 0 lignes existent en production.

---

## 5. Checklist avant exécution en production

- [ ] Exécuter : `SELECT COUNT(*) FROM validation_tokens;` → doit retourner **0**
- [ ] Vérifier que la migration est appliquée sur un environnement de test d'abord
- [ ] Confirmer qu'aucun outil externe (scripts de seed, backups, monitoring) ne référence cette table

---

*Audit réalisé dans le cadre de GAP-19 — ClubManager V3*
