# SearchBar

Composant de barre de recherche réutilisable avec debounce optionnel, bouton clear, et gestion des événements clavier.

## Description

Le composant **SearchBar** est une barre de recherche hautement configurable qui offre :
- **Debounce optionnel** : Réduit le nombre d'appels onChange pour améliorer les performances
- **Bouton clear** : Permet d'effacer rapidement la recherche
- **3 tailles disponibles** : sm, md, lg
- **Gestion de la touche Enter** : Pour soumettre des formulaires ou lancer des recherches
- **État disabled** : Pour désactiver l'interaction
- **Accessible** : Avec attributs ARIA appropriés

## Quand l'utiliser

✅ **À utiliser pour :**
- Filtrage de listes en temps réel
- Recherche d'articles, produits, utilisateurs
- Champs de recherche dans les tableaux de données
- Recherche globale dans l'application
- Filtrage de résultats côté client

❌ **À éviter pour :**
- Recherche complexe nécessitant plusieurs champs
- Filtres avancés avec multiples critères (utiliser FilterBar)

## API du composant

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `value` | `string` | **Requis** | Valeur actuelle de la recherche |
| `onChange` | `(value: string) => void` | **Requis** | Callback appelé lors du changement (après debounce si défini) |
| `placeholder` | `string` | `"Rechercher..."` | Texte affiché quand le champ est vide |
| `debounce` | `number` | `0` | Délai de debounce en ms (0 = pas de debounce) |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Taille du composant |
| `showClear` | `boolean` | `false` | Affiche le bouton clear (X) quand il y a du texte |
| `disabled` | `boolean` | `false` | Désactive le champ de recherche |
| `className` | `string` | `undefined` | Classes CSS additionnelles |
| `onEnter` | `() => void` | `undefined` | Callback appelé lors de l'appui sur Enter |

## Debounce : Pourquoi et comment ?

### Qu'est-ce que le debounce ?

Le **debounce** est une technique qui retarde l'exécution du callback `onChange` jusqu'à ce que l'utilisateur arrête de taper pendant un certain délai.

### Pourquoi utiliser le debounce ?

**Sans debounce :** Si l'utilisateur tape "react", le callback est appelé 5 fois (r, re, rea, reac, react).

**Avec debounce (300ms) :** Le callback n'est appelé qu'une seule fois, 300ms après que l'utilisateur a fini de taper.

### Avantages :
- ✅ **Performance** : Réduit drastiquement le nombre d'appels API ou de calculs
- ✅ **UX fluide** : L'input reste réactif visuellement
- ✅ **Économie de ressources** : Moins de requêtes réseau, moins de re-renders

### Valeur recommandée :
- **300ms** : Bon équilibre entre réactivité et performance
- **500ms** : Pour des recherches API coûteuses
- **0ms** : Pour du filtrage côté client très simple (petites listes)

## Exemples d'utilisation

### 1. Recherche basique sans debounce

```tsx
import { useState } from 'react';
import { SearchBar } from '@/shared/components/SearchBar';

function BasicExample() {
  const [search, setSearch] = useState('');

  return (
    <SearchBar
      value={search}
      onChange={setSearch}
      placeholder="Rechercher..."
    />
  );
}
```

### 2. Avec debounce (recommandé)

```tsx
import { useState } from 'react';
import { SearchBar } from '@/shared/components/SearchBar';

function WithDebounceExample() {
  const [search, setSearch] = useState('');

  // onChange n'est appelé que 300ms après que l'utilisateur a arrêté de taper
  const handleSearch = (value: string) => {
    console.log('Recherche pour:', value);
    // Appel API, filtrage, etc.
  };

  return (
    <SearchBar
      value={search}
      onChange={handleSearch}
      placeholder="Rechercher des articles..."
      debounce={300}
      showClear
    />
  );
}
```

### 3. Les trois tailles

