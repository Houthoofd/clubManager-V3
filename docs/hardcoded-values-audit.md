# Audit des Valeurs Hardcodées - Frontend ClubManager V3

**Date de l'audit** : Décembre 2024  
**Version** : V3  
**Périmètre** : `frontend/src/features/*`

---

## 📋 Résumé Exécutif

Cet audit identifie **14 catégories** de valeurs hardcodées dans le frontend qui devraient être migrées vers la base de données pour une gestion plus flexible et maintenable.

### Statistiques

| Catégorie | Fichiers concernés | Valeurs distinctes | Priorité |
|-----------|-------------------|-------------------|----------|
| Méthodes de paiement | 3 | 4 | 🔴 HAUTE |
| Statuts de commande | 5 | 7 | 🔴 HAUTE |
| Statuts de paiement | 3 | 7 | 🔴 HAUTE |
| Rôles utilisateurs | 2 | 4 | 🟠 MOYENNE |
| Statuts utilisateurs | 2 | 5 | 🟠 MOYENNE |
| Statuts d'échéance | 2 | 4 | 🟠 MOYENNE |
| Rôles familiaux | 2 | 3 | 🟡 BASSE |
| Genres | 1 | 3 | 🟡 BASSE |
| Types de cours | 4 | ∞ (texte libre) | 🔴 HAUTE |
| Jours de la semaine | 1 | 7 | 🟢 OK (standard) |
| Statuts de présence | 1 | 2 | 🟠 MOYENNE |
| Catégories d'articles | 1 | Variable | ✅ Déjà en DB |
| Tailles d'articles | 1 | Variable | ✅ Déjà en DB |
| Catégories de templates | 2 | Variable | ✅ Déjà en DB |

**Total de fichiers impactés** : ~25 fichiers  
**Total de valeurs hardcodées** : ~44 valeurs uniques

---

## 1. Méthodes de Paiement 💳

### Valeurs hardcodées
- `especes` (Espèces)
- `virement` (Virement bancaire)
- `autre` (Autre méthode)
- `stripe` (Carte bancaire via Stripe)

### Fichiers concernés

#### 1.1 `frontend/src/features/payments/components/RecordPaymentModal.tsx`
**Lignes** : 33, 71, 84, 177-181

```typescript
methode_paiement: "especes" | "virement" | "autre"

<option value="especes">{t("methods.cash")}</option>
<option value="virement">{t("methods.transfer")}</option>
<option value="autre">{t("methods.other")}</option>
```

#### 1.2 `frontend/src/features/payments/components/tabs/PaymentsTab.tsx`
**Lignes** : 189-196

```typescript
<option value="stripe">{t("methods.stripe")}</option>
<option value="especes">{t("methods.cash")}</option>
<option value="virement">{t("methods.transfer")}</option>
<option value="autre">{t("methods.other")}</option>
```

#### 1.3 `frontend/src/shared/components/Badge/Badge.tsx`
**Lignes** : 487-510

```typescript
export function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
  const methodConfigMap: Record<string, {...}> = {
    stripe: { variant: "info", Icon: CreditCardIcon, label: "Carte bancaire" },
    especes: { variant: "success", Icon: BanknotesIcon, label: "Espèces" },
    virement: { variant: "purple", Icon: BuildingLibraryIcon, label: "Virement" },
    autre: { variant: "neutral", Icon: TagIcon, label: "Autre" },
  };
}
```

### Impact
- **3 fichiers** avec logique métier
- **1 composant** de design system
- Utilisé dans les modals de paiement, filtres et badges

### Recommandation
✅ **Créer une table `methodes_paiement`**

```sql
CREATE TABLE methodes_paiement (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  icone VARCHAR(50), -- nom de l'icône
  couleur VARCHAR(20), -- variant du badge
  actif BOOLEAN DEFAULT true,
  ordre INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Données initiales
INSERT INTO methodes_paiement (code, nom, icone, couleur, ordre) VALUES
  ('especes', 'Espèces', 'BanknotesIcon', 'success', 1),
  ('virement', 'Virement bancaire', 'BuildingLibraryIcon', 'purple', 2),
  ('stripe', 'Carte bancaire', 'CreditCardIcon', 'info', 3),
  ('autre', 'Autre', 'TagIcon', 'neutral', 4);
```

---

## 2. Statuts de Commande 📦

