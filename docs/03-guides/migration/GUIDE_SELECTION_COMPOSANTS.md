# 🧭 GUIDE DE SÉLECTION DES COMPOSANTS

**Version:** 1.0  
**Date:** 2024  
**Public:** Développeurs Frontend

---

## 📖 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Règle d'Or](#règle-dor)
3. [Arbres de Décision](#arbres-de-décision)
4. [Guide par Composant](#guide-par-composant)
5. [Exemples Pratiques](#exemples-pratiques)
6. [Anti-Patterns](#anti-patterns)
7. [FAQ](#faq)

---

## 🎯 INTRODUCTION

Ce guide vous aide à choisir le **bon composant** pour chaque besoin dans ClubManager V3.

### Objectifs

- ✅ Éviter la duplication de code
- ✅ Garantir la cohérence visuelle
- ✅ Maintenir l'accessibilité
- ✅ Faciliter la maintenance

### Principe de Base

**Toujours utiliser les composants shared en priorité !**

```
📦 frontend/src/shared/components/  ← Chercher ICI en premier
❌ Réimplémenter soi-même            ← Éviter à tout prix
```

---

## 🏆 RÈGLE D'OR

### Avant de créer un composant custom, demandez-vous :

1. ❓ **Ce composant existe-t-il déjà ?**
   - ✅ Oui → Utiliser le composant shared
   - ❓ Pas sûr → Chercher dans `shared/components/`
   - ❌ Non → Continuer à l'étape 2

2. ❓ **Un composant shared peut-il être étendu ?**
   - ✅ Oui → Ajouter des props/variants au composant existant
   - ❌ Non → Continuer à l'étape 3

3. ❓ **Ce composant sera-t-il réutilisé ailleurs ?**
   - ✅ Oui → Créer dans `shared/components/`
   - ❌ Non → Créer localement dans votre feature

### Checklist avant de coder

```
[ ] J'ai cherché dans shared/components/
[ ] J'ai vérifié qu'aucun composant similaire n'existe
[ ] J'ai évalué si étendre un composant existant est possible
[ ] Si je crée un nouveau composant shared, j'ai documenté son usage
```

---

## 🌳 ARBRES DE DÉCISION

### J'ai besoin d'un... BOUTON

```
Besoin d'un bouton ?
│
├─ Icône seule (sans texte) ?
│  └─ ✅ <IconButton />
│
├─ Bouton de formulaire (type="submit") ?
│  └─ ✅ <SubmitButton />
│
└─ Bouton standard avec texte ?
   └─ ✅ <Button />
```

**Exemples** :
```tsx
// ✅ Action principale
<Button variant="primary" size="md">Enregistrer</Button>

// ✅ Action avec icône
<Button variant="primary" icon={<SaveIcon />} iconPosition="left">
  Enregistrer
</Button>

// ✅ Action secondaire
<Button variant="ghost" onClick={handleCancel}>Annuler</Button>

// ✅ Icône seule
<IconButton icon={<PencilIcon />} ariaLabel="Modifier" variant="ghost" />

// ✅ Bouton de formulaire
<SubmitButton isLoading={isSaving} loadingText="Enregistrement...">
  Enregistrer
</SubmitButton>
```

---

### J'ai besoin d'un... INPUT / CHAMP DE FORMULAIRE

```
Besoin d'un champ de saisie ?
│
├─ Mot de passe avec indicateur de force ?
│  └─ ✅ <PasswordInput />
│
├─ Recherche avec debounce ?
│  └─ ✅ <SearchBar />
│
├─ Liste déroulante ?
│  └─ ✅ <SelectField />
│
├─ Plage de dates ?
│  └─ ✅ <DateRangePicker />
│
├─ Champ avec label + validation ?
│  ├─ Wrapper uniquement → ✅ <FormField><Input /></FormField>
│  └─ Tout-en-un → ✅ <Input label="..." error="..." />
│
└─ Input simple ?
   └─ ✅ <Input />
```

**Exemples** :
```tsx
// ✅ Input standard avec label
<Input
  type="text"
  label="Nom"
  placeholder="Entrez le nom"
  error={errors.nom}
  required
/>

// ✅ Recherche avec debounce
<SearchBar
  value={search}
  onChange={setSearch}
  placeholder="Rechercher un membre..."
  debounce={300}
/>

// ✅ Select avec options
<SelectField
  label="Statut"
  options={[
    { value: "active", label: "Actif" },
    { value: "inactive", label: "Inactif" },
  ]}
  value={status}
  onChange={setStatus}
/>

// ✅ Mot de passe avec force
<PasswordInput
  value={password}
  onChange={setPassword}
  showStrengthIndicator
/>

// ✅ Plage de dates
<DateRangePicker
  startDate={startDate}
  endDate={endDate}
  onChange={handleDateChange}
  showPresets
/>
```

---

### J'ai besoin d'un... BADGE / ÉTIQUETTE

```
Besoin d'un badge ?
│
├─ Statut prédéfini (active, inactive, pending...) ?
│  └─ ✅ <Badge.Status status="active" />
│
├─ Stock avec seuil ?
│  └─ ✅ <Badge.Stock quantity={10} threshold={5} />
│
├─ Rôle utilisateur ?
│  └─ ✅ <Badge.Role role="admin" />
│
├─ Statut de paiement ?
│  └─ ✅ <Badge.PaymentStatus status="paid" />
│
├─ Statut de commande ?
│  └─ ✅ <Badge.OrderStatus status="confirmed" />
│
└─ Badge custom ?
   └─ ✅ <Badge variant="success">Texte</Badge>
```

**⚠️ NE PAS UTILISER** : `StatusBadge.tsx` (déprécié, utiliser `Badge.Status`)

**Exemples** :
```tsx
// ✅ Statut actif/inactif
<Badge.Status status="active" showDot />

// ✅ Badge custom coloré
<Badge variant="success" size="md" dot>
  Nouveau
</Badge>

// ✅ Badge avec icône
<Badge variant="info" icon={<CheckIcon />}>
  Vérifié
</Badge>

// ✅ Stock faible
<Badge.Stock quantity={3} threshold={10} />
```

---

### J'ai besoin d'une... MODAL / DIALOGUE

```
Besoin d'une modale ?
│
├─ Confirmation simple (Oui/Non) ?
│  └─ ✅ <ConfirmDialog />
│
└─ Contenu custom (formulaire, détails...) ?
   └─ ✅ <Modal>
         <Modal.Header />
         <Modal.Body />
         <Modal.Footer />
       </Modal>
```

**❌ NE JAMAIS FAIRE** :
```tsx
// ❌ Backdrop custom
<div className="fixed inset-0 bg-black/50 z-50">
  <div className="bg-white rounded-lg">...</div>
</div>
```

**✅ FAIRE** :
```tsx
// ✅ Modale simple
<Modal open={isOpen} onClose={handleClose} size="lg">
  <Modal.Header title="Modifier l'utilisateur" />
  <Modal.Body>
    <form>...</form>
  </Modal.Body>
  <Modal.Footer align="right">
    <Button variant="ghost" onClick={handleClose}>Annuler</Button>
    <Button variant="primary" onClick={handleSave}>Enregistrer</Button>
  </Modal.Footer>
</Modal>

// ✅ Dialogue de confirmation
<ConfirmDialog
  open={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Supprimer l'utilisateur"
  message="Cette action est irréversible."
  variant="danger"
  isLoading={isDeleting}
/>
```

---

### J'ai besoin d'une... CARTE / CARD

```
Besoin d'une carte ?
│
├─ Statistique (label + valeur + variation) ?
│  └─ ✅ <StatCard />
│
└─ Conteneur générique ?
   └─ ✅ <Card>
         <Card.Header />
         <Card.Body />
         <Card.Footer />
       </Card>
```

**Exemples** :
```tsx
// ✅ Carte statistique
<StatCard
  label="Total Membres"
  value={150}
  change="+12%"
  trend="up"
  icon={UsersIcon}
/>

// ✅ Carte avec header/body/footer
<Card variant="standard" shadow="md" hover>
  <Card.Header>
    <h3 className="text-lg font-semibold">Titre</h3>
  </Card.Header>
  <Card.Body>
    Contenu de la carte...
  </Card.Body>
  <Card.Footer gray>
    <Button variant="outline">Action</Button>
  </Card.Footer>
</Card>

// ✅ Carte compacte sans padding
<Card variant="compact" noBorder>
  Contenu minimal
</Card>
```

---

### J'ai besoin d'une... TABLE

```
Besoin d'une table ?
│
├─ Liste de données avec tri/filtre ?
│  └─ ✅ <DataTable />
│
└─ Table HTML simple (rare) ?
   └─ ⚠️ Évaluer si DataTable convient
```

**❌ NE JAMAIS FAIRE** :
```tsx
// ❌ Table HTML custom
<table className="min-w-full divide-y divide-gray-100">
  <thead>
    <tr className="bg-gray-50">
      <th className="px-4 py-3 text-left...">Nom</th>
    </tr>
  </thead>
  <tbody>
    {data.map(row => <tr>...</tr>)}
  </tbody>
</table>
```

**✅ FAIRE** :
```tsx
// ✅ DataTable avec colonnes définies
const columns: Column<User>[] = [
  {
    key: "nom",
    label: "Nom",
    sortable: true,
    render: (user) => (
      <div className="font-medium">{user.nom}</div>
    ),
  },
  {
    key: "email",
    label: "Email",
    render: (user) => user.email,
  },
];

<DataTable
  columns={columns}
  data={users}
  sortable
  loading={isLoading}
  onRowClick={handleRowClick}
/>
```

---

### J'ai besoin d'... EN-TÊTE DE PAGE

```
Besoin d'un en-tête ?
│
├─ En-tête de page (H1 + description + actions) ?
│  └─ ✅ <PageHeader />
│
└─ En-tête de section (H2/H3) ?
   └─ ✅ <SectionHeader />
```

**❌ NE JAMAIS FAIRE** :
```tsx
// ❌ HTML custom
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Titre</h1>
    <p className="text-sm text-gray-500">Description</p>
  </div>
  <button>Action</button>
</div>
```

**✅ FAIRE** :
```tsx
// ✅ PageHeader
<PageHeader
  icon={<UsersIcon className="h-8 w-8 text-blue-600" />}
  title="Gestion des utilisateurs"
  description="Administration des comptes membres du club"
  actions={
    <Button variant="primary" icon={<PlusIcon />}>
      Ajouter un utilisateur
    </Button>
  }
/>

// ✅ SectionHeader
<SectionHeader
  level={2}
  title="Informations générales"
  description="Coordonnées et détails du club"
  actions={<Button variant="outline">Modifier</Button>}
  divider
/>
```

---

### J'ai besoin de... NAVIGATION PAR ONGLETS

```
Besoin d'onglets ?
│
└─ ✅ <TabGroup />
   ├─ variant="default" (simple)
   └─ variant="highlight" (avec background)
```

**Exemples** :
```tsx
// ✅ Onglets simples
const tabs = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "details", label: "Détails" },
  { id: "history", label: "Historique", badge: "12" },
];

<TabGroup
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// ✅ Onglets avec scrolling
<TabGroup
  tabs={manyTabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="highlight"
  scrollable
/>
```

---

### J'ai besoin de... FEEDBACK UTILISATEUR

```
Besoin de feedback ?
│
├─ Chargement en cours ?
│  └─ ✅ <LoadingSpinner />
│
├─ État vide (pas de données) ?
│  └─ ✅ <EmptyState />
│
└─ Message d'alerte/erreur/succès ?
   └─ ✅ <AlertBanner />
```

**⚠️ NE PAS UTILISER** : `ErrorBanner.tsx` (utiliser `AlertBanner` à la place)

**Exemples** :
```tsx
// ✅ Chargement
<LoadingSpinner size="lg" text="Chargement des données..." />

// ✅ État vide
<EmptyState
  icon={<UsersIcon />}
  title="Aucun utilisateur"
  description="Commencez par ajouter votre premier utilisateur."
  action={
    <Button variant="primary" icon={<PlusIcon />}>
      Ajouter un utilisateur
    </Button>
  }
/>

// ✅ Message de succès
<AlertBanner
  variant="success"
  title="Enregistrement réussi"
  message="L'utilisateur a été créé avec succès."
  dismissible
  onDismiss={() => setShowSuccess(false)}
/>

// ✅ Message d'erreur
<AlertBanner
  variant="danger"
  title="Erreur"
  message="Impossible de charger les données."
/>
```

---

## 📚 GUIDE PAR COMPOSANT

### Composants TOUJOURS Utilisables

| Composant | Quand l'utiliser | Éviter si... |
|-----------|------------------|--------------|
| **Button** | Toute action cliquable | Icône seule (utiliser IconButton) |
| **IconButton** | Action avec icône seule | Besoin de texte visible |
| **Input** | Tout champ de saisie | Type spécialisé existe (mot de passe, recherche) |
| **Badge** | Étiquettes, statuts | Besoin d'interactivité (utiliser Button) |
| **Card** | Regrouper du contenu | Pas de bordure nécessaire |
| **PageHeader** | En-tête de page | En-tête de section (utiliser SectionHeader) |
| **TabGroup** | Navigation entre vues | Moins de 2 onglets |
| **Modal** | Contenu par-dessus la page | Tooltip/dropdown (autres composants) |
| **LoadingSpinner** | Chargement asynchrone | Chargement inline (utiliser `loading` sur Button) |
| **EmptyState** | Listes/tables vides | Erreur (utiliser AlertBanner) |
| **AlertBanner** | Messages utilisateur | Validation inline (utiliser error sur Input) |
| **DataTable** | Tableaux de données | Moins de 3 colonnes (évaluer layout alternatif) |

---

### Composants DÉPRÉCIÉS (Ne pas utiliser)

| Composant | Raison | Alternative |
|-----------|--------|-------------|
| ❌ **StatusBadge.tsx** | Doublon | ✅ `Badge.Status` |
| ❌ **ErrorBanner.tsx** | Doublon | ✅ `AlertBanner` |
| ❌ **FormInput.tsx** | Doublon | ✅ `FormField + Input` ou `Input` avec label |

---

## 💼 EXEMPLES PRATIQUES

### Cas d'Usage 1 : Créer une page de liste

```tsx
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { SearchBar } from "@/shared/components/forms/SearchBar";
import { DataTable } from "@/shared/components/table/DataTable";
import { Button } from "@/shared/components/buttons/Button";
import { LoadingSpinner } from "@/shared/components/layout/LoadingSpinner";
import { EmptyState } from "@/shared/components/layout/EmptyState";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useUsers();

  const columns = [
    { key: "nom", label: "Nom", sortable: true },
    { key: "email", label: "Email" },
  ];

  return (
    <div className="space-y-6">
      {/* ✅ En-tête avec PageHeader */}
      <PageHeader
        title="Utilisateurs"
        description="Gestion des membres du club"
        actions={
          <Button variant="primary" icon={<PlusIcon />}>
            Ajouter
          </Button>
        }
      />

      {/* ✅ Barre de recherche */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Rechercher..."
      />

      {/* ✅ Table avec états loading/empty */}
      {isLoading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState
          title="Aucun utilisateur"
          action={<Button>Ajouter le premier</Button>}
        />
      ) : (
        <DataTable columns={columns} data={users} />
      )}
    </div>
  );
}
```

---

### Cas d'Usage 2 : Formulaire avec modal

```tsx
import { Modal } from "@/shared/components/modals/Modal";
import { Input } from "@/shared/components/forms/Input";
import { Button } from "@/shared/components/buttons/Button";
import { AlertBanner } from "@/shared/components/feedback/AlertBanner";

export function UserFormModal({ open, onClose }) {
  const [error, setError] = useState(null);

  return (
    <Modal open={open} onClose={onClose} size="lg">
      {/* ✅ Header */}
      <Modal.Header
        title="Créer un utilisateur"
        subtitle="Remplissez les informations ci-dessous"
      />

      {/* ✅ Body */}
      <Modal.Body>
        {error && (
          <AlertBanner variant="danger" message={error} dismissible />
        )}

        <div className="space-y-4">
          <Input
            label="Nom"
            type="text"
            required
            error={errors.nom}
          />
          <Input
            label="Email"
            type="email"
            required
            error={errors.email}
          />
        </div>
      </Modal.Body>

      {/* ✅ Footer */}
      <Modal.Footer align="right">
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Enregistrer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

---

### Cas d'Usage 3 : Page avec onglets

```tsx
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { TabGroup } from "@/shared/components/navigation/TabGroup";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "Général", icon: <CogIcon /> },
    { id: "security", label: "Sécurité", icon: <LockIcon /> },
    { id: "notifications", label: "Notifications", badge: "3" },
  ];

  return (
    <div className="space-y-6">
      {/* ✅ En-tête */}
      <PageHeader
        title="Paramètres"
        description="Configuration de l'application"
      />

      {/* ✅ Navigation par onglets */}
      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="highlight"
      />

      {/* ✅ Contenu conditionnel */}
      {activeTab === "general" && <GeneralSettings />}
      {activeTab === "security" && <SecuritySettings />}
      {activeTab === "notifications" && <NotificationSettings />}
    </div>
  );
}
```

---

## 🚫 ANTI-PATTERNS

### ❌ Anti-Pattern 1 : Réinventer la roue

```tsx
// ❌ NE PAS FAIRE
function MyCustomModal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6">
        {children}
      </div>
    </div>
  );
}

