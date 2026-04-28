# DateRangePicker

Composant réutilisable pour sélectionner une plage de dates (date de début et date de fin) avec validation automatique et raccourcis prédéfinis.

## 📋 Vue d'ensemble

`DateRangePicker` utilise des inputs HTML natifs `<input type="date">` et les **design tokens FORM** pour garantir une cohérence visuelle avec tous les autres composants de formulaire de l'application.

### Caractéristiques principales

- ✅ Utilisation des **tokens FORM, INPUT, BUTTON**
- ✅ Validation automatique (date de fin ≥ date de début)
- ✅ Raccourcis prédéfinis (aujourd'hui, 7 derniers jours, etc.)
- ✅ Limites min/max configurables
- ✅ Messages d'erreur et d'aide
- ✅ Support du mode désactivé
- ✅ Accessible (ARIA labels et attributes)

---

## 🎨 Tokens FORM utilisés

Le composant utilise exclusivement les tokens de `designTokens.ts` pour maintenir la cohérence :

### Structure du composant

```tsx
<div className={FORM.field}>           {/* Container principal */}
  <label className={FORM.label}>       {/* Label principal */}
    Période
  </label>
  
  <div className={FORM.dateWrapper}>   {/* Container des inputs */}
    <input 
      className={cn(INPUT.base, FORM.dateInput, INPUT.error)}
    />
    
    <span className={FORM.dateSeparator}> {/* Séparateur → */}
      →
    </span>
    
    <input 
      className={cn(INPUT.base, FORM.dateInput)}
    />
  </div>
  
  <p className={FORM.errorText}>       {/* Message d'erreur */}
    Erreur...
  </p>
  
  <p className={FORM.helpText}>        {/* Message d'aide */}
    Texte d'aide
  </p>
</div>
```

### Tokens détaillés

| Token | Description | Valeur CSS |
|-------|-------------|------------|
| `FORM.field` | Container du champ | `space-y-2` |
| `FORM.label` | Label principal | `block text-sm font-medium text-gray-700` |
| `FORM.dateWrapper` | Container des inputs de date | `flex items-center gap-2` |
| `FORM.dateInput` | Input de date | `flex-1` |
| `FORM.dateSeparator` | Séparateur entre dates | `text-gray-400` |
| `FORM.errorText` | Message d'erreur | `text-xs text-red-600 mt-1 flex items-center gap-1` |
| `FORM.helpText` | Message d'aide | `text-xs text-gray-500 mt-1` |
| `INPUT.base` | Style de base input | `block w-full px-3 py-2.5 border...` |
| `INPUT.error` | État erreur input | `border-red-300 focus:ring-red-500...` |
| `INPUT.disabled` | État désactivé input | `bg-gray-50 text-gray-500 cursor-not-allowed` |
| `BUTTON.base` | Base des boutons preset | `inline-flex items-center...` |
| `BUTTON.variant.secondary` | Style des presets | `text-gray-700 bg-gray-100...` |
| `BUTTON.size.xs` | Taille des presets | `px-2.5 py-1.5 text-xs` |

---

## 📝 Props

### Interface `DateRangePickerProps`

```typescript
interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
  showPresets?: boolean;
  minDate?: string;
  maxDate?: string;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
}
```

### Interface `DateRange`

```typescript
interface DateRange {
  startDate: string | null;  // Format ISO: YYYY-MM-DD
  endDate: string | null;    // Format ISO: YYYY-MM-DD
}
```

### Détails des props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `value` | `DateRange` | **Requis** | Plage de dates sélectionnée |
| `onChange` | `(range: DateRange) => void` | **Requis** | Callback lors du changement |
| `label` | `string` | `undefined` | Label affiché au-dessus |
| `showPresets` | `boolean` | `false` | Afficher les boutons de raccourcis |
| `minDate` | `string` | `undefined` | Date minimum (YYYY-MM-DD) |
| `maxDate` | `string` | `undefined` | Date maximum (YYYY-MM-DD) |
| `error` | `string` | `undefined` | Message d'erreur |
| `helpText` | `string` | `undefined` | Message d'aide |
| `disabled` | `boolean` | `false` | Désactiver le composant |
| `className` | `string` | `""` | Classes CSS additionnelles |

---

## 🚀 Exemples d'utilisation

### 1. Usage basique

```tsx
import { useState } from 'react';
import { DateRangePicker, DateRange } from '@/shared/components/Forms';

function MyComponent() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  return (
    <DateRangePicker
      value={dateRange}
      onChange={setDateRange}
      label="Période"
    />
  );
}
```

### 2. Avec raccourcis prédéfinis

```tsx
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  label="Sélectionner une période"
  showPresets
/>
```

**Presets disponibles :**
- Aujourd'hui
- 7 derniers jours
- 30 derniers jours
- Ce mois
- Mois dernier
- Cette année
- Effacer

### 3. Avec validation et limites

```tsx
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  label="Période (limitée à 2024)"
  minDate="2024-01-01"
  maxDate="2024-12-31"
  error={validationError}
/>
```

### 4. Avec message d'aide

```tsx
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  label="Période de paiement"
  helpText="Sélectionnez une période pour filtrer les paiements"
  showPresets
/>
```

### 5. Avec validation personnalisée

```tsx
function ReportForm() {
  const [reportRange, setReportRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [error, setError] = useState('');

  const handleRangeChange = (range: DateRange) => {
    setReportRange(range);
    
    if (range.startDate && range.endDate) {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
      
      if (diffDays > 365) {
        setError('La période ne peut pas dépasser 365 jours');
      } else {
        setError('');
      }
    } else {
      setError('');
    }
  };

  return (
    <DateRangePicker
      value={reportRange}
      onChange={handleRangeChange}
      label="Période du rapport"
      showPresets
      error={error}
    />
  );
}
```

### 6. Dans un formulaire de filtrage

```tsx
function PaymentFilters() {
  const [filters, setFilters] = useState({
    dateRange: { startDate: null, endDate: null } as DateRange,
    status: 'all',
  });

  const handleFilter = () => {
    // Appliquer les filtres
    console.log('Filtres:', filters);
  };

  return (
    <div className="flex flex-col gap-4">
      <DateRangePicker
        value={filters.dateRange}
        onChange={(range) => setFilters({ ...filters, dateRange: range })}
        label="Période de paiement"
        showPresets
      />
      
      <Button 
        onClick={handleFilter}
        disabled={!filters.dateRange.startDate || !filters.dateRange.endDate}
      >
        Filtrer
      </Button>
    </div>
  );
}
```

### 7. Mode lecture seule (disabled)

```tsx
<DateRangePicker
  value={{
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  }}
  onChange={() => {}}
  label="Année fiscale"
  disabled
/>
```

---

## ✅ Bonnes pratiques

### 1. Utiliser les tokens FORM

❌ **À éviter :**
```tsx
<div className="space-y-3">
  <label className="block text-sm font-medium text-gray-700">
    Période
  </label>
  <div className="flex gap-2">
    <input className="flex-1 px-3 py-2 border rounded-lg" />
    <span className="text-gray-400">→</span>
    <input className="flex-1 px-3 py-2 border rounded-lg" />
  </div>
</div>
```

✅ **Recommandé :**
```tsx
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  label="Période"
/>
```

### 2. Toujours valider les dates

```tsx
const handleRangeChange = (range: DateRange) => {
  setDateRange(range);
  
  // Validation côté client
  if (range.startDate && range.endDate) {
    if (new Date(range.endDate) < new Date(range.startDate)) {
      setError('La date de fin doit être après la date de début');
    }
  }
};
```

### 3. Utiliser les presets pour UX optimale

```tsx
// Dans les filtres, toujours activer les presets
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  label="Période"
  showPresets  // ✅ Améliore l'UX
/>
```

### 4. Fournir des messages d'aide clairs

```tsx
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  label="Période d'adhésion"
  helpText="Sélectionnez la période pour filtrer les adhésions actives"
/>
```

### 5. Gérer les erreurs de validation

```tsx
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  label="Période"
  error={error}  // Affiche l'icône + message d'erreur avec token FORM.errorText
/>
```

---

## ♿ Accessibilité

Le composant respecte les standards d'accessibilité :

### Attributs ARIA

```tsx
<input
  type="date"
  aria-label="Date de début"
  aria-invalid={error ? 'true' : 'false'}
/>

<input
  type="date"
  aria-label="Date de fin"
  aria-invalid={error ? 'true' : 'false'}
/>

<span aria-hidden="true">→</span>

<p role="alert">{error}</p>
```

### Support clavier

- ✅ Navigation au clavier (Tab)
- ✅ Sélection avec les flèches dans les inputs natifs
- ✅ Boutons presets activables avec Enter/Space

### Support lecteur d'écran

- ✅ Labels descriptifs (`aria-label`)
- ✅ État invalide annoncé (`aria-invalid`)
- ✅ Messages d'erreur avec `role="alert"`
- ✅ Séparateur caché (`aria-hidden="true"`)

---

## 🎯 Cas d'usage courants

### 1. Filtres de paiements

```tsx
<DateRangePicker
  value={filters.paymentDate}
  onChange={(range) => setFilters({ ...filters, paymentDate: range })}
  label="Période de paiement"
  showPresets
/>
```

### 2. Rapports financiers

```tsx
<DateRangePicker
  value={reportPeriod}
  onChange={setReportPeriod}
  label="Période du rapport"
  showPresets
  error={periodError}
  helpText="Maximum 365 jours"
/>
```

### 3. Filtres d'adhésions

```tsx
<DateRangePicker
  value={membershipRange}
  onChange={setMembershipRange}
  label="Période d'adhésion"
  showPresets
  helpText="Filtrez les adhésions par date de début"
/>
```

### 4. Réservations

```tsx
<DateRangePicker
  value={reservationDates}
  onChange={setReservationDates}
  label="Dates de réservation"
  minDate={today}
  maxDate={maxBookingDate}
/>
```

### 5. Historique d'activités

```tsx
<DateRangePicker
  value={activityPeriod}
  onChange={setActivityPeriod}
  label="Période d'activité"
  showPresets
/>
```

---

## 🔧 Fonctionnalités avancées

### Validation automatique

Le composant ajuste automatiquement les dates si nécessaire :

```typescript
// Si startDate > endDate, ajuste endDate
handleStartDateChange('2024-06-01'); 
// Si endDate actuel est '2024-05-01', devient '2024-06-01'

// Si endDate < startDate, ajuste startDate
handleEndDateChange('2024-05-01');
// Si startDate actuel est '2024-06-01', devient '2024-05-01'
```

### Presets personnalisés

Les presets appliquent automatiquement des plages :

| Preset | Comportement |
|--------|--------------|
| Aujourd'hui | startDate = endDate = today |
| 7 derniers jours | startDate = today - 7j, endDate = today |
| 30 derniers jours | startDate = today - 30j, endDate = today |
| Ce mois | startDate = 1er du mois, endDate = today |
| Mois dernier | startDate = 1er du mois dernier, endDate = dernier jour du mois dernier |
| Cette année | startDate = 1er janvier, endDate = today |
| Effacer | startDate = null, endDate = null |

---

## 📦 Export

```typescript
// Import du composant
import { DateRangePicker } from '@/shared/components/Forms';

// Import des types
import type { DateRangePickerProps, DateRange } from '@/shared/components/Forms';
```

---

## 🐛 Dépannage

### Erreur : "Les dates ne s'affichent pas"

Vérifiez que `value` est un objet `DateRange` valide :

```tsx
// ❌ Incorrect
const [dateRange, setDateRange] = useState(null);

// ✅ Correct
const [dateRange, setDateRange] = useState<DateRange>({
  startDate: null,
  endDate: null,
});
```

### Erreur : "Les presets ne fonctionnent pas"

Activez les presets avec la prop `showPresets` :

```tsx
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  showPresets  // ✅ Active les boutons de presets
/>
```

### Erreur : "Le format de date est incorrect"

Utilisez toujours le format ISO (YYYY-MM-DD) :

```tsx
// ❌ Incorrect
startDate: "01/06/2024"

// ✅ Correct
startDate: "2024-06-01"
```

---

## 📚 Voir aussi

- [`FormField`](./FormField.md) - Composant de champ de formulaire générique
- [`SelectField`](./SelectField.md) - Composant de sélection
- [`SearchBar`](./SearchBar.md) - Barre de recherche
- [Design Tokens](../../styles/designTokens.ts) - Tous les tokens disponibles
- [Audit Style](../../../docs/AUDIT_STYLE.md) - Guide complet du système de design

---

## 📝 Notes de version

### v3.0.0 (Refactoring avec tokens)

- ✅ Migration vers tokens FORM, INPUT, BUTTON
- ✅ Ajout de la prop `helpText`
- ✅ Amélioration de l'accessibilité (ARIA)
- ✅ Simplification de la structure HTML
- ✅ Utilisation de `FORM.dateWrapper` pour le layout
- ✅ Utilisation de `FORM.dateSeparator` pour le séparateur →
- ✅ Messages d'erreur avec icône (token `FORM.errorText`)
- ✅ Support complet du mode désactivé

### Migration depuis v2.x

**Avant (v2.x) :**
```tsx
<div className="flex flex-col sm:flex-row gap-3">
  <div className="flex-1">
    <input className="block w-full px-3 py-2 border..." />
  </div>
  <div className="flex-1">
    <input className="block w-full px-3 py-2 border..." />
  </div>
</div>
```

**Après (v3.0) :**
```tsx
<div className={FORM.dateWrapper}>
  <input className={cn(INPUT.base, FORM.dateInput)} />
  <span className={FORM.dateSeparator}>→</span>
  <input className={cn(INPUT.base, FORM.dateInput)} />
</div>
```

---

**Auteur :** Équipe ClubManager V3  
**Dernière mise à jour :** 2024  
**Status :** ✅ Production-ready