### Valeurs hardcodées
- `en_attente` (En attente)
- `en_cours` (En cours)
- `payee` (Payée)
- `expediee` (Expédiée)
- `prete` (Prête)
- `livree` (Livrée)
- `annulee` (Annulée)

### Fichiers concernés

#### 2.1 `frontend/src/features/store/components/OrderStatusBadge.tsx`
**Lignes** : 21-70

```typescript
const validStatuses = [
  "en_attente", "en_cours", "payee", "expediee", "prete", "livree", "annulee"
];
```

#### 2.2 `frontend/src/features/store/components/OrderDetailModal.tsx`
**Lignes** : 107-344

```typescript
const canMarkAsPaid = order.statut === "en_attente";
const canMarkAsShipped = order.statut === "payee";
const canMarkAsDelivered = order.statut === "expediee";
const canCancel = order.statut !== "annulee" && order.statut !== "livree";

onClick={() => handleStatusChange("payee")}
onClick={() => handleStatusChange("expediee")}
onClick={() => handleStatusChange("livree")}
onClick={() => handleStatusChange("annulee")}
```

#### 2.3 `frontend/src/features/store/components/tabs/MyOrdersTab.tsx`
**Lignes** : 37-41, 126

```typescript
const enAttenteCount = ordersQuery.data?.filter(
  (order) => order.statut === "en_attente"
).length ?? 0;

const livreeCount = ordersQuery.data?.filter(
  (order) => order.statut === "livree"
).length ?? 0;

{order.statut === "en_attente" && (
  <button>Annuler la commande</button>
)}
```

#### 2.4 `frontend/src/shared/components/Badge/Badge.tsx`
**Lignes** : 336-382

```typescript
export interface OrderStatusBadgeProps {
  status: "en_attente" | "en_cours" | "payee" | "expediee" | "prete" | "livree" | "annulee";
}

const statusConfig = {
  en_attente: { variant: "warning", label: "En attente" },
  en_cours: { variant: "info", label: "En cours" },
  payee: { variant: "info", label: "Payée" },
  expediee: { variant: "purple", label: "Expédiée" },
  prete: { variant: "purple", label: "Prête" },
  livree: { variant: "success", label: "Livrée" },
  annulee: { variant: "danger", label: "Annulée" },
};
```

#### 2.5 `frontend/src/features/statistics/pages/StoreStatsPage.tsx`
**Lignes** : 450-486

```typescript
overview.commandes_payees
overview.commandes_en_attente
overview.commandes_annulees
```

### Impact
- **5 fichiers** avec logique de workflow
- Logique conditionnelle basée sur les statuts
- Statistiques et rapports dépendants

### Recommandation
✅ **Créer une table `statuts_commande`**

```sql
CREATE TABLE statuts_commande (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur VARCHAR(20), -- variant du badge (warning, info, success, danger, purple)
  ordre INTEGER NOT NULL,
  est_final BOOLEAN DEFAULT false, -- livree, annulee
  peut_modifier BOOLEAN DEFAULT true,
  peut_annuler BOOLEAN DEFAULT true,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Données initiales
INSERT INTO statuts_commande (code, nom, couleur, ordre, est_final, peut_modifier, peut_annuler) VALUES
  ('en_attente', 'En attente', 'warning', 1, false, true, true),
  ('en_cours', 'En cours', 'info', 2, false, true, true),
  ('payee', 'Payée', 'info', 3, false, true, true),
  ('expediee', 'Expédiée', 'purple', 4, false, false, true),
  ('prete', 'Prête', 'purple', 5, false, false, true),
  ('livree', 'Livrée', 'success', 6, true, false, false),
  ('annulee', 'Annulée', 'danger', 7, true, false, false);
```

**Transitions de statut** (optionnel mais recommandé) :

```sql
CREATE TABLE transitions_statut_commande (
  id SERIAL PRIMARY KEY,
  statut_depart_id INTEGER REFERENCES statuts_commande(id),
  statut_arrivee_id INTEGER REFERENCES statuts_commande(id),
  role_requis VARCHAR(50), -- admin, member, etc.
  UNIQUE(statut_depart_id, statut_arrivee_id)
);
```

---

## 3. Statuts de Paiement 💰

