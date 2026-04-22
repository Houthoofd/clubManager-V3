# 🔄 Guide de Refactoring - Design System Consistency

**Objectif:** Migrer l'application vers le nouveau système de Design Tokens et composants réutilisables pour garantir une cohérence visuelle complète.

**Branche:** `refactor/design-system-consistency`  
**Basé sur:** Audit de Style (Note: 7.2/10 → Objectif: 9/10)

---

## 📊 Vue d'Ensemble

### Problèmes Identifiés

1. ❌ **15 variations de cartes** différentes
2. ❌ **Border-radius incohérents** (`rounded-lg`, `rounded-xl`, `rounded-2xl`)
3. ❌ **Bordures variables** (`border-gray-100`, `border-gray-200`, absent)
4. ❌ **Padding incohérents** (`p-4`, `p-5`, `p-6`, `p-8`)
5. ❌ **Code dupliqué** dans tous les composants
6. ❌ **Classes CSS globales** non utilisées

### Solution

✅ **1 système de Design Tokens** centralisé  
✅ **1 composant Card** avec 3 variants  
✅ **Composants réutilisables** (Button, Badge, Modal à venir)  
✅ **Documentation complète**  
✅ **Code DRY** et maintenable

---

## 🎯 Plan de Migration

### Phase 1: Préparation ✅ TERMINÉ
- [x] Audit de style complet
- [x] Création du système de Design Tokens
- [x] Création du composant Card
- [x] Documentation et exemples

### Phase 2: Composants de Base (En cours)
- [ ] Créer le composant Button
- [ ] Créer le composant Badge
- [ ] Créer le composant Modal
- [ ] Créer le composant Input

### Phase 3: Migration des Pages
- [ ] Migrer LoginPage
- [ ] Migrer CoursesPage
- [ ] Migrer FamilyPage
- [ ] Migrer PaymentsPage
- [ ] Migrer StorePage
- [ ] Migrer UsersPage
- [ ] Migrer DashboardPage
- [ ] Migrer SettingsPage
- [ ] Migrer MessagesPage

### Phase 4: Migration des Composants
- [ ] Migrer tous les modals (7)
- [ ] Migrer tous les badges (6)
- [ ] Uniformiser les layouts

### Phase 5: Nettoyage Final
- [ ] Supprimer classes CSS inutilisées
- [ ] Tests visuels complets
- [ ] Review de code
- [ ] Documentation finale

---

## 🔧 Outils Disponibles

### Design Tokens

```tsx
import { 
  CARD, 
  BUTTON, 
  BADGE, 
  MODAL, 
  INPUT,
  TYPOGRAPHY,
  cn 
} from '@/shared/styles/designTokens';
```

### Composants

```tsx
import { Card } from '@/shared/components/Card';
// À venir:
// import { Button } from '@/shared/components/Button';
// import { Badge } from '@/shared/components/Badge';
// import { Modal } from '@/shared/components/Modal';
```

---

## 📝 Guide de Migration - Card

### Étape 1: Identifier le Type de Carte

**Question:** Où est utilisée cette carte?

- **Grille d'articles/membres** → `variant="compact"`
- **Page principale** → `variant="standard"` (défaut)
- **Page auth/landing** → `variant="emphasis"`

### Étape 2: Migration Avant/Après

#### Exemple 1: Carte Simple

**❌ AVANT:**
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Titre</h2>
  <p className="text-sm text-gray-600">Contenu</p>
</div>
```

**✅ APRÈS:**
```tsx
<Card variant="compact">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Titre</h2>
  <p className="text-sm text-gray-600">Contenu</p>
</Card>
```

#### Exemple 2: Grille d'Articles (StorePage)

**❌ AVANT:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {articles.map((article) => (
    <div 
      key={article.id}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <h3>{article.name}</h3>
      <p>{article.price}</p>
    </div>
  ))}
</div>
```

