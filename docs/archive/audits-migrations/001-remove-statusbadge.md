# Migration 001 - Suppression de StatusBadge.tsx

**Date:** 2024-12  
**Type:** Suppression de doublon  
**Priorité:** 🔥 Critique (Phase 1 - Fondations)  
**Statut:** ✅ Complété  
**Temps estimé:** 30 min  
**Temps réel:** 30 min

---

## 📋 RÉSUMÉ

Suppression du composant `StatusBadge.tsx` qui faisait doublon avec `Badge.Status`.

**Problème identifié:**
- 2 composants différents pour la même fonctionnalité
- Confusion pour les développeurs : "Lequel utiliser ?"
- Duplication de ~80 lignes de code
- Styles définis en dur au lieu d'utiliser les design tokens

**Solution appliquée:**
- Migrer les 3 usages vers `Badge.Status`
- Supprimer `StatusBadge.tsx`
- Nettoyer les exports et documentation

---

## 🎯 OBJECTIFS

### Maintenabilité
✅ Éliminer la duplication de code  
✅ Un seul composant officiel pour les badges de statut  
✅ Future: utilisation des design tokens via Badge

### Cohérence
✅ Fin de la confusion sur quel composant utiliser  
✅ Tous les badges de statut utilisent `Badge.Status`

### Architecture
✅ Principe "Single Source of Truth" appliqué  
✅ Documentation mise à jour

---

## 📝 CHANGEMENTS APPLIQUÉS

### 1. Fichiers Supprimés

```
❌ frontend/src/shared/components/Badge/StatusBadge.tsx
❌ frontend/src/shared/components/Badge/StatusBadge.examples.tsx
❌ frontend/src/shared/components/Badge/StatusBadge.md
```

**Total:** -80 lignes de code (composant) + ~200 lignes (exemples/doc)

---

### 2. Fichiers Modifiés

#### `frontend/src/features/courses/pages/CoursesPage.tsx`

**Import changé:**
```diff
- import { StatusBadge } from "../../../shared/components/Badge/StatusBadge";
+ import { Badge } from "../../../shared/components/Badge";
```

**Usage 1 - Statut cours (ligne ~1574):**
```diff
- <StatusBadge
-   status={course.active ? "success" : "inactive"}
-   label={course.active ? "Actif" : "Inactif"}
-   size="sm"
- />
+ <Badge.Status
+   status={course.active ? "active" : "inactive"}
+   size="sm"
+ >
+   {course.active ? "Actif" : "Inactif"}
+ </Badge.Status>
```

**Usage 2 - Séance annulée (ligne ~1769):**
```diff
- <StatusBadge
-   status="error"
-   label="Annulé"
-   size="sm"
-   className="ml-2"
- />
+ <Badge.Status
+   status="error"
+   size="sm"
+   className="ml-2"
+ >
+   Annulé
+ </Badge.Status>
```

**Usage 3 - Statut professeur (ligne ~1891):**
```diff
- <StatusBadge
-   status={prof.actif ? "success" : "inactive"}
-   label={prof.actif ? "Actif" : "Inactif"}
-   size="sm"
- />
+ <Badge.Status
+   status={prof.actif ? "active" : "inactive"}
+   size="sm"
+ >
+   {prof.actif ? "Actif" : "Inactif"}
+ </Badge.Status>
```

---

#### `frontend/src/shared/components/Badge/index.ts`

**Exports nettoyés:**
```diff
  export {
    Badge,
    StockBadge,
    RoleBadge,
    PaymentStatusBadge,
    OrderStatusBadge,
  } from "./Badge";
  export type {
    BadgeProps,
    StockBadgeProps,
    RoleBadgeProps,
    PaymentStatusBadgeProps,
    OrderStatusBadgeProps,
  } from "./Badge";
  
- // StatusBadge (composant séparé)
- export { StatusBadge } from './StatusBadge';
- export type { StatusBadgeProps } from './StatusBadge';
```

---

## 🔄 GUIDE DE MIGRATION

### Si vous aviez du code utilisant StatusBadge

**Ancien code:**
```tsx
import { StatusBadge } from "@/shared/components/Badge/StatusBadge";

<StatusBadge 
  status="success" 
  label="Actif" 
  size="md"
  showDot={true}
/>
```

**Nouveau code:**
```tsx
import { Badge } from "@/shared/components/Badge";

<Badge.Status 
  status="active"  // ← "success" n'existe plus, utiliser "active"
  size="md"
  // showDot n'existe plus, le dot est toujours affiché
>
  Actif  // ← Label en children au lieu de prop
</Badge.Status>
```

### Mapping des statuts

| StatusBadge (ancien) | Badge.Status (nouveau) |
|---------------------|------------------------|
| `success` | `active` |
| `active` | `active` |
| `inactive` | `inactive` |
| `pending` | `pending` |
| `error` | `error` |
| `warning` | ⚠️ Utiliser `pending` ou `Badge variant="warning"` |
| `archived` | `archive` (version française) |

### Props changées

| Ancien | Nouveau | Note |
|--------|---------|------|
| `label="Texte"` | `children="Texte"` ou `>Texte<` | Children au lieu de prop |
| `showDot={true}` | ❌ Supprimé | Dot toujours affiché maintenant |
| `status="success"` | `status="active"` | "success" n'existe plus |

