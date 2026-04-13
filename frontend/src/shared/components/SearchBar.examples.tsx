import { useState } from "react";
import { SearchBar } from "./SearchBar";

/**
 * Exemples d'utilisation du composant SearchBar
 */

// ============================================================================
// 1. Recherche basique sans debounce
// ============================================================================
export function BasicSearchBar() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">1. Recherche basique</h3>
      <p className="text-sm text-gray-600">
        Recherche instantanée sans debounce (onChange appelé à chaque frappe)
      </p>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Rechercher..."
      />

      <div className="text-sm text-gray-500">
        Valeur actuelle :{" "}
        <code className="bg-gray-100 px-2 py-1 rounded">
          {search || "(vide)"}
        </code>
      </div>
    </div>
  );
}

// ============================================================================
// 2. Avec debounce (recommandé)
// ============================================================================
export function WithDebounce() {
  const [search, setSearch] = useState("");
  const [callCount, setCallCount] = useState(0);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCallCount((prev) => prev + 1);
    console.log("onChange appelé avec:", value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">2. Avec debounce (300ms)</h3>
      <p className="text-sm text-gray-600">
        Le callback onChange n'est appelé que 300ms après que l'utilisateur a
        arrêté de taper
      </p>

      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder="Tapez quelque chose..."
        debounce={300}
        showClear
      />

      <div className="space-y-2 text-sm">
        <div className="text-gray-500">
          Valeur :{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">
            {search || "(vide)"}
          </code>
        </div>
        <div className="text-blue-600">
          Nombre d'appels onChange : <strong>{callCount}</strong>
        </div>
        <p className="text-xs text-gray-400">
          💡 Essayez de taper rapidement - le compteur n'augmente que quand vous
          arrêtez
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// 3. Les trois tailles
// ============================================================================
export function AllSizes() {
  const [searchSm, setSearchSm] = useState("");
  const [searchMd, setSearchMd] = useState("");
  const [searchLg, setSearchLg] = useState("");

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">3. Les trois tailles</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Small (sm)
          </label>
          <SearchBar
            value={searchSm}
            onChange={setSearchSm}
            size="sm"
            placeholder="Petite barre de recherche"
            showClear
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medium (md) - défaut
          </label>
          <SearchBar
            value={searchMd}
            onChange={setSearchMd}
            size="md"
            placeholder="Barre de recherche moyenne"
            showClear
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Large (lg)
          </label>
          <SearchBar
            value={searchLg}
            onChange={setSearchLg}
            size="lg"
            placeholder="Grande barre de recherche"
            showClear
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. Avec bouton Clear
// ============================================================================
export function WithClearButton() {
  const [search, setSearch] = useState("Texte par défaut");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">4. Avec bouton Clear</h3>
      <p className="text-sm text-gray-600">
        Le bouton (X) apparaît quand il y a du texte et permet d'effacer
        rapidement
      </p>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Tapez quelque chose..."
        showClear
        debounce={300}
      />

      <div className="text-sm text-gray-500">
        Valeur :{" "}
        <code className="bg-gray-100 px-2 py-1 rounded">
          {search || "(vide)"}
        </code>
      </div>

      <p className="text-xs text-gray-400">
        💡 Cliquez sur le (X) pour effacer la recherche
      </p>
    </div>
  );
}

// ============================================================================
// 5. Filtrage de liste en temps réel
// ============================================================================
export function FilteringList() {
  const [search, setSearch] = useState("");

  const fruits = [
    "Apple",
    "Apricot",
    "Banana",
    "Blackberry",
    "Blueberry",
    "Cherry",
    "Cranberry",
    "Date",
    "Elderberry",
    "Fig",
    "Grape",
    "Grapefruit",
    "Honeydew",
    "Kiwi",
    "Lemon",
    "Lime",
    "Mango",
    "Orange",
    "Papaya",
    "Peach",
    "Pear",
    "Pineapple",
    "Plum",
    "Raspberry",
    "Strawberry",
    "Watermelon",
  ];

  const filtered = fruits.filter((fruit) =>
    fruit.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">5. Filtrage de liste</h3>
      <p className="text-sm text-gray-600">
        Exemple de filtrage en temps réel d'une liste de fruits
      </p>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Rechercher un fruit..."
        debounce={300}
        showClear
      />

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <p className="text-sm font-medium text-gray-700">
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""} trouvé
            {filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <ul className="divide-y max-h-64 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((fruit) => (
              <li key={fruit} className="px-4 py-2 hover:bg-gray-50">
                {fruit}
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-gray-500">
              Aucun fruit trouvé
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// 6. Recherche d'articles (exemple StorePage)
// ============================================================================
interface Article {
  id: number;
  name: string;
  reference: string;
  price: number;
  stock: number;
}

export function ArticleSearch() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Données fictives d'articles
  const allArticles: Article[] = [
    {
      id: 1,
      name: "Ballon de football",
      reference: "BAL-001",
      price: 25.99,
      stock: 15,
    },
    {
      id: 2,
      name: "Ballon de basketball",
      reference: "BAL-002",
      price: 29.99,
      stock: 8,
    },
    {
      id: 3,
      name: "Raquette de tennis",
      reference: "RAQ-001",
      price: 89.99,
      stock: 5,
    },
    {
      id: 4,
      name: "Balle de tennis (x3)",
      reference: "BAL-003",
      price: 12.5,
      stock: 25,
    },
    {
      id: 5,
      name: "Chaussures de foot",
      reference: "CHA-001",
      price: 79.99,
      stock: 12,
    },
    {
      id: 6,
      name: "Short de sport",
      reference: "VET-001",
      price: 24.99,
      stock: 20,
    },
    {
      id: 7,
      name: "Maillot équipe A",
      reference: "VET-002",
      price: 34.99,
      stock: 18,
    },
    {
      id: 8,
      name: "Gourde 750ml",
      reference: "ACC-001",
      price: 15.99,
      stock: 30,
    },
  ];

  const handleSearch = (value: string) => {
    setSearch(value);
    // Simuler un appel API
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  const filtered = search.trim()
    ? allArticles.filter(
        (article) =>
          article.name.toLowerCase().includes(search.toLowerCase()) ||
          article.reference.toLowerCase().includes(search.toLowerCase()),
      )
    : allArticles;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">6. Recherche d'articles</h3>
      <p className="text-sm text-gray-600">
        Recherche par nom ou référence avec debounce pour optimiser les
        performances
      </p>

      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder="Rechercher un article (nom ou référence)..."
        debounce={500}
        showClear
        size="lg"
      />

      {loading && (
        <div className="text-sm text-blue-600 animate-pulse">
          Recherche en cours...
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((article) => (
          <div
            key={article.id}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{article.name}</h4>
                <p className="text-sm text-gray-500">
                  Réf: {article.reference}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {article.price.toFixed(2)} €
                </p>
                <p className="text-sm text-gray-500">Stock: {article.stock}</p>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun article trouvé pour "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 7. Soumission sur Enter
// ============================================================================
export function OnEnterSubmit() {
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState<string[]>([]);

  const handleSubmit = () => {
    if (search.trim()) {
      setSubmitted((prev) => [search, ...prev].slice(0, 5));
      setSearch("");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">7. Soumission sur Enter</h3>
      <p className="text-sm text-gray-600">
        Tapez quelque chose et appuyez sur Enter pour soumettre
      </p>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Tapez et appuyez sur Enter..."
        onEnter={handleSubmit}
        showClear
      />

      {submitted.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Historique des recherches :
          </h4>
          <ul className="space-y-1">
            {submitted.map((item, index) => (
              <li key={index} className="text-sm text-gray-600">
                {index + 1}. {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-400">
        💡 Appuyez sur Enter pour ajouter à l'historique
      </p>
    </div>
  );
}

// ============================================================================
// 8. État désactivé
// ============================================================================
export function DisabledState() {
  const [search, setSearch] = useState("Recherche désactivée");
  const [isDisabled, setIsDisabled] = useState(true);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">8. État désactivé</h3>
      <p className="text-sm text-gray-600">
        Utile pendant le chargement de données ou quand la recherche n'est pas
        disponible
      </p>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Recherche désactivée..."
        disabled={isDisabled}
        showClear
      />

      <button
        onClick={() => setIsDisabled(!isDisabled)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        {isDisabled ? "Activer la recherche" : "Désactiver la recherche"}
      </button>

      <div className="text-sm text-gray-500">
        État : <strong>{isDisabled ? "Désactivé" : "Activé"}</strong>
      </div>
    </div>
  );
}

// ============================================================================
// 9. Comparaison avec/sans debounce
// ============================================================================
export function ControlledVsDebounced() {
  const [searchInstant, setSearchInstant] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [instantCallCount, setInstantCallCount] = useState(0);
  const [debouncedCallCount, setDebouncedCallCount] = useState(0);

  const handleInstantChange = (value: string) => {
    setSearchInstant(value);
    setInstantCallCount((prev) => prev + 1);
  };

  const handleDebouncedChange = (value: string) => {
    setSearchDebounced(value);
    setDebouncedCallCount((prev) => prev + 1);
  };

  const reset = () => {
    setSearchInstant("");
    setSearchDebounced("");
    setInstantCallCount(0);
    setDebouncedCallCount(0);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        9. Comparaison avec/sans debounce
      </h3>
      <p className="text-sm text-gray-600">
        Comparez le nombre d'appels onChange entre une recherche instantanée et
        une recherche avec debounce
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sans debounce */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">❌ Sans debounce</h4>
          <SearchBar
            value={searchInstant}
            onChange={handleInstantChange}
            placeholder="Tapez quelque chose..."
            showClear
          />
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
            <p className="text-red-800">
              Appels onChange :{" "}
              <strong className="text-xl">{instantCallCount}</strong>
            </p>
            <p className="text-red-600 text-xs mt-1">
              Chaque frappe = 1 appel (peut surcharger le serveur)
            </p>
          </div>
        </div>

        {/* Avec debounce */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            ✅ Avec debounce (300ms)
          </h4>
          <SearchBar
            value={searchDebounced}
            onChange={handleDebouncedChange}
            placeholder="Tapez quelque chose..."
            debounce={300}
            showClear
          />
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
            <p className="text-green-800">
              Appels onChange :{" "}
              <strong className="text-xl">{debouncedCallCount}</strong>
            </p>
            <p className="text-green-600 text-xs mt-1">
              Appel seulement 300ms après la dernière frappe
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div className="text-sm text-gray-600">
          Économie d'appels :
          <strong className="text-blue-600 ml-2">
            {instantCallCount > 0
              ? `${Math.round((1 - debouncedCallCount / instantCallCount) * 100)}%`
              : "0%"}
          </strong>
        </div>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Réinitialiser
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
        <p className="font-medium text-blue-900 mb-2">💡 Conseil</p>
        <p className="text-blue-700">
          Tapez rapidement "hello world" dans les deux champs et observez la
          différence ! Le debounce peut réduire de 80-90% le nombre d'appels
          API.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Composant principal pour afficher tous les exemples
// ============================================================================
export function SearchBarExamples() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          SearchBar - Exemples
        </h1>
        <p className="text-gray-600">
          Collection d'exemples d'utilisation du composant SearchBar
        </p>
      </div>

      <div className="space-y-12 divide-y">
        <BasicSearchBar />
        <div className="pt-12">
          <WithDebounce />
        </div>
        <div className="pt-12">
          <AllSizes />
        </div>
        <div className="pt-12">
          <WithClearButton />
        </div>
        <div className="pt-12">
          <FilteringList />
        </div>
        <div className="pt-12">
          <ArticleSearch />
        </div>
        <div className="pt-12">
          <OnEnterSubmit />
        </div>
        <div className="pt-12">
          <DisabledState />
        </div>
        <div className="pt-12">
          <ControlledVsDebounced />
        </div>
      </div>
    </div>
  );
}

export default SearchBarExamples;