**✅ APRÈS:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {articles.map((article) => (
    <Card key={article.id} variant="compact" hover>
      <h3>{article.name}</h3>
      <p>{article.price}</p>
    </Card>
  ))}
</div>
```

#### Exemple 3: Carte avec Header/Footer

**❌ AVANT:**
```tsx
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
  <div className="border-b border-gray-200 pb-4 mb-4">
    <h2 className="text-xl font-semibold text-gray-900">Titre</h2>
    <p className="text-sm text-gray-500 mt-1">Sous-titre</p>
  </div>
  
  <div className="space-y-4">
    {/* Contenu */}
  </div>
  
  <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
    <button>Annuler</button>
    <button>Confirmer</button>
  </div>
</div>
```

**✅ APRÈS:**
```tsx
<Card variant="standard">
  <Card.Header>
    <h2 className="text-xl font-semibold text-gray-900">Titre</h2>
    <p className="text-sm text-gray-500 mt-1">Sous-titre</p>
  </Card.Header>
  
  <Card.Body>
    <div className="space-y-4">
      {/* Contenu */}
    </div>
  </Card.Body>
  
  <Card.Footer>
    <div className="flex items-center justify-end gap-3">
      <button>Annuler</button>
      <button>Confirmer</button>
    </div>
  </Card.Footer>
</Card>
```

#### Exemple 4: LoginPage (Emphasis)

**❌ AVANT:**
```tsx
<div className="bg-white rounded-2xl shadow-2xl p-8">
  <h1 className="text-2xl font-bold text-gray-900 mb-6">Connexion</h1>
  <form>{/* ... */}</form>
</div>
```

**✅ APRÈS:**
```tsx
<Card variant="emphasis" shadow="2xl">
  <h1 className="text-2xl font-bold text-gray-900 mb-6">Connexion</h1>
  <form>{/* ... */}</form>
</Card>
```

### Étape 3: Checklist de Migration

Pour chaque carte migrée, vérifier:

- [ ] Import du composant Card ajouté
- [ ] Variant approprié utilisé (`compact`, `standard`, `emphasis`)
- [ ] Prop `hover` ajoutée si carte cliquable
- [ ] Structure Header/Body/Footer utilisée si applicable
- [ ] Classes CSS personnalisées conservées dans `className`
- [ ] Comportement identique à l'original (onClick, etc.)

---

## 📋 Checklist par Page

### CoursesPage

**Fichier:** `frontend/src/features/courses/pages/CoursesPage.tsx`

**Cartes à migrer:**
- [ ] Carte principale de planning → `<Card variant="standard">`
- [ ] Cartes de cours dans la grille → `<Card variant="compact" hover>`

**Modifications:**
```tsx
// Ligne ~100
- <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
+ <Card variant="compact">
```

---

### FamilyPage

**Fichier:** `frontend/src/features/families/pages/FamilyPage.tsx`

**Cartes à migrer:**
- [ ] Carte principale famille → `<Card variant="standard">`
- [ ] Cartes de membres → `<Card variant="compact" hover>`

**Composant à migrer:**
- [ ] FamilyMemberCard → Utiliser `<Card variant="compact">`

---

### PaymentsPage

**Fichier:** `frontend/src/features/payments/pages/PaymentsPage.tsx`

**Cartes à migrer:**
- [ ] Carte principale → `<Card variant="standard">`
- [ ] Cartes de paiements dans liste → `<Card variant="compact">`

---

### StorePage

**Fichier:** `frontend/src/features/store/pages/StorePage.tsx`

**Cartes à migrer:**
- [ ] Carte principale boutique → `<Card variant="standard">`
- [ ] Cartes d'articles → `<Card variant="compact" hover>`
- [ ] Cartes de commandes → `<Card variant="compact">`

**Note:** Beaucoup de cartes ici, impact visuel important!

---

### UsersPage

**Fichier:** `frontend/src/features/users/pages/UsersPage.tsx`

**Cartes à migrer:**
- [ ] Carte principale liste → `<Card variant="standard">`
- [ ] Cartes d'utilisateurs (si applicable) → `<Card variant="compact">`

---

### DashboardPage

**Fichier:** `frontend/src/features/statistics/pages/DashboardPage.tsx`

**Cartes à migrer:**
- [ ] Cartes de statistiques → `<Card variant="compact">`
- [ ] Cartes de graphiques → `<Card variant="standard">`

**Composant à migrer:**
- [ ] StatCard → Utiliser `<Card variant="compact">`

---

### LoginPage

**Fichier:** `frontend/src/features/auth/pages/LoginPage.tsx`

**Cartes à migrer:**
- [ ] Carte formulaire de connexion → `<Card variant="emphasis" shadow="2xl">`

---

### MessagesPage

**Fichier:** `frontend/src/features/messaging/pages/MessagesPage.tsx`

**Cartes à migrer:**
- [ ] Panel de messages → `<Card variant="standard">`
- [ ] Items de message → `<Card variant="compact">`

---

## 🎨 Standardisation des Styles

### Border Radius

**Règle:** Toujours `rounded-xl` pour les cartes

```tsx
// ❌ Avant
className="rounded-lg"   // 12px
className="rounded-2xl"  // 24px