---

## ✅ VALIDATION

### Tests Effectués

- [x] TypeScript compile sans erreur
- [x] Aucune régression visuelle sur CoursesPage
- [x] Grep de "StatusBadge" ne retourne que des composants métier (PaymentStatusBadge, etc.)
- [x] Exports nettoyés dans index.ts
- [x] Documentation supprimée

### Commandes de Vérification

```bash
# Vérifier qu'aucun import direct de StatusBadge n'existe
grep -r "from.*StatusBadge\"" frontend/src --include="*.tsx" --include="*.ts"
# Résultat attendu: Seulement PaymentStatusBadge, OrderStatusBadge, etc. (composants métier)

# Vérifier que le fichier n'existe plus
ls frontend/src/shared/components/Badge/StatusBadge.tsx
# Résultat attendu: No such file or directory

# TypeScript
cd frontend && npm run type-check
# Résultat attendu: Aucune erreur liée à StatusBadge
```

---

## 📊 IMPACT

### Métriques

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| **Composants pour badges de statut** | 2 (StatusBadge + Badge.Status) | 1 (Badge.Status) | -50% |
| **Lignes de code** | +80 lignes dupliquées | 0 | -80 lignes |
| **Confusion développeurs** | Élevée | Aucune | ✅ |
| **Design tokens utilisés** | ❌ Non (classes en dur) | ✅ Oui (via Badge) | ✅ |

### Scores Piliers

| Pilier | Avant | Après | Évolution |
|--------|-------|-------|-----------|
| Cohérence | 11/20 | 12/20 | +1 point |
| Maintenabilité | 12/20 | 13/20 | +1 point |

---

## 🚨 BREAKING CHANGES

### ⚠️ Pour les développeurs

Si vous aviez du code en cours utilisant `StatusBadge` :

1. **Import changé** : `Badge.Status` au lieu de `StatusBadge`
2. **Prop `label`** : Maintenant `children`
3. **Statut `success`** : Utiliser `active` à la place
4. **Prop `showDot`** : Supprimée (toujours affiché)

### Migration Automatique (Script)

Si vous avez beaucoup d'usages, utilisez ce script de remplacement :

```bash
# Remplacer les imports
find frontend/src -name "*.tsx" -exec sed -i 's/import { StatusBadge }/import { Badge }/g' {} +
find frontend/src -name "*.tsx" -exec sed -i 's/from ".*StatusBadge"/from "@\/shared\/components\/Badge"/g' {} +

# Remplacer status="success" par status="active"
find frontend/src -name "*.tsx" -exec sed -i 's/status="success"/status="active"/g' {} +

# Note: Le remplacement de label par children nécessite une revue manuelle
```

---

## 📚 DOCUMENTATION MISE À JOUR

### Fichiers à Consulter

- ✅ [Guide de Sélection des Composants](../GUIDE_SELECTION_COMPOSANTS.md#badges)
- ✅ [Audit Cohérence](../AUDIT_COHERENCE_STYLES_COMPOSANTS.md#overlaps-fonctionnels)
- ✅ [Plan d'Action Optimisé](../PLAN_ACTION_OPTIMISE.md#action-11)

### Badge.md Mis à Jour

La documentation de Badge.tsx contient maintenant tous les exemples de `Badge.Status`.

---

## 🎓 LEÇONS APPRISES

### Ce qui a bien fonctionné

✅ **Un seul usage** : CoursesPage était le seul fichier à migrer (facile)  
✅ **Tests automatiques** : TypeScript a détecté immédiatement les erreurs  
✅ **Documentation** : Log de migration créé pour référence future

### Points d'Attention

⚠️ **Vérifier les exemples** : Ne pas oublier les fichiers `.examples.tsx`  
⚠️ **Documentation** : Penser aux fichiers `.md` associés  
⚠️ **Exports** : Nettoyer les fichiers `index.ts`

### Recommandations Futures

1. **Avant de créer un nouveau composant** : Vérifier qu'il n'existe pas déjà
2. **Naming cohérent** : Éviter les doublons de noms (StatusBadge vs Badge.Status)
3. **Documentation** : Toujours documenter le composant officiel à utiliser

---

## 🔗 LIENS

- **PR/Commit:** [À compléter]
- **Issue GitHub:** [À compléter]
- **Discussion Slack:** [À compléter]

---

## ✅ CHECKLIST DE VALIDATION FINALE

- [x] Code migré (CoursesPage.tsx)
- [x] Fichier StatusBadge.tsx supprimé
- [x] Fichiers exemples/doc supprimés
- [x] Exports nettoyés (index.ts)
- [x] TypeScript compile
- [x] Aucune régression visuelle
- [x] Documentation mise à jour
- [x] Log de migration créé
- [ ] PR créée et reviewée
- [ ] Tests E2E passent
- [ ] Déployé en staging
- [ ] Validé par l'équipe

---

**Prochaine migration:** [002-merge-errorbanner-alertbanner.md](./002-merge-errorbanner-alertbanner.md)

**Contact:** Tech Lead Frontend  
**Date de complétion:** 2024-12-XX