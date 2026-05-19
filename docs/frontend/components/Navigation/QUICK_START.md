# 🚀 Quick Start - TabGroup Variants

Guide rapide pour choisir et utiliser le bon variant de TabGroup.

---

## 🎯 Choisir le bon variant

```
┌─────────────────────────────────────────────────────────────┐
│                    ARBRE DE DÉCISION                         │
└─────────────────────────────────────────────────────────────┘

Est-ce une page Settings ou Admin ?
│
├─ OUI → variant="highlight" ✨
│         + scrollable={true} si 7+ onglets
│
└─ NON → Est-ce une page de contenu/liste ?
          │
          └─ OUI → variant="default" 📄
                    + scrollable={true} si 7+ onglets
```

---

## ⚡ Démarrage rapide

### Variant "default" - Style classique

```tsx
import { TabGroup } from '@/shared/components/Navigation/TabGroup';

<TabGroup
  tabs={[
    { id: 'tab1', label: 'Onglet 1' },
    { id: 'tab2', label: 'Onglet 2' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

**Rendu visuel :**
```
┌──────────────────────────────────────────────┐
│  Onglet 1    Onglet 2    Onglet 3           │ ← Pas de background
│  ─────────                                   │ ← Border-b-2 simple
└──────────────────────────────────────────────┘
    ↑ Actif