// ✅ FAIRE
import { Modal } from "@/shared/components/modals/Modal";
```

---

### ❌ Anti-Pattern 2 : Classes Tailwind en dur

```tsx
// ❌ NE PAS FAIRE
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Cliquer
</button>

// ✅ FAIRE
<Button variant="primary" size="md">
  Cliquer
</Button>
```

---

### ❌ Anti-Pattern 3 : Icônes SVG inline

```tsx
// ❌ NE PAS FAIRE
const PencilIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24">
    <path d="M15.232..." />
  </svg>
);

// ✅ FAIRE
import { PencilIcon } from "@patternfly/react-icons";
```

---

### ❌ Anti-Pattern 4 : Dupliquer les statuts

```tsx
// ❌ NE PAS FAIRE
function getStatusColor(status) {
  switch (status) {
    case "active": return "bg-green-100 text-green-700";
    case "inactive": return "bg-gray-100 text-gray-700";
    // ...
  }
}
<span className={getStatusColor(status)}>{status}</span>

// ✅ FAIRE
<Badge.Status status={status} />
```

---

### ❌ Anti-Pattern 5 : En-têtes custom

```tsx
// ❌ NE PAS FAIRE
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold">Titre</h1>
    <p className="text-sm text-gray-500">Description</p>
  </div>
  <button>Action</button>