### Valeurs hardcodées
- `en_attente` (En attente)
- `valide` (Validé)
- `paye` (Payé)
- `partiel` (Partiel)
- `echoue` (Échoué)
- `rembourse` (Remboursé)
- `annule` (Annulé)

### Fichiers concernés

#### 3.1 `frontend/src/features/payments/components/tabs/PaymentsTab.tsx`
**Lignes** : 175-179

```typescript
<option value="">{t("tabs.allStatuses")}</option>
<option value="en_attente">{t("status.pending")}</option>
<option value="valide">{t("status.paid")}</option>
<option value="echoue">{t("status.failed")}</option>
<option value="rembourse">{t("status.refunded")}</option>
```

#### 3.2 `frontend/src/shared/components/Badge/Badge.tsx`
**Lignes** : 291-325

```typescript
export interface PaymentStatusBadgeProps {
  status: "en_attente" | "paye" | "valide" | "partiel" | "echoue" | "rembourse" | "annule";
}

const statusConfig = {
  en_attente: { variant: "warning", label: "En attente" },
  paye: { variant: "success", label: "Payé" },
  valide: { variant: "success", label: "Validé" },
  partiel: { variant: "info", label: "Partiel" },
  echoue: { variant: "danger", label: "Échoué" },
  rembourse: { variant: "purple", label: "Remboursé" },
  annule: { variant: "danger", label: "Annulé" },
};
```

#### 3.3 `frontend/src/features/statistics/components/FinanceStats.tsx`
**Lignes** : 23-32

```typescript
total_paiements_valides: number;
total_paiements_en_attente: number;
total_paiements_echoues: number;
```

### Impact
- **3 fichiers** impactés
- Statistiques financières dépendantes
- Filtres et rapports

### Recommandation
✅ **Créer une table `statuts_paiement`**

```sql
CREATE TABLE statuts_paiement (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur VARCHAR(20),
  ordre INTEGER NOT NULL,
  compte_dans_revenus BOOLEAN DEFAULT false, -- pour les stats
  est_final BOOLEAN DEFAULT false,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO statuts_paiement (code, nom, couleur, ordre, compte_dans_revenus, est_final) VALUES
  ('en_attente', 'En attente', 'warning', 1, false, false),
  ('paye', 'Payé', 'success', 2, true, true),
  ('valide', 'Validé', 'success', 3, true, true),
  ('partiel', 'Partiel', 'info', 4, false, false),
  ('echoue', 'Échoué', 'danger', 5, false, true),
  ('rembourse', 'Remboursé', 'purple', 6, false, true),
  ('annule', 'Annulé', 'danger', 7, false, true);
```

---

## 4. Statuts d'Échéance 📅

### Valeurs hardcodées
- `en_attente` (En attente)
- `paye` (Payé)
- `en_retard` (En retard)
- `annule` (Annulé)

### Fichiers concernés

#### 4.1 `frontend/src/features/payments/components/tabs/SchedulesTab.tsx`
**Lignes** : 119-122

```typescript
<option value="en_attente">{t("status.pending")}</option>
<option value="paye">{t("status.paid")}</option>
<option value="en_retard">{t("status.overdue")}</option>
<option value="annule">{t("status.cancelled")}</option>
```

#### 4.2 `frontend/src/shared/components/Badge/Badge.tsx`
**Lignes** : 565-585

```typescript
const statusConfigMap: Record<string, {...}> = {
  en_attente: { variant: "orange", label: "En attente" },
  paye: { variant: "success", label: "Payé" },
  en_retard: { variant: "danger", label: "En retard" },
  annule: { variant: "neutral", label: "Annulé" },
};
```

### Impact
- **2 fichiers**
- Gestion des retards et relances
- Badge avec animation pulse pour les retards

### Recommandation
✅ **Réutiliser ou étendre la table `statuts_paiement`**

ℹ️ Les échéances peuvent partager les mêmes statuts que les paiements, ou avoir leur propre table si des règles métier spécifiques sont nécessaires.

---

## 5. Rôles Utilisateurs 👥

### Valeurs hardcodées
- `admin` (Administrateur)
- `professor` (Professeur)
- `member` (Membre)
- `parent` (Parent)

### Fichiers concernés

#### 5.1 `frontend/src/features/users/components/UserRoleBadge.tsx`
**Lignes** : 33-47