```

---

### Variant "highlight" - Style moderne

```tsx
<TabGroup
  variant="highlight"
  tabs={[
    { id: 'tab1', label: 'Onglet 1', icon: <Icon /> },
    { id: 'tab2', label: 'Onglet 2', icon: <Icon /> },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  scrollable={true}
/>
```

**Rendu visuel :**
```
┌────────────────────────────────────────────────────┐
│ ◀  [Onglet 1]   Onglet 2    Onglet 3    Onglet 4  ▶│
│    ─────────                                        │
└────────────────────────────────────────────────────┘
     ↑ bg-blue-50      ↑ Boutons chevron
```

---

## 📊 Comparaison visuelle

| Feature | `default` | `highlight` |
|---------|-----------|-------------|
| Background sur actif | ❌ | ✅ `bg-blue-50` |
| Hover background | ❌ | ✅ `bg-gray-50` |
| Border-b-2 | ✅ | ✅ |
| Boutons chevron | ❌ | ✅ (si scrollable) |
| Scrollbar visible | Masquée | Masquée |
| Usage recommandé | Contenu | Settings/Admin |

---

## 🎨 Exemples par cas d'usage

### 📦 Store Page (Liste de produits)

```tsx
// ✅ Utilisez "default"
<TabGroup
  variant="default"
  tabs={[
    { id: 'products', label: 'Produits', icon: <Cart />, badge: 48 },
    { id: 'categories', label: 'Catégories', icon: <Tag />, badge: 8 },
    { id: 'stats', label: 'Statistiques', icon: <Chart /> },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

**Pourquoi ?** Page de contenu, 3 onglets, navigation discrète ✅

---

### ⚙️ Settings Page

```tsx
// ✅ Utilisez "highlight" + scrollable
<TabGroup
  variant="highlight"
  tabs={[
    { id: 'general', label: 'Général', icon: <Cog /> },
    { id: 'security', label: 'Sécurité', icon: <Shield />, badge: 2 },
    { id: 'notifications', label: 'Notifications', icon: <Bell />, badge: 5 },
    { id: 'profile', label: 'Profil', icon: <User /> },
    { id: 'billing', label: 'Facturation', icon: <Card /> },
    { id: 'language', label: 'Langue', icon: <Globe /> },
    // ... plus d'onglets
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  scrollable={true}  // ← Active les chevrons
/>
```

**Pourquoi ?** 
- Page Settings = style moderne ✅
- 6+ onglets = besoin de scroll ✅
- Chevrons = meilleure UX ✅

---

### 💳 Payments Page (3-4 onglets)

```tsx
// ✅ "default" OU "highlight" (au choix)
<TabGroup
  variant="default"  // ou "highlight"
  tabs={[
    { id: 'pending', label: 'En attente', badge: 12 },
    { id: 'paid', label: 'Payés', badge: 156 },
    { id: 'refunded', label: 'Remboursés', badge: 3 },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

**Pourquoi ?** 3 onglets = les deux variants fonctionnent bien

---

## 🎯 Règles d'or

### ✅ DO (À faire)

```tsx
// ✅ Settings/Admin → highlight
<TabGroup variant="highlight" scrollable={true} ... />

// ✅ Contenu/Listes → default
<TabGroup variant="default" ... />

// ✅ 7+ onglets → scrollable={true}
<TabGroup scrollable={true} ... />

// ✅ Icônes + badges pour clarté
tabs={[
  { id: 'x', label: 'Label', icon: <Icon />, badge: 12 }
]}
```

### ❌ DON'T (À éviter)

```tsx
// ❌ highlight sans scrollable sur 10+ onglets
<TabGroup variant="highlight" tabs={[...10 tabs]} />
// → Ajoutez scrollable={true}

// ❌ Trop d'onglets sans scroll
<TabGroup tabs={[...15 tabs]} />
// → Groupez ou ajoutez scrollable={true}

// ❌ Badge à 0
badge: 0  // → Ne pas mettre de badge du tout
```

---

## 🔧 Props principales

```typescript
variant?: "default" | "highlight"  // Style visuel
scrollable?: boolean               // Active scroll horizontal
tabs: Tab[]                        // Liste d'onglets
activeTab: string                  // ID de l'onglet actif
onTabChange: (id: string) => void  // Callback
```

---

## 📱 Responsive

**Les deux variants sont responsive automatiquement :**

```
Desktop (> 768px)
┌──────────────────────────────────────────┐
│  Tab1   Tab2   Tab3   Tab4   Tab5   Tab6 │
└──────────────────────────────────────────┘

Mobile (< 768px) + scrollable={true}
┌──────────────────────────┐
│ ◀ Tab1  Tab2  Tab3  Tab4 ▶│ ← Scroll horizontal
└──────────────────────────┘
```

---

## 💡 Pro Tips

1. **Icônes** : Utilisez toujours `w-5 h-5` (20x20px)
2. **Badges** : Maximum 999 (tronquer avec "999+")
3. **Labels** : Courts et descriptifs (max 2 mots)
4. **Scroll** : Activez si débordement possible
5. **Variant** : Omettez pour "default" (valeur par défaut)

---

## 🔗 Ressources

- 📖 [Documentation complète](./TabGroup.README.md)
- 🎨 [11 exemples visuels](./TabGroup.examples.tsx)
- ⚙️ [Exemple Settings](./TabGroup.SettingsUsage.tsx)
- 📝 [Changelog](./CHANGELOG.md)

---

## ⚡ Templates prêts à l'emploi

### Template 1 : Page basique (2-4 onglets)

```tsx
const [activeTab, setActiveTab] = useState('tab1');

<TabGroup
  tabs={[
    { id: 'tab1', label: 'Premier' },
    { id: 'tab2', label: 'Deuxième' },
    { id: 'tab3', label: 'Troisième' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Template 2 : Settings avec scroll

```tsx
const [activeTab, setActiveTab] = useState('general');

<TabGroup
  variant="highlight"
  scrollable={true}
  tabs={[
    { id: 'general', label: 'Général', icon: <CogIcon /> },
    { id: 'security', label: 'Sécurité', icon: <ShieldIcon />, badge: 2 },
    // ... plus d'onglets
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Template 3 : Dashboard avec badges

```tsx
const [activeTab, setActiveTab] = useState('overview');

<TabGroup
  variant="default"
  tabs={[
    { id: 'overview', label: 'Vue d\'ensemble', icon: <ChartIcon /> },
    { id: 'tasks', label: 'Tâches', icon: <CheckIcon />, badge: 8 },
    { id: 'messages', label: 'Messages', icon: <MailIcon />, badge: 23 },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

---

**🎉 Vous êtes prêt !** Consultez les [exemples](./TabGroup.examples.tsx) pour plus d'inspiration.