</div>

// ✅ FAIRE
<PageHeader
  title="Titre"
  description="Description"
  actions={<Button>Action</Button>}
/>
```

---

## ❓ FAQ

### Q: Quel composant utiliser pour un bouton avec juste une icône ?

**R:** Utilisez `IconButton`, pas `Button` avec `iconOnly`.

```tsx
// ✅ FAIRE
<IconButton
  icon={<PencilIcon />}
  ariaLabel="Modifier"
  variant="ghost"
  tooltip="Modifier l'utilisateur"
/>
```

---

### Q: Quand utiliser Badge vs StatusBadge ?

**R:** Utilisez toujours `Badge` ou ses sous-composants (`Badge.Status`, `Badge.Role`, etc.). `StatusBadge.tsx` est déprécié.

```tsx
// ✅ FAIRE
<Badge.Status status="active" />
<Badge variant="success">Nouveau</Badge>

// ❌ NE PAS FAIRE
<StatusBadge status="active" />
```

---

### Q: AlertBanner vs ErrorBanner ?

**R:** Utilisez `AlertBanner` pour tous les messages. `ErrorBanner` est déprécié.

```tsx
// ✅ FAIRE
<AlertBanner variant="danger" message="Erreur" />
<AlertBanner variant="success" message="Succès" />