```tsx
import { useState } from 'react';
import { SearchBar } from '@/shared/components/SearchBar';

function SizesExample() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Small</label>
        <SearchBar
          value={search}
          onChange={setSearch}
          size="sm"
          placeholder="Petite recherche"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Medium (défaut)</label>
        <SearchBar
          value={search}
          onChange={setSearch}
          size="md"
          placeholder="Recherche moyenne"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Large</label>
        <SearchBar
          value={search}
          onChange={setSearch}
          size="lg"
          placeholder="Grande recherche"
        />
      </div>
    </div>
  );
}
```

### 4. Filtrage de liste en temps réel

```tsx
import { useState } from 'react';
import { SearchBar } from '@/shared/components/SearchBar';

function FilteringListExample() {
  const [search, setSearch] = useState('');
  
  const items = [
    'Apple',
    'Banana',
    'Cherry',
    'Date',
    'Elderberry',
    'Fig',
    'Grape',
    'Honeydew'
  ];

  const filtered = items.filter(item =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Rechercher un fruit..."
        debounce={300}
        showClear
      />

      <ul className="mt-4 space-y-2">
        {filtered.map(item => (
          <li key={item} className="p-2 bg-gray-50 rounded">
            {item}
          </li>
        ))}
      </ul>

      <p className="text-sm text-gray-500 mt-2">
        {filtered.length} résultat(s) trouvé(s)
      </p>
    </div>
  );
}
```

### 5. Recherche avec soumission sur Enter

```tsx
import { useState } from 'react';
import { SearchBar } from '@/shared/components/SearchBar';

function OnEnterSubmitExample() {
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState('');

  const handleSubmit = () => {
    setSubmitted(search);
    console.log('Recherche soumise:', search);
    // Appel API, navigation, etc.
  };

  return (
    <div>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Tapez et appuyez sur Enter..."
        onEnter={handleSubmit}
        showClear
      />

      {submitted && (
        <p className="mt-4 text-sm text-gray-600">
          Dernière recherche soumise : <strong>{submitted}</strong>
        </p>
      )}
    </div>
  );
}
```

### 6. Recherche d'articles (exemple StorePage)

```tsx
import { useState, useEffect } from 'react';
import { SearchBar } from '@/shared/components/SearchBar';
import { Article } from '@/types';

function ArticleSearchExample() {
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      setArticles([]);
      return;
    }

    setLoading(true);
    try {
      // Appel API
      const response = await fetch(`/api/articles?search=${encodeURIComponent(value)}`);
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Erreur de recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder="Rechercher un article (nom, référence, code-barres)..."
        debounce={500} // 500ms car appel API
        showClear
        size="lg"
      />

      {loading && (
        <p className="mt-4 text-sm text-gray-500">Recherche en cours...</p>
      )}

      {articles.length > 0 && (
        <div className="mt-4 space-y-2">
          {articles.map(article => (
            <div key={article.id} className="p-3 bg-white border rounded">
              <h3 className="font-medium">{article.name}</h3>
              <p className="text-sm text-gray-500">{article.reference}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 7. État désactivé

```tsx
import { useState } from 'react';
import { SearchBar } from '@/shared/components/SearchBar';

