/**
 * Exemples d'intégration des modals Store
 *
 * Ce fichier contient des exemples commentés montrant comment utiliser
 * les modals ArticleModal et StockAdjustModal dans votre application.
 */

import { useState } from "react";
import { ArticleModal, StockAdjustModal } from "./index";
import type { Article, Category, Stock } from "../api/storeApi";

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLE 1 : Gestion des articles (Création & Édition)
// ═══════════════════════════════════════════════════════════════════════════════

export function ArticlesManagementExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | undefined>();

  // Simuler des données - remplacer par votre store/API
  const [articles, setArticles] = useState<Article[]>([
    {
      id: 1,
      nom: "T-shirt Club",
      prix: 25.99,
      description: "T-shirt officiel du club",
      categorie_id: 1,
      categorie_nom: "Vêtements",
      actif: true,
      created_at: new Date().toISOString(),
    },
  ]);

  const categories: Category[] = [
    { id: 1, nom: "Vêtements", ordre: 1 },
    { id: 2, nom: "Accessoires", ordre: 2 },
    { id: 3, nom: "Équipements", ordre: 3 },
  ];

  // ─── Créer un nouvel article ──────────────────────────────────────────────

  const handleCreateArticle = async (data: {
    nom: string;
    prix: number;
    description?: string;
    categorie_id?: number;
    actif?: boolean;
  }) => {
    try {
      // Appel API - exemple avec fetch
      const response = await fetch("/api/store/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création");
      }

      const newArticle = await response.json();

      // Mettre à jour l'état local
      setArticles((prev) => [...prev, newArticle]);

      // Afficher un message de succès (optionnel)
      console.log("Article créé avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      // Le modal ne se fermera pas et l'erreur sera propagée
      throw error;
    }
  };

  // ─── Modifier un article existant ─────────────────────────────────────────

  const handleUpdateArticle = async (data: {
    nom: string;
    prix: number;
    description?: string;
    categorie_id?: number;
    actif?: boolean;
  }) => {
    if (!selectedArticle) return;

    try {
      const response = await fetch(
        `/api/store/articles/${selectedArticle.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la modification");
      }

      const updatedArticle = await response.json();

      // Mettre à jour l'état local
      setArticles((prev) =>
        prev.map((article) =>
          article.id === updatedArticle.id ? updatedArticle : article,
        ),
      );

      console.log("Article modifié avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      throw error;
    }
  };

  // ─── Ouvrir le modal ──────────────────────────────────────────────────────

  const openCreateModal = () => {
    setSelectedArticle(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(undefined);
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Articles</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Nouvel article
        </button>
      </div>

      {/* Liste des articles */}
      <div className="space-y-3">
        {articles.map((article) => (
          <div
            key={article.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{article.nom}</h3>
              <p className="text-sm text-gray-600">{article.prix} €</p>
            </div>
            <button
              onClick={() => openEditModal(article)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Modifier
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      <ArticleModal
        isOpen={isModalOpen}
        onClose={closeModal}
        article={selectedArticle}
        categories={categories}
        onSubmit={selectedArticle ? handleUpdateArticle : handleCreateArticle}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLE 2 : Ajustement de stock
// ═══════════════════════════════════════════════════════════════════════════════

export function StockManagementExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // Simuler des données de stock
  const [stocks, setStocks] = useState<Stock[]>([
    {
      id: 1,
      article_id: 1,
      taille_id: 2,
      quantite: 15,
      quantite_minimum: 5,
      stock_disponible: 15,
      article_nom: "T-shirt Club",
      taille_nom: "M",
      en_rupture: false,
      stock_bas: false,
    },
    {
      id: 2,
      article_id: 1,
      taille_id: 3,
      quantite: 3,
      quantite_minimum: 5,
      stock_disponible: 3,
      article_nom: "T-shirt Club",
      taille_nom: "L",
      en_rupture: false,
      stock_bas: true,
    },
  ]);

  // ─── Ajuster le stock ─────────────────────────────────────────────────────

  const handleAdjustStock = async (data: {
    quantite: number;
    motif?: string;
  }) => {
    if (!selectedStock) return;

    try {
      const response = await fetch(
        `/api/store/stocks/${selectedStock.id}/adjust`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ajustement: data.quantite,
            motif: data.motif,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajustement du stock");
      }

      const updatedStock = await response.json();

      // Mettre à jour l'état local
      setStocks((prev) =>
        prev.map((stock) =>
          stock.id === updatedStock.id ? updatedStock : stock,
        ),
      );

      console.log("Stock ajusté avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      throw error;
    }
  };

  // ─── Ouvrir le modal ──────────────────────────────────────────────────────

  const openAdjustModal = (stock: Stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Stocks</h1>

      {/* Liste des stocks */}
      <div className="space-y-3">
        {stocks.map((stock) => (
          <div
            key={stock.id}
            className="p-4 border rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">
                {stock.article_nom} - {stock.taille_nom}
              </h3>
              <p className="text-sm text-gray-600">
                Stock actuel :{" "}
                <span className="font-medium">{stock.quantite}</span>
              </p>
              {stock.stock_bas && (
                <p className="text-xs text-orange-600 mt-1">⚠️ Stock faible</p>
              )}
              {stock.en_rupture && (
                <p className="text-xs text-red-600 mt-1">❌ Rupture de stock</p>
              )}
            </div>
            <button
              onClick={() => openAdjustModal(stock)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ajuster
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
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

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLE 3 : Intégration avec un store Zustand
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Exemple d'utilisation avec un store Zustand (storeStore.ts)
 */
export function ArticlesWithZustandExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | undefined>();

  // Supposons que vous avez un store Zustand comme celui-ci :
  // import { useStoreStore } from '../stores/storeStore';
  // const { articles, categories, createArticle, updateArticle } = useStoreStore();

  // Pour cet exemple, on simule :
  const categories: Category[] = [];
  const createArticle = async (data: {
    nom: string;
    prix: number;
    description?: string;
    categorie_id?: number;
    actif?: boolean;
  }) => {
    console.log("Creating article:", data);
  };
  const updateArticle = async (
    id: number,
    data: {
      nom: string;
      prix: number;
      description?: string;
      categorie_id?: number;
      actif?: boolean;
    },
  ) => {
    console.log("Updating article:", id, data);
  };

  const handleSubmit = async (data: {
    nom: string;
    prix: number;
    description?: string;
    categorie_id?: number;
    actif?: boolean;
  }) => {
    if (selectedArticle) {
      // Mode édition
      await updateArticle(selectedArticle.id, data);
    } else {
      // Mode création
      await createArticle(data);
    }
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>Nouvel article</button>

      <ArticleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedArticle(undefined);
        }}
        article={selectedArticle}
        categories={categories}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXEMPLE 4 : Gestion d'erreurs avancée
// ═══════════════════════════════════════════════════════════════════════════════

export function ArticlesWithErrorHandlingExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    nom: string;
    prix: number;
    description?: string;
    categorie_id?: number;
    actif?: boolean;
  }) => {
    try {
      setError(null);

      const response = await fetch("/api/store/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur inconnue");
      }

      // Succès - fermeture automatique du modal
      setIsModalOpen(false);
    } catch (err) {
      // Capturer l'erreur et l'afficher
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);

      // Re-throw pour que le modal reste ouvert
      throw err;
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button onClick={() => setIsModalOpen(true)}>Nouvel article</button>

      <ArticleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        categories={[]}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