// ❌ NE PAS FAIRE
<ErrorBanner variant="error" message="Erreur" />
```

---

### Q: Puis-je créer un composant local dans ma feature ?

**R:** Oui, si :
- ✅ Il est vraiment spécifique à votre feature
- ✅ Il ne sera pas réutilisé ailleurs
- ✅ Aucun composant shared ne convient

Si vous pensez qu'il pourrait être réutilisé, créez-le dans `shared/components/`.

---

### Q: Comment savoir si un composant shared existe ?

**R:** Checklist :
1. Chercher dans `frontend/src/shared/components/`
2. Regarder ce guide (section "Guide par Composant")
3. Demander à l'équipe sur Slack
4. Consulter le rapport d'audit

---

### Q: J'ai besoin d'un variant qui n'existe pas. Que faire ?

**R:** 
1. Vérifier si un variant existant peut convenir
2. Si non, **étendre le composant existant** en ajoutant le variant
3. Ne **jamais** créer un nouveau composant qui fait la même chose

```tsx
// ✅ FAIRE - Ajouter un variant au composant existant
// Dans Button.tsx
export type ButtonVariant = 
  | "primary" 
  | "secondary" 
  | "outline" 
  | "danger"
  | "custom"; // ← Nouveau variant

// ❌ NE PAS FAIRE - Créer un nouveau composant
// MyCustomButton.tsx
```

---

### Q: Puis-je utiliser des classes Tailwind directement ?

**R:** Oui, mais **uniquement pour le layout/spacing** de votre page :

```tsx
// ✅ OK - Layout de page
<div className="space-y-6">
  <div className="grid grid-cols-3 gap-4">
    <Button>...</Button>
  </div>
