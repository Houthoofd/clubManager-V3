/**
 * Exemples d'utilisation des modals QuickOrderModal et OrderDetailModal
 */

import { useState } from "react";
import { QuickOrderModal } from "./QuickOrderModal";
import { OrderDetailModal } from "./OrderDetailModal";
import type { ArticleWithImages, Size, Stock, OrderWithItems } from "../api/storeApi";

// ─── Données mockées ──────────────────────────────────────────────────────────

const mockArticle: ArticleWithImages = {
  id: 1,
  nom: "Maillot domicile 2024",
  description: "Maillot officiel de l'équipe pour la saison 2024",
  prix: 45.0,
  image_url: "https://example.com/maillot.jpg",
  categorie_id: 1,
  categorie_nom: "Maillots",
  actif: true,
  created_at: "2024-01-15T10:00:00Z",
  images: [
    {
      id: 1,
      article_id: 1,
      url: "https://example.com/maillot-front.jpg",
      ordre: 1,
    },
    {
      id: 2,
      article_id: 1,
      url: "https://example.com/maillot-back.jpg",
      ordre: 2,
    },
  ],
};

const mockSizes: Size[] = [
  { id: 1, nom: "S", ordre: 1 },
  { id: 2, nom: "M", ordre: 2 },
  { id: 3, nom: "L", ordre: 3 },
  { id: 4, nom: "XL", ordre: 4 },
];

const mockStocks: Stock[] = [
  {
    id: 1,
    article_id: 1,
    taille_id: 1,
    quantite: 15,
    quantite_minimum: 5,
    stock_disponible: 15,
    article_nom: "Maillot domicile 2024",
    taille_nom: "S",
  },
  {
    id: 2,
    article_id: 1,
    taille_id: 2,
    quantite: 25,
    quantite_minimum: 5,
    stock_disponible: 25,
    article_nom: "Maillot domicile 2024",
    taille_nom: "M",
  },
  {
    id: 3,
    article_id: 1,
    taille_id: 3,
    quantite: 8,
    quantite_minimum: 5,
    stock_disponible: 8,
    article_nom: "Maillot domicile 2024",
    taille_nom: "L",
  },
  {
    id: 4,
    article_id: 1,
    taille_id: 4,
    quantite: 0,
    quantite_minimum: 5,
    stock_disponible: 0,
    article_nom: "Maillot domicile 2024",
    taille_nom: "XL",
    en_rupture: true,
  },
];

const mockOrder: OrderWithItems = {
  id: 1,
  unique_id: "abc123def456",
  numero_commande: "CMD-2024-001",
  user_id: 5,
  total: 90.0,
  date_commande: "2024-01-20T14:30:00Z",
  statut: "en_attente",
  user_first_name: "Jean",
  user_last_name: "Dupont",
  user_email: "jean.dupont@example.com",
  items: [
    {
      id: 1,
      article_id: 1,
      taille_id: 2,
      quantite: 2,
      prix: 45.0,
      article_nom: "Maillot domicile 2024",
      article_image_url: "https://example.com/maillot.jpg",
      taille_nom: "M",
    },
  ],
};

// ─── Exemple 1 : QuickOrderModal ──────────────────────────────────────────────

export function QuickOrderExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (data: {
    items: Array<{
      article_id: number;
      taille_id: number;
      quantite: number;
      prix: number;
    }>;
  }) => {
    console.log("Commande soumise:", data);

    // Simuler l'appel API
    // await storeApi.createOrder(data);

    // Afficher une notification de succès
    alert("Commande créée avec succès !");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Exemple QuickOrderModal</h2>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold mb-2">{mockArticle.nom}</h3>
        <p className="text-sm text-gray-600 mb-2">{mockArticle.description}</p>
        <p className="text-xl font-bold text-blue-600">{mockArticle.prix.toFixed(2)} €</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Commander rapidement
        </button>
      </div>

      <QuickOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        article={mockArticle}
        sizes={mockSizes}
        stocks={mockStocks}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

// ─── Exemple 2 : OrderDetailModal (mode utilisateur) ──────────────────────────

export function OrderDetailUserExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Exemple OrderDetailModal (Mode Utilisateur)
      </h2>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{mockOrder.numero_commande}</h3>
            <p className="text-sm text-gray-600">Total: {mockOrder.total.toFixed(2)} €</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Voir détails
          </button>
        </div>
      </div>

      <OrderDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={mockOrder}
        canManage={false} // Mode utilisateur : pas d'actions admin
      />
    </div>
  );
}

// ─── Exemple 3 : OrderDetailModal (mode admin) ────────────────────────────────

export function OrderDetailAdminExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(mockOrder);

  const handleUpdateStatus = async (id: number, statut: string) => {
    console.log(`Mise à jour du statut de la commande ${id} vers ${statut}`);

    // Simuler l'appel API
    // await storeApi.updateOrderStatus(id, statut);

    // Mettre à jour l'état local
    setCurrentOrder({ ...currentOrder, statut: statut as any });

    alert(`Commande mise à jour vers: ${statut}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Exemple OrderDetailModal (Mode Admin)
      </h2>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{currentOrder.numero_commande}</h3>
            <p className="text-sm text-gray-600">
              Client: {currentOrder.user_first_name} {currentOrder.user_last_name}
            </p>
            <p className="text-sm text-gray-600">Statut: {currentOrder.statut}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Gérer la commande
          </button>
        </div>
      </div>

      <OrderDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={currentOrder}
        canManage={true} // Mode admin : afficher les actions
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

// ─── Exemple 4 : Utilisation complète dans une page ───────────────────────────

export function StorePageExample() {
  const [quickOrderModalOpen, setQuickOrderModalOpen] = useState(false);
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleWithImages | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);

  const handleQuickOrder = (article: ArticleWithImages) => {
    setSelectedArticle(article);
    setQuickOrderModalOpen(true);
  };

  const handleViewOrder = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setOrderDetailModalOpen(true);
  };

  const handleCreateOrder = async (data: any) => {
    console.log("Nouvelle commande:", data);
    // await storeApi.createOrder(data);
    alert("Commande créée !");
  };

  const handleUpdateOrderStatus = async (id: number, statut: string) => {
    console.log(`Update order ${id} to ${statut}`);
    // await storeApi.updateOrderStatus(id, statut);
    alert(`Statut mis à jour: ${statut}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Boutique</h1>

      {/* Liste des articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">{mockArticle.nom}</h3>
          <p className="text-xl font-bold text-blue-600 mb-3">
            {mockArticle.prix.toFixed(2)} €
          </p>
          <button
            onClick={() => handleQuickOrder(mockArticle)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Commander
          </button>
        </div>
      </div>

      {/* Liste des commandes */}
      <h2 className="text-2xl font-bold mb-4">Mes commandes</h2>
      <div className="space-y-3">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{mockOrder.numero_commande}</h3>
              <p className="text-sm text-gray-600">
                {mockOrder.total.toFixed(2)} € - {mockOrder.statut}
              </p>
            </div>
            <button
              onClick={() => handleViewOrder(mockOrder)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
            >
              Détails
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedArticle && (
        <QuickOrderModal
          isOpen={quickOrderModalOpen}
          onClose={() => {
            setQuickOrderModalOpen(false);
            setSelectedArticle(null);
          }}
          article={selectedArticle}
          sizes={mockSizes}
          stocks={mockStocks}
          onSubmit={handleCreateOrder}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          isOpen={orderDetailModalOpen}
          onClose={() => {
            setOrderDetailModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          canManage={true}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      )}
    </div>
  );
}