```typescript
if (
  normalizedRole === UserRole.ADMIN ||
  normalizedRole === UserRole.PROFESSOR ||
  normalizedRole === UserRole.MEMBER ||
  normalizedRole === "parent"
) {
  return <Badge.Role role={normalizedRole as "admin" | "professor" | "member" | "parent"} />;
}
```

#### 5.2 `frontend/src/shared/components/Badge/Badge.tsx`
**Lignes** : 261-276

```typescript
export interface RoleBadgeProps {
  role: "admin" | "professor" | "member" | "parent";
}

const roleConfig = {
  admin: { variant: "danger", label: "Admin" },
  professor: { variant: "purple", label: "Professeur" },
  member: { variant: "success", label: "Membre" },
  parent: { variant: "info", label: "Parent" },
};
```

### Impact
- **2 fichiers**
- Authentification et autorisations
- Affichage des permissions

### Recommandation
✅ **Créer une table `roles`**

```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur VARCHAR(20),
  niveau_acces INTEGER NOT NULL, -- 1=membre, 2=parent, 3=professeur, 4=admin
  permissions JSONB, -- permissions spécifiques
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO roles (code, nom, couleur, niveau_acces) VALUES
  ('member', 'Membre', 'success', 1),
  ('parent', 'Parent', 'info', 2),
  ('professor', 'Professeur', 'purple', 3),
  ('admin', 'Administrateur', 'danger', 4);
```

---

## 6. Statuts Utilisateurs 👤

### Valeurs hardcodées
- Status ID `1` = `actif` (Actif)
- Status ID `2` = `inactif` (Inactif)
- Status ID `3` = `suspendu` (Suspendu)
- Status ID `4` = `en_attente` (En attente)
- Status ID `5` = `archive` (Archivé)

### Fichiers concernés

#### 6.1 `frontend/src/features/users/components/UserStatusBadge.tsx`
**Lignes** : 16-26

```typescript
const statusIdToStatus: Record<number, "actif" | "inactif" | "suspendu" | "en_attente" | "archive"> = {
  1: "actif",
  2: "inactif",
  3: "suspendu",
  4: "en_attente",
  5: "archive",
};
```

#### 6.2 `frontend/src/shared/components/Badge/Badge.tsx`
**Lignes** : 178-207

```typescript
export interface StatusBadgeProps {
  status: "actif" | "inactif" | "suspendu" | "en_attente" | "archive";
}

const statusConfig = {
  actif: { variant: "success", label: "Actif" },
  inactif: { variant: "neutral", label: "Inactif" },
  suspendu: { variant: "orange", label: "Suspendu" },
  en_attente: { variant: "warning", label: "En attente" },
  archive: { variant: "danger", label: "Archivé" },
};
```

### Impact
- **2 fichiers**
- Gestion du cycle de vie des utilisateurs
- Mapping entre ID et code statut

### Recommandation
✅ **Table `statuts_utilisateur` déjà existante (probablement)**

Si ce n'est pas le cas :

```sql
CREATE TABLE statuts_utilisateur (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur VARCHAR(20),
  peut_se_connecter BOOLEAN DEFAULT true,
  ordre INTEGER,
  actif BOOLEAN DEFAULT true
);

INSERT INTO statuts_utilisateur (id, code, nom, couleur, peut_se_connecter) VALUES
  (1, 'actif', 'Actif', 'success', true),
  (2, 'inactif', 'Inactif', 'neutral', false),
  (3, 'suspendu', 'Suspendu', 'orange', false),
  (4, 'en_attente', 'En attente', 'warning', false),
  (5, 'archive', 'Archivé', 'danger', false);
```

---

## 7. Rôles Familiaux 👨‍👩‍👧‍👦

### Valeurs hardcodées
- `enfant` (Enfant)
- `conjoint` (Conjoint)
- `autre` (Autre)

### Fichiers concernés

#### 7.1 `frontend/src/features/families/components/AddFamilyMemberModal.tsx`
**Lignes** : 26, 80, 230-234

```typescript
role: "enfant" | "conjoint" | "autre";

role: z.enum(["enfant", "conjoint", "autre"]),

<select id="role" {...register("role")}>
  <option value="enfant">{t("roles.enfant")}</option>
  <option value="conjoint">{t("roles.conjoint")}</option>
  <option value="autre">{t("roles.autre")}</option>
</select>
```

