import React, { useState } from 'react';
import { PaginationBar } from './PaginationBar';

/**
 * Exemples d'utilisation du composant PaginationBar
 */

// Exemple 1: Pagination basique avec 10 pages
export const BasicPagination: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Liste des membres</h3>
          <div className="space-y-2">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                Membre {(currentPage - 1) * 10 + i + 1}
              </div>
            ))}
          </div>
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded">
        <strong>Page actuelle :</strong> {currentPage} / {totalPages}
      </div>
    </div>
  );
};

// Exemple 2: Pagination avec affichage du nombre de résultats
export const WithResultsCount: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const total = 100;
  const totalPages = Math.ceil(total / pageSize);

  const startResult = (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, total);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Liste des événements</h3>
          <div className="space-y-2">
            {Array.from({ length: Math.min(pageSize, total - (currentPage - 1) * pageSize) }, (_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                Événement #{startResult + i} - {new Date(2024, 0, startResult + i).toLocaleDateString('fr-FR')}
              </div>
            ))}
          </div>
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showResultsCount
          total={total}
          pageSize={pageSize}
        />
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded">
        <strong>Affichage :</strong> {startResult} à {endResult} sur {total} résultats
      </div>
    </div>
  );
};

// Exemple 3: Pagination avec de nombreuses pages (teste les ellipses)
export const ManyPages: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(7);
  const pageSize = 20;
  const total = 1000;
  const totalPages = Math.ceil(total / pageSize); // 50 pages

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Liste des transactions</h3>
          <p className="text-sm text-gray-600 mb-4">
            Cet exemple montre le comportement des ellipses avec {totalPages} pages
          </p>
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200 flex justify-between">
                <span>Transaction #{(currentPage - 1) * pageSize + i + 1}</span>
                <span className="text-green-600 font-semibold">+125.00 €</span>
              </div>
            ))}
          </div>
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showResultsCount
          total={total}
          pageSize={pageSize}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded">
          <strong>Page actuelle :</strong> {currentPage} / {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Aller à la page 1
          </button>
          <button
            onClick={() => setCurrentPage(25)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Aller au milieu (25)
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Aller à la fin ({totalPages})
          </button>
        </div>
      </div>
    </div>
  );
};

// Exemple 4: Première page (bouton précédent désactivé)
export const FirstPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const total = 247;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Première page - Bouton "Précédent" désactivé</h3>
          <div className="space-y-2">
            {Array.from({ length: pageSize }, (_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-medium">Membre {i + 1}</div>
                    <div className="text-sm text-gray-500">membre{i + 1}@club.fr</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showResultsCount
          total={total}
          pageSize={pageSize}
        />
      </div>

      <div className="text-sm text-gray-600 bg-yellow-50 p-4 rounded border border-yellow-200">
        <strong>Note :</strong> Le bouton "Précédent" est désactivé car vous êtes sur la première page.
        Testez en mode mobile pour voir le comportement responsive !
      </div>
    </div>
  );
};

// Exemple 5: Dernière page (bouton suivant désactivé)
export const LastPage: React.FC = () => {
  const pageSize = 15;
  const total = 247;
  const totalPages = Math.ceil(total / pageSize); // 17 pages
  const [currentPage, setCurrentPage] = useState(totalPages);

  const itemsOnLastPage = total % pageSize || pageSize; // 7 items sur la dernière page

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Dernière page - Bouton "Suivant" désactivé</h3>
          <div className="space-y-2">
            {Array.from({ length: itemsOnLastPage }, (_, i) => {
              const itemNumber = (currentPage - 1) * pageSize + i + 1;
              return (
                <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-semibold text-green-600">
                      {itemNumber}
                    </div>
                    <div>
                      <div className="font-medium">Membre {itemNumber}</div>
                      <div className="text-sm text-gray-500">Dernier groupe d'éléments</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showResultsCount
          total={total}
          pageSize={pageSize}
        />
      </div>

      <div className="text-sm text-gray-600 bg-yellow-50 p-4 rounded border border-yellow-200">
        <strong>Note :</strong> Le bouton "Suivant" est désactivé car vous êtes sur la dernière page.
        Seuls {itemsOnLastPage} éléments sont affichés (au lieu de {pageSize}).
      </div>
    </div>
  );
};

// Exemple 6: Pagination personnalisée (taille de page variable)
export const CustomPageSize: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const total = 500;
  const totalPages = Math.ceil(total / pageSize);

  // Réinitialiser à la page 1 si le changement de taille invalide la page actuelle
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    const newTotalPages = Math.ceil(total / newSize);
    if (currentPage > newTotalPages) {
      setCurrentPage(1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Configuration personnalisée</h3>
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm text-gray-600">
                Éléments par page :
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: Math.min(pageSize, total - (currentPage - 1) * pageSize) }, (_, i) => {
              const itemNumber = (currentPage - 1) * pageSize + i + 1;
              return (
                <div key={i} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 text-center">
                  <div className="text-2xl font-bold text-blue-600">#{itemNumber}</div>
                  <div className="text-xs text-gray-600 mt-1">Article</div>
                </div>
              );
            })}
          </div>
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showResultsCount
          total={total}
          pageSize={pageSize}
        />
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded">
        <strong>Configuration actuelle :</strong> {pageSize} éléments/page, {totalPages} pages totales
      </div>
    </div>
  );
};

// Exemple 7: Une seule page (pas de pagination nécessaire)
export const SinglePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const total = 8;
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize); // 1 page

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Une seule page disponible</h3>
          <div className="space-y-2">
            {Array.from({ length: total }, (_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                Élément {i + 1}
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showResultsCount
            total={total}
            pageSize={pageSize}
          />
        )}

        {totalPages <= 1 && (
          <div className="border-t border-gray-200 px-6 py-4 text-sm text-gray-500 text-center">
            Tous les résultats sont affichés ({total} éléments)
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600 bg-yellow-50 p-4 rounded border border-yellow-200">
        <strong>Bonne pratique :</strong> Ne pas afficher la pagination s'il n'y a qu'une seule page.
        Dans cet exemple, la pagination est masquée car totalPages = {totalPages}.
      </div>
    </div>
  );
};

// Composant wrapper pour afficher tous les exemples
export const AllPaginationExamples: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PaginationBar - Exemples</h1>
          <p className="text-gray-600">
            Exemples d'utilisation du composant de pagination réutilisable
          </p>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Pagination basique (10 pages)</h2>
          <BasicPagination />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Avec affichage du nombre de résultats</h2>
          <WithResultsCount />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Nombreuses pages (50 pages - Ellipses)</h2>
          <ManyPages />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Première page</h2>
          <FirstPage />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Dernière page</h2>
          <LastPage />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Taille de page personnalisée</h2>
          <CustomPageSize />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Une seule page</h2>
          <SinglePage />
        </section>
      </div>
    </div>
  );
};

export default AllPaginationExamples;
