# 🎨 Guide de référence - Composants UI réutilisables

Guide rapide des composants disponibles dans `shared/components` avec exemples d'utilisation.

---

## 📑 Table des matières

- [Navigation](#navigation)
  - [TabGroup](#tabgroup)
- [Tables](#tables)
  - [DataTable](#datatable)
- [Formulaires](#formulaires)
  - [SearchBar](#searchbar)
  - [DateRangePicker](#daterangepicker)
  - [FormField](#formfield)
  - [SelectField](#selectfield)
- [Badges](#badges)
  - [StatusBadge](#statusbadge)
  - [Badge](#badge)
- [Feedback](#feedback)
  - [ErrorBanner](#errorbanner)
  - [AlertBanner](#alertbanner)
- [Layout](#layout)
  - [PageHeader](#pageheader)
- [Boutons](#boutons)
  - [Button](#button)
  - [IconButton](#iconbutton)

---

## Navigation

### TabGroup

**Localisation :** `shared/components/Navigation/TabGroup`  
**Usage :** Navigation par onglets avec badges optionnels

#### Import
```typescript
import { TabGroup } from "@/shared/components/Navigation/TabGroup";
import type { Tab } from "@/shared/components/Navigation/TabGroup";
```

#### Props principales
```typescript
interface TabGroupProps {
  tabs: Tab[];              // Liste des onglets
  activeTab: string;        // ID de l'onglet actif
  onTabChange: (id: string) => void;  // Callback changement
  scrollable?: boolean;     // Scroll horizontal sur mobile
}

interface Tab {
  id: string;               // ID unique
  label: string;            // Texte affiché
  icon?: ReactNode;         // Icône optionnelle
  badge?: number;           // Badge numérique
}
```

#### Exemple (utilisé dans PaymentsPage)
```tsx
const [activeTab, setActiveTab] = useState<"payments" | "schedules" | "plans">("payments");

const tabs: Tab[] = [
  { id: "payments", label: "Paiements" },
  { id: "schedules", label: "Échéances", badge: overdueSchedules.length },
  ...(isAdmin ? [{ id: "plans", label: "Plans tarifaires" }] : []),
];

<TabGroup 
  tabs={tabs} 
  activeTab={activeTab} 
  onTabChange={(id) => setActiveTab(id as TabId)} 
/>
```

#### Avantages
- ✅ Gestion automatique de l'état actif
- ✅ Badges intégrés
- ✅ Responsive avec scroll horizontal
- ✅ Accessibilité (role, aria-selected)

---

## Tables

### DataTable

**Localisation :** `shared/components/Table/DataTable`  
**Usage :** Tableau de données avec tri, pagination et rendu personnalisé

#### Import
```typescript
import { DataTable } from "@/shared/components/Table/DataTable";
import type { Column } from "@/shared/components/Table/DataTable";
```

#### Props principales
```typescript
interface DataTableProps<T> {
  columns: Column<T>[];     // Configuration des colonnes
  data: T[];                // Données à afficher
  rowKey: keyof T | ((row: T) => string | number);  // Clé unique
  onRowClick?: (row: T) => void;  // Click sur ligne
  loading?: boolean;        // État de chargement
  emptyMessage?: string;    // Message si vide
}

interface Column<T> {
  key: keyof T | string;    // Clé de la colonne
  label: string;            // Label du header
  render?: (value: any, row: T) => ReactNode;  // Rendu custom
  sortable?: boolean;       // Colonne triable
  className?: string;       // Classes CSS
}
```

#### Exemple simple
```tsx
const columns: Column<User>[] = [
  { key: "name", label: "Nom" },
  { key: "email", label: "Email" },
  { 
    key: "status", 
    label: "Statut",
    render: (value) => <StatusBadge status={value} />
  },
];

<DataTable columns={columns} data={users} rowKey="id" />
```

#### Exemple avancé (PaymentsPage)
```tsx
const paymentsColumns: Column<PaymentRow>[] = useMemo(() => [
  {
    key: "utilisateur_nom_complet",
    label: "Membre",
    render: (_, row) => (
      <div>
        <div className="text-sm font-medium text-gray-900">
          {row.utilisateur_nom_complet}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {row.utilisateur_email}
        </div>
      </div>
    ),
  },
  {
    key: "montant",
    label: "Montant",
    render: (value) => (
      <span className="text-sm font-semibold text-gray-900">
        {formatCurrency(value)}
      </span>
    ),
  },
  {
    key: "statut",
    label: "Statut",
    render: (value) => <PaymentStatusBadge statut={value} />,
  },
], []);

<DataTable
  columns={paymentsColumns}
  data={payments}
  rowKey="id"
  loading={isLoading}
  emptyMessage="Aucun paiement trouvé."
  onRowClick={(payment) => console.log(payment)}
/>
```

#### Avantages
- ✅ Configuration déclarative
- ✅ Tri automatique (à activer avec `sortable: true`)
- ✅ Skeleton loading intégré
- ✅ Rendu personnalisé par colonne
- ✅ Type-safe avec TypeScript
- ✅ Réutilisable partout

---

## Formulaires

### SearchBar

**Localisation :** `shared/components/Forms/SearchBar`  
**Usage :** Barre de recherche avec debounce optionnel et bouton clear

#### Import
```typescript
import { SearchBar } from "@/shared/components/Forms/SearchBar";
```

#### Props principales
```typescript
interface SearchBarProps {
  value: string;            // Valeur actuelle
  onChange: (value: string) => void;  // Callback changement
  placeholder?: string;     // Placeholder
  debounce?: number;        // Debounce en ms (0 = désactivé)
  size?: "sm" | "md" | "lg";  // Taille
  showClear?: boolean;      // Bouton clear (X)
  disabled?: boolean;       // Désactivé
  onEnter?: () => void;     // Callback sur Enter
}
```

#### Exemple (PaymentsPage)
```tsx
const [search, setSearch] = useState("");

<SearchBar
  value={search}
  onChange={setSearch}
  placeholder="Rechercher par nom de membre…"
  showClear
  size="md"
/>
```

#### Exemple avec debounce
```tsx
const [search, setSearch] = useState("");

<SearchBar
  value={search}
  onChange={setSearch}
  placeholder="Rechercher..."
  debounce={300}  // Attend 300ms avant d'appeler onChange
  onEnter={() => handleSearch()}
/>
```

#### Avantages
- ✅ Icône de recherche intégrée
- ✅ Bouton clear optionnel
- ✅ Debounce configurable
- ✅ 3 tailles disponibles
- ✅ Callback sur Enter

---

### DateRangePicker

**Localisation :** `shared/components/Forms/DateRangePicker`  
**Usage :** Sélecteur de plage de dates (début/fin)

#### Import
```typescript
import { DateRangePicker } from "@/shared/components/Forms/DateRangePicker";
import type { DateRange } from "@/shared/components/Forms/DateRangePicker";
```

#### Props principales
```typescript
interface DateRangePickerProps {
  value: DateRange;         // Plage sélectionnée
  onChange: (range: DateRange) => void;  // Callback changement
  label?: string;           // Label au-dessus
  showPresets?: boolean;    // Raccourcis prédéfinis
  minDate?: string;         // Date minimum (YYYY-MM-DD)
  maxDate?: string;         // Date maximum (YYYY-MM-DD)
  error?: string;           // Message d'erreur
  disabled?: boolean;       // Désactivé
}

interface DateRange {
  startDate: string | null;  // YYYY-MM-DD
  endDate: string | null;    // YYYY-MM-DD
}
```

#### Exemple (PaymentsPage)
```tsx
const [dateRange, setDateRange] = useState<DateRange>({
  startDate: null,
  endDate: null,
});

<DateRangePicker value={dateRange} onChange={setDateRange} />
```

#### Exemple avec presets
```tsx
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  label="Période"
  showPresets  // Active les raccourcis (7 derniers jours, ce mois, etc.)
/>
```

#### Avantages
- ✅ Validation automatique (endDate >= startDate)
- ✅ Raccourcis prédéfinis optionnels
- ✅ Limites min/max
- ✅ Gestion d'erreurs intégrée

---

### FormField

**Localisation :** `shared/components/Forms/FormField`  
**Usage :** Champ de formulaire avec label et gestion d'erreurs

#### Import
```typescript
import { FormField } from "@/shared/components/Forms/FormField";
```

#### Exemple
```tsx
<FormField
  label="Email"
  name="email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

---

### SelectField

**Localisation :** `shared/components/Forms/SelectField`  
**Usage :** Select avec label et styles cohérents

#### Import
```typescript
import { SelectField } from "@/shared/components/Forms/SelectField";
```

#### Exemple
```tsx
<SelectField
  label="Statut"
  name="status"
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  options={[
    { value: "active", label: "Actif" },
    { value: "inactive", label: "Inactif" },
  ]}
/>
```

---

## Badges

### StatusBadge

**Localisation :** `shared/components/Badge/StatusBadge`  
**Usage :** Badge de statut avec couleurs prédéfinies

#### Import
```typescript
import { StatusBadge } from "@/shared/components/Badge/StatusBadge";
```

#### Props
```typescript
interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "success" | "error" | "warning" | "archived";
  label?: string;           // Override label par défaut
  showDot?: boolean;        // Point coloré
  size?: "sm" | "md" | "lg";
}
```

#### Exemple
```tsx
<StatusBadge status="success" />  // Affiche "Payé" en vert
<StatusBadge status="pending" showDot />  // Avec point coloré
<StatusBadge status="error" label="Rejeté" />  // Label custom
```

---

### Badge

**Localisation :** `shared/components/Badge/Badge`  
**Usage :** Badge générique personnalisable

#### Import
```typescript
import { Badge } from "@/shared/components/Badge/Badge";
```

#### Exemple
```tsx
<Badge variant="success">Validé</Badge>
<Badge variant="warning" size="lg">Attention</Badge>
```

---

## Feedback

### ErrorBanner

**Localisation :** `shared/components/Feedback/ErrorBanner`  
**Usage :** Bannière d'erreur avec bouton dismiss

#### Import
```typescript
import { ErrorBanner } from "@/shared/components/Feedback/ErrorBanner";
```

#### Exemple
```tsx
{error && (
  <ErrorBanner
    title="Erreur de chargement"
    message={error}
    onDismiss={() => setError(null)}
  />
)}
```

---

### AlertBanner

**Localisation :** `shared/components/Feedback/AlertBanner`  
**Usage :** Bannière d'alerte (info, warning, success)

#### Import
```typescript
import { AlertBanner } from "@/shared/components/Feedback/AlertBanner";
```

#### Exemple
```tsx
<AlertBanner
  variant="warning"
  title="Attention"
  message="Action irréversible"
/>
```

---

## Layout

### PageHeader

**Localisation :** `shared/components/Layout/PageHeader`  
**Usage :** En-tête de page avec titre, description et actions

#### Import
```typescript
import { PageHeader } from "@/shared/components/Layout/PageHeader";
```

#### Exemple
```tsx
<PageHeader
  title="Paiements"
  description="Gestion des paiements et échéances"
  actions={
    <Button onClick={handleAdd}>Nouveau paiement</Button>
  }
/>
```

---

## Boutons

### Button

**Localisation :** `shared/components/Button/Button`  
**Usage :** Bouton avec variants et tailles

#### Import
```typescript
import { Button } from "@/shared/components/Button/Button";
```

#### Exemple
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Enregistrer
</Button>
```

---

## 📋 Checklist d'utilisation

Avant d'utiliser un composant :

1. ✅ Vérifier les exemples dans `*.examples.tsx`
2. ✅ Lire la documentation dans `*.md`
3. ✅ Importer les types nécessaires
4. ✅ Utiliser `useMemo` pour les configurations complexes
5. ✅ Tester l'accessibilité

---

## 🎯 Bonnes pratiques

### Configuration des colonnes DataTable

```tsx
// ✅ BON : useMemo pour éviter re-renders
const columns: Column<User>[] = useMemo(() => [
  { key: "name", label: "Nom" },
  // ...
], [dependencies]);

// ❌ MAUVAIS : recréé à chaque render
const columns: Column<User>[] = [
  { key: "name", label: "Nom" },
];
```

### Gestion des états de formulaires

```tsx
// ✅ BON : État unifié avec DateRangePicker
const [dateRange, setDateRange] = useState<DateRange>({
  startDate: null,
  endDate: null,
});

// ❌ MAUVAIS : États séparés
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
```

### Types TypeScript

```tsx
// ✅ BON : Types explicites
const tabs: Tab[] = [{ id: "tab1", label: "Tab 1" }];

// ❌ MAUVAIS : Types implicites
const tabs = [{ id: "tab1", label: "Tab 1" }];
```

---

## 🔗 Liens utiles

- **Tous les exemples** : `frontend/src/shared/components/*/*.examples.tsx`
- **Documentation** : `frontend/src/shared/components/*/*.md`
- **Design Tokens** : `frontend/src/shared/styles/designTokens.ts`

---

**Dernière mise à jour :** Décembre 2024