#### 7.2 `frontend/src/features/families/components/FamilyMemberCard.tsx`
**Lignes** : 31-45

```typescript
const ROLE_AVATAR_COLOR: Record<string, string> = {
  parent: "bg-green-500",
  tuteur: "bg-yellow-500",
  enfant: "bg-blue-500",
  conjoint: "bg-purple-500",
  autre: "bg-gray-400",
};

const ROLE_BADGE_STYLE: Record<string, string> = {
  parent: "bg-green-100 text-green-700",
  tuteur: "bg-yellow-100 text-yellow-700",
  enfant: "bg-blue-100 text-blue-700",
  conjoint: "bg-purple-100 text-purple-700",
  autre: "bg-gray-100 text-gray-600",
};
```

### Impact
- **2 fichiers**
- Gestion des liens familiaux
- Affichage visuel différencié

### Recommandation
✅ **Créer une table `roles_familiaux`**

```sql
CREATE TABLE roles_familiaux (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur_avatar VARCHAR(50), -- Tailwind class
  couleur_badge VARCHAR(50), -- Tailwind classes
  ordre INTEGER,
  actif BOOLEAN DEFAULT true
);

INSERT INTO roles_familiaux (code, nom, couleur_avatar, couleur_badge, ordre) VALUES
  ('parent', 'Parent', 'bg-green-500', 'bg-green-100 text-green-700', 1),
  ('tuteur', 'Tuteur légal', 'bg-yellow-500', 'bg-yellow-100 text-yellow-700', 2),
  ('conjoint', 'Conjoint', 'bg-purple-500', 'bg-purple-100 text-purple-700', 3),
  ('enfant', 'Enfant', 'bg-blue-500', 'bg-blue-100 text-blue-700', 4),
  ('autre', 'Autre', 'bg-gray-400', 'bg-gray-100 text-gray-600', 5);
```

---

## 8. Genres ⚧️

### Valeurs hardcodées
- ID `1` = Homme
- ID `2` = Femme
- ID `3` = Autre

### Fichiers concernés

#### 8.1 `frontend/src/features/families/components/AddFamilyMemberModal.tsx`
**Lignes** : 217-220

```typescript
<option value="1">{t("genres.homme")}</option>
<option value="2">{t("genres.femme")}</option>
<option value="3">{t("genres.autre")}</option>
```

### Impact
- **1 fichier**
- Formulaire d'ajout de membre familial

### Recommandation
✅ **Table `genres` déjà existante (probablement)**

Vérifier que la table existe et contient :

```sql
CREATE TABLE IF NOT EXISTS genres (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  nom VARCHAR(50) NOT NULL,
  ordre INTEGER
);

INSERT INTO genres (id, code, nom, ordre) VALUES
  (1, 'M', 'Homme', 1),
  (2, 'F', 'Femme', 2),
  (3, 'AUTRE', 'Autre', 3)
ON CONFLICT (id) DO NOTHING;
```

---

## 9. Types de Cours 🥋 **[HAUTE PRIORITÉ]**

### Valeurs hardcodées
- Texte libre pour `type_cours` (exemples : "Karaté", "Judo", "Taekwondo", etc.)

### Fichiers concernés

#### 9.1 `frontend/src/features/courses/components/modals/CreateEditCourseRecurrentModal.tsx`
**Lignes** : 56, 84, 93, 114, 137, 147, 208-214

```typescript
type_cours: ""

<Input
  label={t("fields.courseType")}
  id="type_cours"
  type="text"
  value={form.type_cours}
  onChange={(e) => setForm((f) => ({ ...f, type_cours: e.target.value }))}
/>
```

#### 9.2 `frontend/src/features/courses/components/modals/CreateSessionModal.tsx`
**Lignes** : 30, 41, 54, 64, 101-107

```typescript
type_cours: ""

<Input
  label={t("fields.courseType")}
  id="type_cours"
  type="text"
/>
```

#### 9.3 `frontend/src/features/courses/components/modals/AttendanceModal.tsx`
**Lignes** : 96

```typescript
{session.type_cours} — {formatDate(session.date_cours)}
```

#### 9.4 `frontend/src/features/courses/pages/CoursesPage.tsx`
**Lignes** : 138-140

```typescript
const uniqueTypes = [...new Set(sessions.map((s) => s.type_cours))].sort();
```