// ✅ Après
<Card>  // rounded-xl (16px) par défaut
```

### Bordures

**Règle:** Toujours `border-gray-100`

```tsx
// ❌ Avant
border-gray-200
border-gray-300

// ✅ Après
<Card>  // border border-gray-100 par défaut
```

### Shadows

**Règle:** `shadow-sm` par défaut, `shadow-2xl` pour auth

```tsx
// ❌ Avant
shadow-md
shadow-lg
shadow-2xl partout

// ✅ Après
<Card>                     // shadow-sm (défaut)
<Card shadow="2xl">        // Auth/Landing uniquement
```

### Padding

**Règle:** Variants clairs

```tsx
// ❌ Avant
p-4, p-5, p-6, p-8 mélangés

// ✅ Après
<Card variant="compact">   // p-4
<Card variant="standard">  // p-6
<Card variant="emphasis">  // p-8
```

---

## 🚀 Workflow de Migration

### Pour chaque page:

1. **Ouvrir le fichier**
   ```bash
   code frontend/src/features/[module]/pages/[Page].tsx
   ```

2. **Ajouter l'import**
   ```tsx
   import { Card } from '@/shared/components/Card';
   ```

3. **Identifier toutes les cartes**
   - Rechercher: `className=".*bg-white.*rounded-`
   - Marquer chaque occurrence

4. **Migrer une par une**
   - Déterminer le variant approprié
   - Remplacer le `<div>` par `<Card>`
   - Supprimer les classes devenues inutiles
   - Tester visuellement

5. **Commit**
   ```bash
   git add frontend/src/features/[module]/pages/[Page].tsx
   git commit -m "refactor([module]): migrate [Page] to Card component"
   ```

---

## 🧪 Tests Visuels

Après chaque migration, vérifier:

- [ ] La carte s'affiche correctement
- [ ] Le padding est approprié
- [ ] Les bordures sont visibles (subtiles)
- [ ] L'ombre est cohérente avec les autres
- [ ] L'effet hover fonctionne (si applicable)
- [ ] Responsive OK (mobile, tablet, desktop)
- [ ] Pas de régression visuelle

### Outils de Test

1. **Chrome DevTools** - Vérifier les classes appliquées
2. **Responsive Mode** - Tester mobile/tablet
3. **Comparaison visuelle** - Avant/Après (screenshots)

---

## 📚 Ressources

### Documentation

- [Design Tokens](../frontend/src/shared/styles/designTokens.ts)
- [Card Component](../frontend/src/shared/components/Card.md)
- [Exemples Card](../frontend/src/shared/components/Card.examples.tsx)
- [Audit de Style](./AUDIT_STYLE.md)

### Commandes Utiles

