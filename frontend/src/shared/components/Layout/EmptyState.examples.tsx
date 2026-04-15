/**
 * EmptyState Component - Exemples
 *
 * Galerie complète de tous les variants et cas d'usage du composant EmptyState.
 * Ces exemples servent de documentation visuelle et de référence pour l'implémentation.
 */

import { useState } from 'react';
import { EmptyState } from './EmptyState';
import {
  UsersIcon,
  InboxIcon,
  SearchIcon,
  FileIcon,
  CalendarAltIcon,
  MoneyBillIcon,
} from '@patternfly/react-icons';

// ─── EXEMPLE 1 : BASIQUE ────────────────────────────────────────────────────

export function BasicEmptyState() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">État Vide Basique</h2>
      <p className="text-gray-600">
        Exemple minimaliste avec uniquement titre et description.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <EmptyState
          title="Aucune donnée disponible"
          description="Les données apparaîtront ici une fois configurées."
        />
      </div>
    </div>
  );
}

// ─── EXEMPLE 2 : AVEC ICÔNE ─────────────────────────────────────────────────

export function WithIcon() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">État Vide avec Icône</h2>
      <p className="text-gray-600">
        Ajout d'une icône pour améliorer la compréhension visuelle.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Membres</h3>
          <EmptyState
            icon={<UsersIcon />}
            title="Aucun membre"
            description="Votre club ne contient aucun membre pour le moment."
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Documents</h3>
          <EmptyState
            icon={<FileIcon />}
            title="Aucun document"
            description="Aucun document n'a été téléchargé dans cette section."
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Événements</h3>
          <EmptyState
            icon={<CalendarAltIcon />}
            title="Aucun événement"
            description="Aucun événement n'est prévu pour le moment."
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Paiements</h3>
          <EmptyState
            icon={<MoneyBillIcon />}
            title="Aucun paiement"
            description="Aucun paiement n'a été enregistré cette année."
          />
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 3 : AVEC ACTION ────────────────────────────────────────────────