### Impact
- **4 fichiers** majeurs
- Incohérence des données (typos possibles)
- Pas de gestion centralisée
- Difficile de créer des statistiques fiables

### Recommandation
✅ **URGENT - Créer une table `types_cours`**

```sql
CREATE TABLE types_cours (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur VARCHAR(20), -- pour l'affichage
  duree_defaut_minutes INTEGER DEFAULT 60,
  capacite_max INTEGER,
  actif BOOLEAN DEFAULT true,
  ordre INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Exemples
INSERT INTO types_cours (code, nom, couleur, duree_defaut_minutes, ordre) VALUES
  ('karate', 'Karaté', 'blue', 60, 1),
  ('judo', 'Judo', 'green', 60, 2),
  ('taekwondo', 'Taekwondo', 'red', 60, 3),
  ('aikido', 'Aïkido', 'purple', 60, 4),
  ('kendo', 'Kendo', 'orange', 60, 5);

-- Migration
ALTER TABLE cours_recurrents ADD COLUMN type_cours_id INTEGER REFERENCES types_cours(id);
ALTER TABLE cours ADD COLUMN type_cours_id INTEGER REFERENCES types_cours(id);
```

**Migration des données existantes** :

```sql
-- Créer des types de cours à partir des valeurs existantes
INSERT INTO types_cours (code, nom, ordre)
SELECT DISTINCT 
  LOWER(REPLACE(type_cours, ' ', '_')),
  type_cours,
  ROW_NUMBER() OVER (ORDER BY type_cours)
FROM cours_recurrents
WHERE type_cours IS NOT NULL AND type_cours != '';

-- Lier les cours existants
UPDATE cours_recurrents cr
SET type_cours_id = tc.id
FROM types_cours tc
WHERE LOWER(REPLACE(cr.type_cours, ' ', '_')) = tc.code;
```

---

## 10. Jours de la Semaine 📆

### Valeurs hardcodées
- `jour_semaine` : INTEGER (1 = Lundi, 7 = Dimanche)

### Fichiers concernés

#### 10.1 `frontend/src/features/courses/components/modals/CreateEditCourseRecurrentModal.tsx`
**Lignes** : 220-225

```typescript
<Input.Select
  label={t("fields.dayOfWeek")}
  id="jour_semaine"
  value={form.jour_semaine}
/>
```

### Impact
- **1 fichier**
- Convention standard (ISO 8601)

### Recommandation
⚠️ **Table optionnelle**

Les jours de la semaine sont une convention standard. Cependant, pour l'internationalisation et la personnalisation (ex: semaine commençant le dimanche), on peut créer :

```sql
CREATE TABLE jours_semaine (
  id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 7),
  code VARCHAR(3) NOT NULL, -- MON, TUE, etc.
  nom_court VARCHAR(10) NOT NULL, -- Lun, Mar, etc.
  nom_complet VARCHAR(20) NOT NULL, -- Lundi, Mardi, etc.
  ordre_affichage INTEGER -- pour personnaliser l'ordre d'affichage
);

INSERT INTO jours_semaine (id, code, nom_court, nom_complet, ordre_affichage) VALUES
  (1, 'MON', 'Lun', 'Lundi', 1),
  (2, 'TUE', 'Mar', 'Mardi', 2),
  (3, 'WED', 'Mer', 'Mercredi', 3),
  (4, 'THU', 'Jeu', 'Jeudi', 4),
  (5, 'FRI', 'Ven', 'Vendredi', 5),
  (6, 'SAT', 'Sam', 'Samedi', 6),
  (7, 'SUN', 'Dim', 'Dimanche', 7);
```

**Priorité** : 🟢 BASSE (standard ISO)

---

## 11. Statuts de Présence ✅❌

### Valeurs hardcodées
- `status_id = 1` → Présent
- `status_id = null` → Absent

### Fichiers concernés

#### 11.1 `frontend/src/features/courses/components/modals/AttendanceModal.tsx`
**Lignes** : 30-33, 160-172

```typescript
const [presenceMap, setPresenceMap] = useState<Record<number, number | null>>({});

const togglePresence = (inscriptionId: number) => {
  setPresenceMap((prev) => ({
    ...prev,
    [inscriptionId]: prev[inscriptionId] === 1 ? null : 1,
  }));
};
```