function DisabledStateExample() {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="space-y-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Recherche désactivée..."
        disabled={isLoading}
        showClear
      />

      <button
        onClick={() => setIsLoading(!isLoading)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isLoading ? 'Activer' : 'Désactiver'}
      </button>
    </div>
  );
}
```

## Bonnes pratiques

### ✅ À faire

1. **Utiliser le debounce pour les appels API**
   ```tsx
   <SearchBar
     value={search}
     onChange={handleApiSearch}
     debounce={500} // Évite trop de requêtes
     showClear
   />
   ```

2. **Afficher le bouton clear pour une meilleure UX**
   ```tsx
   <SearchBar
     value={search}
     onChange={setSearch}
     showClear // ✅ Permet d'effacer rapidement
   />
   ```

3. **Utiliser des placeholders descriptifs**
   ```tsx
   <SearchBar
     placeholder="Rechercher par nom, email ou téléphone..."
     // ✅ L'utilisateur sait quoi chercher
   />
   ```

4. **Gérer les états de chargement**
   ```tsx
   <SearchBar
     value={search}
     onChange={handleSearch}
     disabled={isLoading}
     placeholder={isLoading ? 'Chargement...' : 'Rechercher...'}
   />
   ```

### ❌ À éviter

1. **Ne pas utiliser de debounce avec des appels API**
   ```tsx
   // ❌ Mauvais : Trop d'appels API
   <SearchBar value={search} onChange={callApi} />
   
   // ✅ Bon : Debounce de 300-500ms
   <SearchBar value={search} onChange={callApi} debounce={500} />
   ```

2. **Oublier le bouton clear**
   ```tsx
   // ❌ L'utilisateur doit tout effacer manuellement
   <SearchBar value={search} onChange={setSearch} />
   
   // ✅ Avec bouton clear
   <SearchBar value={search} onChange={setSearch} showClear />
   ```

3. **Debounce trop long**
   ```tsx
   // ❌ L'utilisateur attend trop longtemps
   <SearchBar debounce={2000} />
   
   // ✅ 300-500ms max
   <SearchBar debounce={300} />
   ```

## Accessibilité

Le composant **SearchBar** est accessible par défaut :

- ✅ **ARIA labels** : `aria-label` sur l'input et le bouton clear
- ✅ **Navigation clavier** : Tab, Enter, Escape
- ✅ **États visuels** : Focus, disabled, hover
- ✅ **Contraste** : Couleurs conformes WCAG AA

### Améliorations possibles

Pour améliorer encore l'accessibilité :

```tsx
<div role="search">
  <SearchBar
    value={search}
    onChange={setSearch}
    placeholder="Rechercher des articles"
    showClear
  />
</div>
```

## Performance

### Comparaison avec/sans debounce

**Sans debounce (0ms) :**
- Utilisateur tape "react" (5 lettres)
- 5 appels à `onChange`
- Si chaque appel = requête API → 5 requêtes
- ❌ Gaspillage de ressources

**Avec debounce (300ms) :**
- Utilisateur tape "react" (5 lettres)
- 1 seul appel à `onChange` (300ms après avoir fini)
- 1 seule requête API
- ✅ Optimal

### Recommandations

| Cas d'usage | Debounce recommandé |
|-------------|-------------------|
| Filtrage côté client (< 100 items) | 0ms (instant) |
| Filtrage côté client (> 100 items) | 200-300ms |
| Recherche API simple | 300-400ms |
| Recherche API complexe/coûteuse | 500-600ms |
| Recherche avec autocomplétion | 250-350ms |

## Variations courantes

### Avec icône personnalisée

Si besoin d'une icône différente, créer un composant dérivé :

```tsx
function CustomIconSearchBar(props: SearchBarProps) {
  // Copier le code de SearchBar et modifier l'icône
}
```

### Avec résultats en dropdown

Combiner avec un composant Dropdown pour de l'autocomplétion :

```tsx
function SearchWithDropdown() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  return (
    <div className="relative">
      <SearchBar
        value={search}
        onChange={setSearch}
        debounce={300}
        showClear
      />
      {results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border rounded shadow-lg">
          {/* Résultats */}
        </div>
      )}
    </div>
  );
}
```

## Support navigateurs

✅ Tous les navigateurs modernes (Chrome, Firefox, Safari, Edge)

## Dépendances

- React 18+
- Fonction utilitaire `cn` (design tokens)

## Migration

Si vous utilisez actuellement des inputs de recherche custom :

```tsx
// Avant
<div className="relative">
  <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="..."
  />
</div>

// Après
<SearchBar
  value={search}
  onChange={setSearch}
  debounce={300}
  showClear
/>
```

**Avantages :**
- 60+ lignes de code en moins
- Debounce intégré
- Bouton clear gratuit
- Styles cohérents
- Accessible