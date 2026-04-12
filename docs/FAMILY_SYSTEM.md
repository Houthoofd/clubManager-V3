# 👨‍👩‍👧‍👦 Système de Gestion des Familles

> Documentation technique et fonctionnelle du module `families`
> **Version implémentée : V1** — Branche `feature/family-system`

---

## 📋 Contexte & Problématique

ClubManager gère des membres de club de jiu-jitsu, dont de jeunes enfants.
Ces enfants n'ont pas d'adresse email propre et ne peuvent pas gérer
leur compte eux-mêmes.

**Avant ce module :**
- Chaque compte nécessitait un email + mot de passe valide
- Impossible d'inscrire un enfant sans lui créer un faux email
- Aucun lien entre les membres d'une même famille

**Après ce module :**
- Un parent crée des comptes enfants sans email ni mot de passe
- Chaque membre (adulte ou enfant) reçoit son propre `userId` unique
- Les comptes sont liés dans un groupe familial
- Le parent gère les inscriptions, paiements et suivi de ses enfants

---

## ✅ V1 — Ce qui est implémenté

### Base de données (migration `003_family_system.sql`)

| Élément | Description |
|---|---|
| Table `familles` | Groupe familial (id, nom optionnel) |
| Table `membres_famille` | Pivot utilisateurs ↔ familles avec rôles |
| `utilisateurs.tuteur_id` | FK auto-référente vers le parent/tuteur |
| `utilisateurs.est_mineur` | Flag booléen identifiant les comptes enfants |
| `utilisateurs.peut_se_connecter` | FALSE pour les comptes gérés par un tuteur |
| `utilisateurs.email` | Rendu nullable (NULL pour les enfants) |
| `utilisateurs.password` | Rendu nullable (NULL pour les enfants) |

### Rôles disponibles dans `membres_famille`

| Rôle | Description |
|---|---|
| `parent` | Responsable légal, gère les autres membres |
| `tuteur` | Tuteur légal (hors parenté directe) |
| `enfant` | Membre mineur, compte géré par le parent |
| `conjoint` | Partenaire adulte membre du même groupe |
| `autre` | Tout autre lien familial |

### Backend — 3 routes protégées (`/api/families`)

```
POST   /api/families/members        → Ajouter un membre (enfant/autre)
GET    /api/families/my-family      → Récupérer sa famille complète
DELETE /api/families/members/:userId → Retirer un membre
```

### Sécurité — `LoginUseCase`

Le `LoginUseCase` vérifie `peut_se_connecter === false` **avant** toute
comparaison de mot de passe. Un compte enfant reçoit une erreur claire :

```
HTTP 403 — DIRECT_LOGIN_DISABLED
"Ce compte ne peut pas se connecter directement.
 Veuillez vous connecter avec le compte du responsable légal."
```

### Frontend — Page `/family`