### Impact
- **1 fichier**
- Logique binaire simple (présent/absent)
- Pas de gestion des retards, excusés, etc.

### Recommandation
✅ **Créer une table `statuts_presence`**

```sql
CREATE TABLE statuts_presence (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  couleur VARCHAR(20),
  compte_comme_present BOOLEAN DEFAULT false,
  ordre INTEGER,
  actif BOOLEAN DEFAULT true
);

INSERT INTO statuts_presence (id, code, nom, couleur, compte_comme_present, ordre) VALUES
  (1, 'present', 'Présent', 'success', true, 1),
  (2, 'absent', 'Absent', 'danger', false, 2),
  (3, 'retard', 'En retard', 'warning', true, 3),
  (4, 'excuse', 'Excusé', 'info', false, 4);
```

**Avantages** :
- Permet d'ajouter facilement des statuts (retard, excusé, etc.)
- Meilleure traçabilité
- Statistiques plus précises

---

## 12. Catégories d'Articles ✅ **[DÉJÀ EN DB]**

### État actuel
✅ **Déjà géré par la base de données**

### Fichiers
- `frontend/src/features/store/components/tabs/ConfigurationTab.tsx`
- Table : `categories_articles`

### Structure actuelle

```typescript
interface Category {
  id: number;
  nom: string;
  description?: string | null;
  ordre: number;
  nombre_articles?: number;
  nombre_articles_actifs?: number;
}
```

### Recommandation
✅ **Aucune action requise** - Déjà bien implémenté

---

## 13. Tailles d'Articles ✅ **[DÉJÀ EN DB]**

### État actuel
✅ **Déjà géré par la base de données**

### Fichiers
- `frontend/src/features/store/components/tabs/ConfigurationTab.tsx`
- Table : `tailles_articles`

### Structure actuelle

```typescript
interface Size {
  id: number;
  nom: string;
  ordre: number;
}
```

### Recommandation
✅ **Aucune action requise** - Déjà bien implémenté

---

## 14. Catégories de Templates ✅ **[DÉJÀ EN DB]**

### État actuel
✅ **Déjà géré par la base de données**

### Fichiers
- `frontend/src/features/messaging/components/TemplateTypeModal.tsx`
- `frontend/src/features/messaging/components/TemplateEditorModal.tsx`
- Table : `template_types`

### Structure actuelle

```typescript
interface TemplateType {
  id: number;
  nom: string;
  description?: string;
  actif: boolean;
}
```

### Recommandation
✅ **Aucune action requise** - Déjà bien implémenté

---

## 🎯 Plan d'Action Priorisé

### Phase 1 : Critique (Semaine 1-2) 🔴

1. **Types de cours**
   - Impact : Incohérence des données
   - Effort : Moyen
   - Migration des données existantes requise

2. **Statuts de commande**
   - Impact : Logique métier complexe
   - Effort : Élevé
   - Nombreux fichiers impactés

3. **Méthodes de paiement**
   - Impact : Finance et comptabilité
   - Effort : Faible
   - Migration simple

### Phase 2 : Important (Semaine 3-4) 🟠

4. **Statuts de paiement**
   - Impact : Statistiques financières
   - Effort : Moyen

5. **Rôles utilisateurs**
   - Impact : Authentification
   - Effort : Moyen (attention à la sécurité)

6. **Statuts d'échéance**
   - Impact : Relances automatiques
   - Effort : Faible

7. **Statuts de présence**
   - Impact : Extensibilité
   - Effort : Faible

### Phase 3 : Souhaitable (Semaine 5+) 🟡

