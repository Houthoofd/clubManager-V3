# Changelog - TabGroup Component

Toutes les modifications notables apportées au composant TabGroup seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [2.0.0] - 2024-01-XX

### 🎉 Nouveautés majeures

#### Système de variants
- ✨ **Ajout de la prop `variant`** avec 2 options :
  - `"default"` : Style classique avec border-b-2 (comportement existant)
  - `"highlight"` : Style moderne avec background bg-blue-50 sur l'onglet actif
- 🎨 Le variant "highlight" est inspiré du design de la page Settings
- ✅ **100% rétrocompatible** : Si `variant` n'est pas spécifié, le comportement reste identique à la v1.x

#### Boutons de scroll avec chevrons (variant "highlight")
- ⬅️➡️ **Ajout de boutons de défilement** (chevrons gauche/droite)
- 🔄 Apparition automatique uniquement si le contenu déborde
- 🎯 Disponibles uniquement avec `variant="highlight"` + `scrollable={true}`
- ♿ Accessibilité : `aria-label` sur les boutons chevron
- 🎬 Animation smooth scroll lors du clic

#### Icônes SVG inline
- 📦 Icônes chevron intégrées directement (pas de dépendance externe)
- 🎨 Style cohérent avec le design system

### 🔧 Améliorations

#### Gestion du scroll
- 📊 Détection intelligente du débordement du contenu
- 🔄 Mise à jour automatique lors du resize de la fenêtre
- 🧹 Cleanup automatique des event listeners
- 🎭 Scrollbar masquée sur le variant "highlight" pour un design épuré

#### Styles et UX
- 🎨 **Variant "highlight"** : 
  - Background `bg-blue-50` sur l'onglet actif
  - Hover `hover:bg-gray-50` sur les onglets inactifs
- 🎨 **Variant "default"** : 
  - Border-b-2 simple (style existant préservé)
  - Hover avec changement de bordure
- 🎯 Transitions fluides entre les états

#### Architecture
- 🏗️ Refactoring des classes conditionnelles pour meilleure lisibilité
- 📝 Documentation JSDoc enrichie avec exemples de variants
- 🧪 Ajout de refs pour la gestion du scroll
- ⚡ Optimisation des re-renders avec useEffect

### 📚 Documentation

- ✅ **TabGroup.README.md** : Documentation complète des variants
- ✅ **TabGroup.examples.tsx** : 11 exemples visuels (mis à jour)
  - 4 exemples variant "default"
  - 5 exemples variant "highlight"
  - 2 exemples réels (Store, Settings)
  - 1 comparaison côte à côte
- ✅ **TabGroup.SettingsUsage.tsx** : Exemple complet d'intégration dans une Settings page
- ✅ **CHANGELOG.md** : Ce fichier

### 🔄 Migrations depuis v1.x

#### Pas de changement nécessaire
```tsx
// Code v1.x (fonctionne toujours)
<TabGroup 
  tabs={tabs} 
  activeTab={activeTab} 
  onTabChange={setActiveTab} 
/>
```

#### Pour utiliser le nouveau variant "highlight"
```tsx
// Nouveau code v2.0
<TabGroup 
  variant="highlight"  // ← Ajout de cette prop
  tabs={tabs} 
  activeTab={activeTab} 
  onTabChange={setActiveTab}
  scrollable={true}     // ← Pour activer les chevrons
/>
```

### 📦 Props ajoutées

```typescript
variant?: "default" | "highlight"  // Nouveau, default = "default"
```

### ⚠️ Breaking Changes

**Aucun breaking change** - Cette version est 100% rétrocompatible avec v1.x

### 🐛 Corrections de bugs

- 🔧 Correction du type TypeScript dans les classes conditionnelles (arrays non supportés par `cn`)
- 🎨 Amélioration de la gestion des styles hover sur mobile

### 🧪 Tests

- ✅ Compilation TypeScript sans erreurs
- ✅ Tous les exemples fonctionnent correctement
- ✅ Tests manuels sur Chrome, Firefox, Safari

### 📊 Statistiques

- **Lignes ajoutées** : ~150 lignes
- **Nouveaux fichiers** : 3 (README, SettingsUsage, CHANGELOG)
- **Exemples** : 11 au total
- **Variants** : 2 (default, highlight)
- **Rétrocompatibilité** : 100%

---

## [1.0.0] - 2024-XX-XX

### 🎉 Version initiale

- ✅ Composant TabGroup de base
- ✅ Support des icônes
- ✅ Support des badges numériques
- ✅ Scroll horizontal (scrollable)
- ✅ Design tokens intégrés
- ✅ Accessibilité (ARIA)
- ✅ 8 exemples d'utilisation

---

## Guide de versioning

- **MAJOR** (X.0.0) : Breaking changes (incompatibilité avec versions précédentes)
- **MINOR** (0.X.0) : Nouvelles fonctionnalités (rétrocompatibles)
- **PATCH** (0.0.X) : Corrections de bugs (rétrocompatibles)

---

## Liens utiles

- [Documentation complète](./TabGroup.README.md)
- [Exemples visuels](./TabGroup.examples.tsx)
- [Exemple Settings](./TabGroup.SettingsUsage.tsx)
- [Code source](./TabGroup.tsx)

---

**Maintenu par** : Club Manager Team  
**Dernière mise à jour** : 2024