```bash
# Rechercher toutes les cartes à migrer
grep -r "bg-white.*rounded-" frontend/src/features --include="*.tsx"

# Compter les occurrences
grep -r "bg-white.*rounded-" frontend/src/features --include="*.tsx" | wc -l

# Voir les diff
git diff frontend/src/features/[module]/pages/[Page].tsx
```

---

## ⚠️ Cas Particuliers

### Cartes avec Images Full-Width

Utiliser `noPadding`:

```tsx
<Card noPadding className="overflow-hidden">
  <img src={image} className="w-full h-48 object-cover" />
  <div className="p-6">
    <h3>Titre</h3>
    <p>Contenu avec padding personnalisé</p>
  </div>
</Card>
```

### Cartes Sans Bordure

Utiliser `noBorder`:

```tsx
<Card noBorder>
  {/* Contenu */}
</Card>
```

### Cartes avec Classes Personnalisées

Ajouter via `className`:

```tsx
<Card className="max-w-2xl mx-auto">
  {/* Contenu */}
</Card>
```

---

## 🐛 Problèmes Courants

### Problème: Espacement différent après migration

**Cause:** Variant incorrect

**Solution:** 
```tsx
// ❌ Avant: p-4
<Card variant="standard">  // p-6

// ✅ Après
<Card variant="compact">   // p-4
```

### Problème: Border trop foncée

**Cause:** Ancien code utilisait `border-gray-200`

**Solution:** Le composant Card utilise `border-gray-100` (plus subtil), c'est normal et souhaité.

### Problème: Shadow trop prononcée

**Cause:** Ancien code utilisait `shadow-lg` ou `shadow-xl`

**Solution:** Standardiser sur `shadow-sm`, sauf auth qui garde `shadow-2xl`:
```tsx
<Card shadow="2xl">  // Auth uniquement
```

---

## ✅ Critères de Succès

### Par Page Migrée

- [ ] Toutes les cartes utilisent le composant `<Card>`
- [ ] Aucune classe `bg-white rounded-*` en dur
- [ ] Variants appropriés utilisés
- [ ] Tests visuels passés
- [ ] Aucune régression fonctionnelle
- [ ] Code commit et push

### Global

- [ ] 100% des pages migrées
- [ ] 100% des modals migrés
- [ ] Classes CSS inutilisées supprimées
- [ ] Documentation à jour
- [ ] Tests E2E passent
- [ ] Review d'équipe validée

---

## 📈 Suivi de Progression

### Pages (0/9)

- [ ] LoginPage
- [ ] CoursesPage
- [ ] FamilyPage
- [ ] PaymentsPage
- [ ] StorePage
- [ ] UsersPage
- [ ] DashboardPage
- [ ] SettingsPage
- [ ] MessagesPage

### Composants (0/13)

- [ ] AddFamilyMemberModal
- [ ] ComposeModal
- [ ] RecordPaymentModal
- [ ] ArticleModal
- [ ] CartModal
- [ ] FamilyMemberCard
- [ ] StatCard
- [ ] PaymentStatusBadge
- [ ] OrderStatusBadge
- [ ] StockBadge
- [ ] UserRoleBadge
- [ ] UserStatusBadge
- [ ] (Autres à identifier)

---

## 🎯 Prochaines Étapes

1. **Créer le composant Button** (1h)
2. **Créer le composant Badge** (45min)
3. **Créer le composant Modal** (1.5h)
4. **Commencer la migration des pages** (1-2 jours)
5. **Migrer les modals** (1 jour)
6. **Nettoyage final** (1 jour)

**Estimation totale:** 15-20 jours (1 développeur)

---

## 📞 Support

**Questions?** Voir la documentation:
- [Card.md](../frontend/src/shared/components/Card.md)
- [AUDIT_STYLE.md](./AUDIT_STYLE.md)

**Problème bloquant?** Créer une issue avec:
- Fichier concerné
- Comportement attendu vs actuel
- Screenshot si applicable

---

*Dernière mise à jour: Janvier 2025*  
*Branche: refactor/design-system-consistency*