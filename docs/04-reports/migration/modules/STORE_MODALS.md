# Modals du module Store

Documentation des composants modaux pour la gestion de la boutique.

## Table des matières

- [QuickOrderModal](#quickordermodal)
- [OrderDetailModal](#orderdetailmodal)
- [Exemples d'utilisation](#exemples-dutilisation)

---

## QuickOrderModal

Modal pour passer une commande rapide sur un article de la boutique.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Contrôle l'affichage du modal |
| `onClose` | `() => void` | ✅ | Callback appelé à la fermeture |
| `article` | `ArticleWithImages` | ✅ | Article à commander |
| `sizes` | `Size[]` | ✅ | Liste des tailles disponibles |
| `stocks` | `Stock[]` | ✅ | Stocks pour cet article |
| `onSubmit` | `(data) => Promise<void>` | ✅ | Callback de soumission de commande |

### Structure de `onSubmit`

```typescript
onSubmit: (data: {
  items: Array<{
    article_id: number;
    taille_id: number;
    quantite: number;
    prix: number;
  }>;
}) => Promise<void>
```

### Fonctionnalités

- ✅ Affichage de l'image, nom, description et prix de l'article
- ✅ Sélection de la taille (required)
- ✅ Affichage du stock disponible pour la taille sélectionnée
- ✅ Saisie de la quantité avec validation (min: 1, max: stock disponible)
- ✅ Calcul automatique du total (prix × quantité)
- ✅ Validation avec react-hook-form
- ✅ Fermeture sur Escape
- ✅ Blocage du scroll du body
- ✅ État de chargement pendant la soumission

### Validation

- **Taille** : obligatoire
- **Quantité** : 
  - Obligatoire
  - Min : 1
  - Max : stock disponible pour la taille sélectionnée
  - Désactivé si aucune taille sélectionnée ou stock = 0

### Exemple d'utilisation

```tsx
import { QuickOrderModal } from '@/features/store/components';
import { storeApi } from '@/features/store/api/storeApi';

function ArticleCard({ article, sizes, stocks }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOrder = async (data) => {
    await storeApi.createOrder(data);
    toast.success('Commande créée !');
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Commander
      </button>

      <QuickOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        article={article}
        sizes={sizes}
        stocks={stocks}
        onSubmit={handleOrder}
      />
    </>
  );
}
```

---

## OrderDetailModal

Modal de visualisation des détails d'une commande (lecture seule) avec actions administrateur optionnelles.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Contrôle l'affichage du modal |
| `onClose` | `() => void` | ✅ | Callback appelé à la fermeture |
| `order` | `OrderWithItems` | ✅ | Commande à afficher |
| `onUpdateStatus` | `(id, statut) => Promise<void>` | ❌ | Callback pour changer le statut |
| `canManage` | `boolean` | ✅ | Afficher ou non les actions admin |

### Informations affichées

#### En-tête
- Numéro de commande
- Statut (badge coloré via `OrderStatusBadge`)
- Date de commande (format : DD/MM/YYYY HH:mm)

#### Informations client
- Nom complet
- Email

#### Articles commandés (tableau)
- Image miniature (si disponible)
- Nom de l'article
- Taille
- Quantité
- Prix unitaire
- Sous-total

#### Total général
- Calculé automatiquement : Σ (prix × quantité)

### Actions administrateur

Affichées uniquement si `canManage={true}` et `onUpdateStatus` est fourni.

Les boutons disponibles dépendent du statut actuel :

| Statut actuel | Boutons disponibles |
|---------------|---------------------|
| `en_attente` | "Marquer comme payée", "Annuler" |
| `payee` | "Marquer comme expédiée", "Annuler" |
| `expediee` | "Marquer comme livrée", "Annuler" |
| `livree` | *(aucun)* |
| `annulee` | *(aucun)* |

### Statuts disponibles

- `en_attente` : Commande créée, en attente de paiement
- `payee` : Paiement reçu
- `expediee` : Commande envoyée
- `livree` : Commande livrée au client
- `annulee` : Commande annulée

### Exemples d'utilisation

#### Mode utilisateur (lecture seule)

```tsx
import { OrderDetailModal } from '@/features/store/components';

function MyOrders({ orders }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <>
      {orders.map((order) => (
        <div key={order.id}>
          <button onClick={() => setSelectedOrder(order)}>
            Voir détails
          </button>
        </div>
      ))}

      {selectedOrder && (
        <OrderDetailModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          canManage={false} // Pas d'actions admin
        />
      )}
    </>
  );
}
```

#### Mode administrateur (avec gestion)

```tsx
import { OrderDetailModal } from '@/features/store/components';
import { storeApi } from '@/features/store/api/storeApi';

function AdminOrders({ orders, onRefresh }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleUpdateStatus = async (id, statut) => {
    await storeApi.updateOrderStatus(id, statut);
    toast.success(`Commande mise à jour : ${statut}`);
    onRefresh(); // Rafraîchir la liste
  };

  return (
    <>
      {orders.map((order) => (
        <div key={order.id}>
          <button onClick={() => setSelectedOrder(order)}>
            Gérer
          </button>
        </div>
      ))}

      {selectedOrder && (
        <OrderDetailModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          canManage={true} // Afficher les actions admin
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </>
  );
}
```

---

## Composants associés

### OrderStatusBadge

Badge coloré pour afficher le statut d'une commande.

```tsx
import { OrderStatusBadge } from '@/features/store/components';

<OrderStatusBadge statut="en_attente" /> // Jaune
<OrderStatusBadge statut="payee" />      // Bleu
<OrderStatusBadge statut="expediee" />   // Violet
<OrderStatusBadge statut="livree" />     // Vert
<OrderStatusBadge statut="annulee" />    // Rouge
```

---

## Pattern utilisé

Les deux modals suivent le pattern établi dans le projet (cf. `PricingPlanFormModal.tsx`) :

### Caractéristiques communes

- ✅ **react-hook-form** pour la gestion des formulaires
- ✅ **reset()** dans useEffect lors de l'ouverture
- ✅ **Fermeture sur Escape** (sauf pendant chargement)
- ✅ **Blocage du scroll** du body quand modal ouverte
- ✅ **Click overlay** pour fermer (hors chargement)
- ✅ **Structure UI** : fond noir/50, container blanc rounded-2xl
- ✅ **Bouton X** en haut à droite
- ✅ **États de chargement** avec spinner
- ✅ **Accessibilité** : role="dialog", aria-modal, aria-labelledby

### Structure HTML

```html
<div class="fixed inset-0 bg-black/50 z-50" role="dialog">
  <div class="bg-white rounded-2xl shadow-xl">
    <div class="border-b"><!-- En-tête --></div>
    <div class="px-6 py-5"><!-- Contenu --></div>
    <div class="border-t"><!-- Footer / Actions --></div>
  </div>
</div>
```

---

## Types TypeScript

### ArticleWithImages

```typescript
interface ArticleWithImages extends Article {
  images: ArticleImage[];
}
```

### Size

```typescript
interface Size {
  id: number;
  nom: string;
  ordre: number;
}
```

### Stock

```typescript
interface Stock {
  id: number;
  article_id: number;
  taille_id: number;
  quantite: number;
  quantite_minimum: number;
  stock_disponible: number;
  article_nom?: string;
  taille_nom?: string;
  en_rupture?: boolean;
  stock_bas?: boolean;
}
```

### OrderWithItems

```typescript
interface OrderWithItems extends Order {
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  article_id: number;
  taille_id?: number | null;
  quantite: number;
  prix: number;
  article_nom?: string;
  article_image_url?: string | null;
  taille_nom?: string;
}
```

---

## Bonnes pratiques

### Gestion des états

```tsx
// ✅ Bon : État local pour contrôler l'ouverture
const [isModalOpen, setIsModalOpen] = useState(false);

// ✅ Bon : Réinitialiser l'état à la fermeture
const handleClose = () => {
  setIsModalOpen(false);
  setSelectedItem(null); // Nettoyer les données
};
```

### Gestion des erreurs

```tsx
const handleSubmit = async (data) => {
  try {
    await storeApi.createOrder(data);
    toast.success('Commande créée !');
  } catch (error) {
    toast.error('Erreur lors de la création de la commande');
    console.error(error);
  }
};
```

### Performance

```tsx
// ✅ Bon : Retour précoce si modal fermé
if (!isOpen) return null;

// ✅ Bon : Mémoïser les calculs coûteux si nécessaire
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.prix * item.quantite, 0),
  [items]
);
```

---

## Fichiers associés

- `QuickOrderModal.tsx` : Modal de commande rapide
- `OrderDetailModal.tsx` : Modal de détails de commande
- `OrderStatusBadge.tsx` : Badge de statut
- `modal-usage-examples.tsx` : Exemples d'utilisation complets
- `index.ts` : Exports des composants