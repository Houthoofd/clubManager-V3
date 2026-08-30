# Migration V5.2 — Système d'invitation

**Date :** 2026-07-24  
**Version DB :** 5.1 → 5.2  
**Fichier :** `db/migrations/V5.2__invitation_system.sql`

---

## Contexte

Avant v5.2, l'inscription était ouverte à tous. N'importe qui pouvait créer un compte sans être invité.  
La v5.2 ferme l'inscription libre : **seule une invitation envoyée par un admin permet de s'inscrire**.

---

## Changements

### Nouvelle table : `invitations`

```sql
CREATE TABLE invitations (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  token_hash    VARCHAR(64)  NOT NULL UNIQUE,  -- SHA-256 du token (jamais en clair)
  email         VARCHAR(255) NOT NULL,
  invited_by    INT UNSIGNED NOT NULL,          -- FK → utilisateurs.id
  status        ENUM('pending','accepted','revoked') NOT NULL DEFAULT 'pending',
  expires_at    TIMESTAMP    NOT NULL,
  used_at       TIMESTAMP    NULL DEFAULT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Flux d'utilisation

1. Admin envoie une invitation via `POST /api/invitations` → token généré, hash stocké en DB, email envoyé
2. Invité reçoit un lien : `{FRONTEND_URL}/register?token=<token_en_clair>`
3. Frontend valide le token via `GET /api/invitations/validate?token=xxx` avant d'afficher le formulaire
4. Lors de l'inscription (`POST /api/auth/register`), le token est vérifié puis consommé (`status = 'accepted'`)
5. Sans token valide → inscription bloquée côté backend ET frontend

### Sécurité

| Point | Détail |
|---|---|
| Token | `crypto.randomBytes(32)` → 64 chars hex |
| Stockage | SHA-256 en DB — le token en clair n'est jamais persisté |
| Expiration | 7 jours |
| Usage unique | `status` passe à `'accepted'` après inscription |
| Email verrouillé | L'email du formulaire doit correspondre à l'invitation |
| Révocation | Admin peut révoquer via `DELETE /api/invitations/:id` |

---

## Appliquer la migration

```bash
mysql -u root clubmanager < db/migrations/V5.2__invitation_system.sql
```

## Rollback

```sql
DROP TABLE IF EXISTS invitations;
```

---

## Impact sur les modules existants

| Module | Changement |
|---|---|
| `RegisterUseCase` | Vérifie + consomme le token d'invitation avant de créer l'utilisateur |
| `RegisterDto` (`@clubmanager/types`) | Ajout du champ `invitation_token: string` (obligatoire) |
| `EmailService` | Nouvelle méthode `sendInvitationEmail()` |
| `RegisterPage` (frontend) | Lit `?token=` depuis l'URL, bloque si absent/invalide |