- Section **Ma famille** dans la sidebar
- Grille responsive des cartes membres (nom, âge, rôle, grade)
- Bouton **Ajouter un membre** → modal formulaire simplifié
  (pas d'email, pas de mot de passe requis)
- Retrait d'un membre avec confirmation (responsables uniquement)

---

## 🗺️ Roadmap — Niveaux d'accès (V2+)

### Le constat

En V1, l'accès est **binaire** : un compte peut se connecter ou non.
Cela est parfaitement cohérent pour les jeunes enfants, mais soulève
une question pour les adolescents : devraient-ils pouvoir consulter
leur propre planning, leurs présences, leur progression de grade ?

### Les 3 niveaux envisagés

```
Niveau 1 — COMPLET (adulte autonome)
  → Login email/password standard
  → Accès total à toutes les fonctionnalités
  → Peut gérer sa famille s'il est responsable
  → Exemple : Jean Dupont, 34 ans

Niveau 2 — LECTURE (adolescent 13-17 ans)
  → Login via PIN à 6 chiffres défini par le parent
  → Accès en lecture seule :
      ✓ Voir son planning de cours
      ✓ Voir ses présences
      ✓ Voir sa progression de grade
      ✗ Aucune inscription, paiement ou modification
  → Exemple : Lucas Dupont, 15 ans

Niveau 3 — AUCUN (enfant < 13 ans)
  → Aucune connexion directe possible
  → Compte géré entièrement par le tuteur légal
  → Exemple : Emma Dupont, 7 ans
```

### Changements techniques à prévoir

#### Base de données

Remplacer la colonne `peut_se_connecter BOOLEAN` par un enum plus expressif :

```sql
-- Migration 004 (à créer)
ALTER TABLE utilisateurs
  DROP COLUMN peut_se_connecter,
  ADD COLUMN niveau_acces ENUM('complet', 'lecture', 'aucun')
    NOT NULL DEFAULT 'complet'
    COMMENT 'complet=adulte, lecture=ado read-only, aucun=enfant géré';

-- Ajouter le PIN pour le niveau lecture
ALTER TABLE utilisateurs
  ADD COLUMN pin_hash VARCHAR(255) NULL
    COMMENT 'PIN hashé (bcrypt) pour les comptes niveau lecture';
```

#### Backend

- Nouveau use case `SetMinorPinUseCase` — le parent définit un PIN pour son enfant ado
- Nouveau use case `LoginByPinUseCase` — connexion par userId + PIN (6 chiffres)
- Middleware `requireFullAccess` — bloque les routes de modification pour `niveau_acces = 'lecture'`
- JWT étendu avec `niveau_acces` dans le payload pour un contrôle côté frontend

```typescript
// Extension de JwtPayload à prévoir
export interface JwtPayload {
  userId: number;
  email: string;
  userIdString: string;
  type: "access" | "refresh";
  niveau_acces: "complet" | "lecture" | "aucun"; // ← nouveau
}
```

#### Frontend

- Page `/login` : détecter si l'utilisateur est un ado (niveau lecture)
  et afficher un champ PIN à la place du mot de passe
- Hook `usePermission(action)` — vérifie si l'action est autorisée
  selon le `niveau_acces` du JWT
- Indicateur visuel discret sur les pages pour les comptes en lecture seule
- Formulaire dans la section famille pour définir/réinitialiser le PIN d'un enfant ado

#### RGPD

- Le PIN est hashé avec bcrypt avant stockage (jamais en clair)
- Les données accessibles en mode lecture sont anonymisées (pas de données de paiement)
- Le parent peut révoquer l'accès lecture à tout moment

---

## 🔐 Considérations RGPD spécifiques aux mineurs

| Sujet | Traitement actuel | Évolution V2 |
|---|---|---|
| Consentement | Tuteur responsable légal | Consentement ado requis (13-15 ans) |
| Données accessibles | Gérées par tuteur uniquement | Lecture limitée pour ados |
| Suppression | Via soft delete tuteur | Droit à l'oubli autonome à 16 ans (RGPD Art. 8) |
| Export données | Via compte tuteur | Export autonome pour ados |

---

## 📁 Structure des fichiers

```
backend/src/modules/families/
├── domain/repositories/
│   └── IFamilyRepository.ts        ← Contrat du repository
├── application/use-cases/
│   ├── AddFamilyMemberUseCase.ts   ← Créer un compte enfant + famille
│   ├── GetMyFamilyUseCase.ts       ← Récupérer sa famille
│   └── RemoveFamilyMemberUseCase.ts ← Retirer un membre
├── infrastructure/repositories/
│   └── MySQLFamilyRepository.ts    ← Implémentation SQL
└── presentation/
    ├── controllers/FamilyController.ts
    └── routes/familyRoutes.ts

frontend/src/features/families/
├── api/familyApi.ts                ← Appels HTTP
├── stores/familyStore.ts           ← État Zustand
├── hooks/useFamily.ts              ← Hook React
├── components/
│   ├── FamilyMemberCard.tsx        ← Carte membre
│   └── AddFamilyMemberModal.tsx    ← Formulaire ajout
└── pages/FamilyPage.tsx            ← Page principale

db/
└── migrations/
    └── 003_family_system.sql       ← Migration V1 (avec ROLLBACK)

packages/types/src/
├── domain/family/Family.types.ts   ← Types domaine
└── dtos/family/FamilyDto.ts        ← DTOs API
```

---

## 🧪 Scénarios de test à couvrir

### V1 (actuel)

- [ ] Un parent peut créer un compte enfant sans email
- [ ] Un enfant reçoit un `userId` au format `U-YYYY-XXXX`
- [ ] Une famille est créée automatiquement lors du premier ajout
- [ ] Un second enfant rejoint la famille existante du parent
- [ ] Un compte enfant ne peut pas se connecter (HTTP 403 `DIRECT_LOGIN_DISABLED`)
- [ ] Seul un responsable peut retirer un membre
- [ ] Un responsable ne peut pas se retirer s'il est le seul responsable

### V2 (à venir)

- [ ] Un parent peut définir un PIN pour son enfant ado
- [ ] Un ado peut se connecter avec son userId + PIN
- [ ] Un ado ne peut pas accéder aux routes de paiement
- [ ] Un parent peut révoquer l'accès PIN à tout moment
- [ ] Un ado ne peut pas modifier son propre niveau d'accès

---

## 🔗 Références

- [Migration SQL `003_family_system.sql`](../db/migrations/003_family_system.sql)
- [Schéma consolidé v4.3](../db/creation/SCHEMA_CONSOLIDATE.sql)
- [CHANGELOG base de données](../db/CHANGELOG.md)
- [Documentation sécurité RGPD](../db/SECURITY_V4.0.md)

---

*Document créé lors de la session de développement — branche `feature/family-system`*
*Auteur : Benoit Houthoofd*