8. **Statuts utilisateurs** (si pas déjà fait)
9. **Rôles familiaux**
10. **Genres** (vérifier l'existant)

### Phase 4 : Optionnel 🟢

11. **Jours de la semaine** (standard ISO)

---

## 📊 Architecture Backend Recommandée

### Structure des tables de référence

Toutes les tables de référence devraient suivre ce pattern :

```sql
CREATE TABLE reference_table_name (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,        -- Code technique (immuable)
  nom VARCHAR(100) NOT NULL,               -- Nom affiché (i18n)
  description TEXT,                         -- Description longue
  couleur VARCHAR(20),                      -- Variant pour badges
  ordre INTEGER,                            -- Ordre d'affichage
  actif BOOLEAN DEFAULT true,              -- Soft delete
  metadata JSONB,                          -- Données additionnelles
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_reference_code ON reference_table_name(code);
CREATE INDEX idx_reference_actif ON reference_table_name(actif);
```

### API Endpoints standardisés

```typescript
// GET /api/references/:type
// Retourne toutes les valeurs d'un type de référence
{
  "type": "methodes_paiement",
  "data": [
    {
      "id": 1,
      "code": "especes",
      "nom": "Espèces",
      "couleur": "success",
      "ordre": 1,
      "actif": true
    }
  ]
}

// GET /api/references (bulk)
// Retourne plusieurs types en une seule requête
{
  "methodes_paiement": [...],
  "statuts_commande": [...],
  "roles": [...]
}
```

### Frontend - Hook centralisé

```typescript
// hooks/useReferences.ts
export function useReferences() {
  return useQuery({
    queryKey: ['references'],
    queryFn: () => api.get('/api/references'),
    staleTime: 1000 * 60 * 60, // 1 heure
  });
}

// Usage
function MyComponent() {
  const { data: refs } = useReferences();
  
  return (
    <select>
      {refs.methodes_paiement.map(m => (
        <option key={m.code} value={m.code}>{m.nom}</option>
      ))}
    </select>
  );
}
```

---

## 🔄 Stratégie de Migration

### Étape 1 : Backend

1. Créer les tables de référence
2. Insérer les données par défaut
3. Créer les endpoints API
4. Tester avec Postman/Thunder Client

### Étape 2 : Frontend - Préparation

1. Créer le hook `useReferences`
2. Créer les types TypeScript
3. Documenter les changements

### Étape 3 : Migration progressive

Pour chaque catégorie :

1. **Backend** : Ajouter la table + endpoint
2. **Frontend** : Modifier 1 composant à la fois
3. **Test** : Vérifier le fonctionnement
4. **Refactor** : Nettoyer le code hardcodé
5. **Deploy** : Déployer progressivement

### Étape 4 : Cleanup

1. Supprimer les anciens types hardcodés
2. Mettre à jour la documentation
3. Former l'équipe

---

## 📝 Checklist de Migration

### Pour chaque valeur migrée :

- [ ] Table créée en DB avec structure standardisée
- [ ] Données par défaut insérées
- [ ] Endpoint API créé et testé
- [ ] Types TypeScript définis
- [ ] Hook React Query configuré
- [ ] Composants mis à jour
- [ ] Tests unitaires ajoutés
- [ ] Documentation mise à jour
- [ ] Migration des données existantes effectuée
- [ ] Code hardcodé supprimé
- [ ] UI testée en dev
- [ ] UI testée en staging
- [ ] Déployé en production

---

## 🎨 Exemples de Code

### Avant (Hardcodé)

```typescript
<select>
  <option value="especes">Espèces</option>
  <option value="virement">Virement</option>
  <option value="stripe">Carte bancaire</option>
</select>
```

### Après (Dynamique)

```typescript
function PaymentMethodSelect() {
  const { data: refs } = useReferences();
  
  return (
    <select>
      {refs?.methodes_paiement
        ?.filter(m => m.actif)
        .sort((a, b) => a.ordre - b.ordre)
        .map(method => (
          <option key={method.code} value={method.code}>
            {method.nom}
          </option>
        ))
      }
    </select>
  );
}
```

---

## 🚀 Bénéfices Attendus

### Court terme
- ✅ Flexibilité : Ajout/modification sans redéploiement
- ✅ Cohérence : Une source de vérité unique
- ✅ i18n : Support multilingue facilité

### Moyen terme
- ✅ Maintenance : Code plus propre et maintenable
- ✅ Tests : Plus facile à tester
- ✅ Performance : Cache optimisé

### Long terme
- ✅ Évolution : Ajout de nouvelles valeurs sans code
- ✅ Analytics : Statistiques plus précises
- ✅ Personnalisation : Configuration par client

---

## 📞 Support

Pour toute question sur cette migration, contactez l'équipe technique.

**Date du dernier audit** : Décembre 2024
**Prochaine révision prévue** : Après Phase 2

---

## 🔗 Références

- [Design System - Badge Component](../frontend/src/shared/components/Badge/Badge.tsx)
- [Architecture Decision Records](./architecture/)
- [API Documentation](./api/)

---

**Fin du rapport d'audit**