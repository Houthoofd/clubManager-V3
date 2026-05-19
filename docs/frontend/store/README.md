# Store Components

Ce dossier contient les composants réutilisables du module Store.

## Modals disponibles

### 1. ArticleModal

Modal pour créer ou éditer un article du catalogue.

#### Props

```typescript
interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: Article;
  categories: Category[];
  onSubmit: (data: {
    nom: string;
    prix: number;
    description?: string;
    categorie_id?: number;
    actif?: boolean;
  }) => Promise<void>;
}
```

#### Exemple d'utilisation

```tsx
import { useState } from 'react';
import { ArticleModal } from '@/features/store/components';
import type { Article, Category } from '@/features/store/api/storeApi';

function ArticlesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | undefined>();
  const categories: Category[] = []; // À récupérer depuis votre store/API

  // Création d'un nouvel article
  const handleCreateArticle = async (data) => {
    try {
      await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      // Rafraîchir la liste des articles
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      throw error; // Le modal gérera l'erreur
    }
  };

  // Modification d'un article existant
  const handleUpdateArticle = async (data) => {
    if (!selectedArticle) return;
    try {
      await fetch(`/api/articles/${selectedArticle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      // Rafraîchir la liste des articles
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      throw error;
    }
  };

  const openCreateModal = () => {
    setSelectedArticle(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  return (
    <div>
      <button onClick={openCreateModal}>Nouvel article</button>

      {/* Liste des articles */}
      {/* ... */}

      <ArticleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        article={selectedArticle}
        categories={categories}
        onSubmit={selectedArticle ? handleUpdateArticle : handleCreateArticle}
      />
    </div>
  );
}
```

---

### 2. StockAdjustModal

Modal pour ajuster le stock d'un article (ajouter ou retirer des quantités).

#### Props

```typescript
interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock;
  onSubmit: (data: {
    quantite: number;
    motif?: string;
  }) => Promise<void>;
}
```

#### Exemple d'utilisation

```tsx
import { useState } from 'react';
import { StockAdjustModal } from '@/features/store/components';
import type { Stock } from '@/features/store/api/storeApi';

function StockManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const handleAdjustStock = async (data: { quantite: number; motif?: string }) => {
    if (!selectedStock) return;
    
    try {
      await fetch(`/api/stocks/${selectedStock.id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      // Rafraîchir la liste des stocks
    } catch (error) {
      console.error('Erreur lors de l\'ajustement:', error);
      throw error;
    }
  };

  const openAdjustModal = (stock: Stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
  };

  return (
    <div>
      {/* Liste des stocks */}
      {/* ... */}
      
      {selectedStock && (
        <StockAdjustModal
          isOpen={isModalOpen}
          onClose={closeModal}
          stock={selectedStock}
          onSubmit={handleAdjustStock}
        />
      )}
    </div>
  );
}
```

---

## Fonctionnalités communes

Tous les modals incluent :

- ✅ Validation du formulaire avec react-hook-form
- ✅ Fermeture sur touche Escape (sauf pendant la soumission)
- ✅ Fermeture au clic sur l'overlay (sauf pendant la soumission)
- ✅ Blocage du scroll du body quand le modal est ouvert
- ✅ Spinner sur le bouton de soumission
- ✅ Désactivation des interactions pendant la soumission
- ✅ Accessibilité (ARIA labels, rôles dialog)
- ✅ Design responsive

## Pattern utilisé

Ces modals suivent le même pattern que `PricingPlanFormModal` :

1. **Gestion de l'état** : react-hook-form
2. **Reset du formulaire** : à l'ouverture du modal (useEffect)
3. **Mode édition/création** : détecté via la présence d'une prop (article, plan, etc.)
4. **Soumission** : fonction asynchrone passée en prop
5. **Fermeture automatique** : après soumission réussie
6. **Styling** : Tailwind CSS avec les mêmes classes