</div>

// ❌ PAS OK - Styles de composants
<button className="px-4 py-2 bg-blue-600 text-white rounded">
  Cliquer
</button>
```

---

### Q: Comment gérer la pagination ?

**R:** `DataTable` inclut la pagination. Ne créez **jamais** de composant `PaginationBar` custom.

```tsx
// ✅ FAIRE
<DataTable columns={columns} data={data} />
// La pagination est automatique
```

---

### Q: Mon modal a une structure complexe. Puis-je créer un modal custom ?

**R:** Non, utilisez `Modal` avec `Modal.Body` customisé :

```tsx
// ✅ FAIRE
<Modal open={open} onClose={onClose}>
  <Modal.Header title="Titre complexe" />
  <Modal.Body>
    {/* Toute la complexité ici */}
    <ComplexForm />
  </Modal.Body>
  <Modal.Footer>
    <Actions />
  </Modal.Footer>
</Modal>
```

---

## 📞 BESOIN D'AIDE ?

**Questions sur un composant ?**  
→ Consultez `shared/components/[composant]/README.md` (si existant)

**Composant manquant ?**  
→ Créez une issue GitHub avec label `component-request`

**Confusion sur quel composant utiliser ?**  
→ Demandez sur Slack #frontend

**Bug dans un composant shared ?**  
→ Créez une issue GitHub avec label `bug`

---

**Dernière mise à jour** : 2024  
**Contributeurs** : Équipe Frontend

**Rapports liés** :
- [Audit Cohérence Styles & Composants](AUDIT_COHERENCE_STYLES_COMPOSANTS.md)
- [Migration Guide TabGroup & Modal](../MIGRATION_GUIDE_TABGROUP_MODAL.md)