export function WithAction() {
  const [members, setMembers] = useState<string[]>([]);

  const handleAddMember = () => {
    const newMember = `Membre ${members.length + 1}`;
    setMembers([...members, newMember]);
    console.log('Ajout d\'un nouveau membre:', newMember);
  };

  const handleReset = () => {
    setMembers([]);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">État Vide avec Action</h2>
      <p className="text-gray-600">
        Bouton d'action pour guider l'utilisateur vers la création de contenu.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700">Liste des membres</h3>
          {members.length > 0 && (
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {members.length === 0 ? (
          <EmptyState
            icon={<UsersIcon />}
            title="Aucun membre"
            description="Commencez par ajouter votre premier membre au club."
            action={{
              label: 'Ajouter un membre',
              onClick: handleAddMember,
            }}
          />
        ) : (
          <div className="space-y-2">
            {members.map((member, index) => (
              <div
                key={index}
                className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700"
              >
                {member}
              </div>
            ))}
            <button
              onClick={handleAddMember}
              className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Ajouter un autre membre
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EXEMPLE 4 : VARIANT DASHED ─────────────────────────────────────────────

export function DashedVariant() {
  const handleUpload = () => {
    console.log('Ouverture de la boîte de dialogue de téléchargement...');
    alert('Fonctionnalité de téléchargement (démo)');
  };

  const handleCreate = () => {
    console.log('Création d\'un nouveau document...');
    alert('Création de document (démo)');
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Variant Dashed</h2>
      <p className="text-gray-600">
        Bordure en pointillés pour les zones interactives (upload, drag & drop, création).
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Zone de téléchargement
          </h3>
          <EmptyState
            variant="dashed"
            icon={<FileIcon />}
            title="Aucun fichier"
            description="Glissez-déposez vos fichiers ici ou cliquez pour parcourir."
            action={{
              label: 'Parcourir les fichiers',
              onClick: handleUpload,
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Nouvelle création
          </h3>
          <EmptyState
            variant="dashed"
            icon={<CalendarAltIcon />}
            title="Créer un événement"
            description="Planifiez votre premier événement pour le club."
            action={{
              label: 'Créer un événement',
              onClick: handleCreate,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 5 : RECHERCHE SANS RÉSULTATS ───────────────────────────────────

export function NoDataFound() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Simuler une base de données de membres
  const allMembers = [
    'Jean Dupont',
    'Marie Martin',
    'Pierre Durand',
    'Sophie Bernard',
    'Luc Petit',
  ];

  const filteredMembers = allMembers.filter((member) =>
    member.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Recherche Sans Résultats</h2>
      <p className="text-gray-600">
        Affichage d'un état vide lorsqu'une recherche ne retourne aucun résultat.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Rechercher un membre
        </h3>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Rechercher
            </button>
            {hasSearched && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Effacer
              </button>
            )}
          </div>
        </form>

        {!hasSearched ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Utilisez le champ de recherche ci-dessus pour trouver un membre.
          </div>
        ) : filteredMembers.length === 0 ? (
          <EmptyState
            icon={<SearchIcon />}
            title="Aucun résultat trouvé"
            description={`Aucun membre ne correspond à "${searchQuery}". Essayez d'autres mots-clés.`}
          />
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-3">
              {filteredMembers.length} résultat(s) trouvé(s)
            </p>
            {filteredMembers.map((member, index) => (
              <div
                key={index}
                className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 flex items-center gap-2"
              >
                <UsersIcon className="h-4 w-4 text-gray-400" />
                {member}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EXEMPLE 6 : BOÎTE DE RÉCEPTION VIDE ────────────────────────────────────

export function EmptyInbox() {
  const [messages, setMessages] = useState<Array<{ id: number; text: string }>>([]);

  const handleSendMessage = () => {
    const newMessage = {
      id: messages.length + 1,
      text: `Message ${messages.length + 1} - ${new Date().toLocaleTimeString()}`,
    };
    setMessages([...messages, newMessage]);
  };

  const handleClearAll = () => {
    setMessages([]);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Boîte de Réception Vide</h2>
      <p className="text-gray-600">
        État vide positif pour une boîte de réception ou une liste de notifications.
      </p>

      <div className="bg-white rounded-lg shadow-sm max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700">Messages</h3>
          <div className="flex gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700 underline"
              >
                Tout supprimer
              </button>
            )}
            <button
              onClick={handleSendMessage}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
            >
              Simuler un message
            </button>
          </div>
        </div>

        <div className="p-6">
          {messages.length === 0 ? (
            <EmptyState
              icon={<InboxIcon />}
              title="Boîte de réception vide"
              description="Vous n'avez aucun message. Profitez de ce moment de calme !"
            />
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-gray-700"
                >
                  {message.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 7 : COMPARAISON DES VARIANTS ───────────────────────────────────

export function VariantsComparison() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Comparaison des Variants</h2>
      <p className="text-gray-600">
        Comparaison côte à côte des deux variants disponibles.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Variant Default</h3>
          <p className="text-xs text-gray-500">
            Bordure pleine - Idéal pour les listes vides standards
          </p>
          <EmptyState
            variant="default"
            icon={<UsersIcon />}
            title="Variant Default"
            description="Bordure pleine (border-gray-200) pour un style classique."
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Variant Dashed</h3>
          <p className="text-xs text-gray-500">
            Bordure pointillés - Idéal pour les zones interactives
          </p>
          <EmptyState
            variant="dashed"
            icon={<UsersIcon />}
            title="Variant Dashed"
            description="Bordure en pointillés (border-dashed) pour suggérer une interaction."
          />
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 8 : PERSONNALISATION ───────────────────────────────────────────

export function CustomStyling() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Personnalisation</h2>
      <p className="text-gray-600">
        Exemples de personnalisation avec la prop className.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Fond coloré
          </h3>
          <EmptyState
            icon={<InboxIcon />}
            title="Zone d'information"
            description="État vide avec un fond bleu clair."
            className="bg-blue-50 border-blue-200"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Padding réduit
          </h3>
          <EmptyState
            icon={<FileIcon />}
            title="Compact"
            description="État vide avec moins de padding vertical."
            className="py-6"
          />
        </div>
      </div>
    </div>
  );
}

// ─── GALERIE COMPLÈTE ───────────────────────────────────────────────────────

export default function EmptyStateExamples() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 space-y-12">
        <div className="px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            EmptyState Component - Exemples
          </h1>
          <p className="text-lg text-gray-600">
            Galerie complète de tous les variants et cas d'usage du composant EmptyState
          </p>
        </div>

        <BasicEmptyState />
        <WithIcon />
        <WithAction />
        <DashedVariant />
        <NoDataFound />
        <EmptyInbox />
        <VariantsComparison />
        <CustomStyling />

        {/* Footer */}
        <div className="px-6 py-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Pour plus d'informations, consultez la documentation EmptyState.md
          </p>
        </div>
      </div>
    </div>
  );
}
