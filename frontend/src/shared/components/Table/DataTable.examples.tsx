/**
 * DataTable Examples
 *
 * Exemples d'utilisation du composant DataTable avec différentes configurations.
 * Démontre les fonctionnalités : tri, rendu personnalisé, états loading/empty, interactions.
 */

import { useState } from 'react';
import { DataTable } from './DataTable';
import type { Column } from './DataTable';
import { BADGE, BUTTON, cn } from '../../styles/designTokens';

// ─── TYPES DE DONNÉES MOCK ───────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  age: number;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  membership: 'gold' | 'silver' | 'bronze';
  joinDate: string;
  points: number;
  isActive: boolean;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'pending' | 'completed' | 'failed';
}

// ─── COMPOSANTS UTILITAIRES ──────────────────────────────────────────────────

function Badge({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'purple' | 'orange' }) {
  return (
    <span className={cn(BADGE.base, BADGE.variant[variant])}>
      {children}
    </span>
  );
}

function Button({ children, size = 'md', variant = 'primary', onClick }: { children: React.ReactNode; size?: 'xs' | 'sm' | 'md'; variant?: 'primary' | 'secondary' | 'outline' | 'danger'; onClick?: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(BUTTON.base, BUTTON.variant[variant], BUTTON.size[size])}
    >
      {children}
    </button>
  );
}

// ─── DONNÉES MOCK ────────────────────────────────────────────────────────────

const mockUsers: User[] = [
  { id: 1, name: 'Alice Martin', email: 'alice@club.com', role: 'Admin', status: 'active', age: 32 },
  { id: 2, name: 'Bob Dupont', email: 'bob@club.com', role: 'Membre', status: 'active', age: 28 },
  { id: 3, name: 'Claire Bernard', email: 'claire@club.com', role: 'Membre', status: 'inactive', age: 45 },
  { id: 4, name: 'David Rousseau', email: 'david@club.com', role: 'Coach', status: 'active', age: 38 },
  { id: 5, name: 'Emma Petit', email: 'emma@club.com', role: 'Membre', status: 'active', age: 25 },
  { id: 6, name: 'François Moreau', email: 'francois@club.com', role: 'Membre', status: 'inactive', age: 51 },
];

const mockMembers: Member[] = [
  { id: 'M001', firstName: 'Jean', lastName: 'Lefebvre', membership: 'gold', joinDate: '2022-01-15', points: 1250, isActive: true },
  { id: 'M002', firstName: 'Sophie', lastName: 'Garcia', membership: 'silver', joinDate: '2022-03-20', points: 850, isActive: true },
  { id: 'M003', firstName: 'Pierre', lastName: 'Roux', membership: 'bronze', joinDate: '2023-05-10', points: 320, isActive: true },
  { id: 'M004', firstName: 'Marie', lastName: 'Lambert', membership: 'gold', joinDate: '2021-11-05', points: 2100, isActive: false },
  { id: 'M005', firstName: 'Luc', lastName: 'Fontaine', membership: 'silver', joinDate: '2023-01-08', points: 675, isActive: true },
];

const mockTransactions: Transaction[] = [
  { id: 'TRX001', date: '2024-01-15', description: 'Cotisation mensuelle', amount: 50.00, type: 'credit', status: 'completed' },
  { id: 'TRX002', date: '2024-01-14', description: 'Achat équipement', amount: -125.50, type: 'debit', status: 'completed' },
  { id: 'TRX003', date: '2024-01-13', description: 'Remboursement', amount: 30.00, type: 'credit', status: 'pending' },
  { id: 'TRX004', date: '2024-01-12', description: 'Paiement cours', amount: -45.00, type: 'debit', status: 'failed' },
];

// ─── EXEMPLE 1 : TABLEAU SIMPLE ──────────────────────────────────────────────

export function Example1_SimpleTable() {
  const columns: Column<User>[] = [
    { key: 'name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Exemple 1 : Tableau Simple</h3>
        <p className="text-sm text-gray-600">Affichage basique avec colonnes textuelles</p>
      </div>
      <DataTable
        columns={columns}
        data={mockUsers}
        rowKey="id"
      />
    </div>
  );
}

// ─── EXEMPLE 2 : AVEC TRI ────────────────────────────────────────────────────

export function Example2_WithSorting() {
  const columns: Column<User>[] = [
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'age', label: 'Âge', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle', sortable: true },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Exemple 2 : Avec Tri</h3>
        <p className="text-sm text-gray-600">Cliquez sur les en-têtes pour trier (3 états : asc → desc → none)</p>
      </div>
      <DataTable
        columns={columns}
        data={mockUsers}
        rowKey="id"
      />
    </div>
  );
}

// ─── EXEMPLE 3 : RENDU PERSONNALISÉ ──────────────────────────────────────────

export function Example3_CustomRender() {
  const columns: Column<User>[] = [
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Statut',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'neutral'}>
          {value === 'active' ? 'Actif' : 'Inactif'}
        </Badge>
      )
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (value) => {
        const variant = value === 'Admin' ? 'purple' : value === 'Coach' ? 'info' : 'neutral';
        return <Badge variant={variant as any}>{value}</Badge>;
      }
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Exemple 3 : Rendu Personnalisé</h3>
        <p className="text-sm text-gray-600">Utilisation de la prop `render` pour afficher des badges</p>
      </div>
      <DataTable
        columns={columns}
        data={mockUsers}
        rowKey="id"
      />
    </div>
  );
}

// ─── EXEMPLE 4 : AVEC ACTIONS ────────────────────────────────────────────────

export function Example4_WithActions() {
  const handleEdit = (user: User) => {
    alert(`Éditer : ${user.name}`);
  };

  const handleDelete = (user: User) => {
    if (confirm(`Supprimer ${user.name} ?`)) {
      alert('Supprimé !');
    }
  };

  const columns: Column<User>[] = [
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Statut',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'neutral'}>
          {value === 'active' ? 'Actif' : 'Inactif'}
        </Badge>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>
            Éditer
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row)}>
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Exemple 4 : Avec Actions</h3>
        <p className="text-sm text-gray-600">Colonne d'actions avec boutons personnalisés</p>
      </div>
      <DataTable
        columns={columns}
        data={mockUsers}
        rowKey="id"
      />
    </div>
  );
}

// ─── EXEMPLE 5 : CLIC SUR LIGNE ──────────────────────────────────────────────

export function Example5_ClickableRows() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const columns: Column<User>[] = [
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
    {
      key: 'status',
      label: 'Statut',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'neutral'}>
          {value === 'active' ? 'Actif' : 'Inactif'}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Exemple 5 : Lignes Cliquables</h3>
        <p className="text-sm text-gray-600">Cliquez sur une ligne pour voir les détails (navigation clavier supportée)</p>
      </div>
      <DataTable
        columns={columns}
        data={mockUsers}
        rowKey="id"
        onRowClick={(user) => setSelectedUser(user)}
      />
      {selectedUser && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Utilisateur sélectionné :</h4>
          <pre className="text-sm text-blue-800">{JSON.stringify(selectedUser, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

// ─── EXEMPLE 6 : ÉTAT LOADING ────────────────────────────────────────────────

export function Example6_LoadingState() {
  const columns: Column<User>[] = [
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
    { key: 'status', label: 'Statut' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Exemple 6 : État Loading</h3>
        <p className="text-sm text-gray-600">Skeleton loader affiché pendant le chargement</p>
      </div>
      <DataTable
        columns={columns}
        data={[]}
        rowKey="id"
        loading
      />
    </div>
  );
}

// ─── EXEMPLE 7 : ÉTAT VIDE ───────────────────────────────────────────────────

export function Example7_EmptyState() {
  const columns: Column<User>[] = [
    { key: 'name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Exemple 7 : État Vide</h3>
        <p className="text-sm text-gray-600">Message personnalisé quand aucune donnée n'est disponible</p>
      </div>
      <DataTable
        columns={columns}
        data={[]}
        rowKey="id"
        emptyMessage="Aucun utilisateur trouvé. Commencez par en ajouter un !"
      />
    </div>
  );
}

// ─── EXEMPLE 8 : MEMBRES (Cas réel) ──────────────────────────────────────────

export function Example8_MembersTable() {
  const handleViewDetails = (member: Member) => {
    console.log('Voir détails:', member);
  };

  const columns: Column<Member>[] = [
    {
      key: 'id',
      label: 'ID',
      className: 'font-mono text-xs'
    },
    {
      key: 'firstName',
      label: 'Prénom',
      sortable: true
    },
    {
      key: 'lastName',
      label: 'Nom',
      sortable: true
    },
    {
      key: 'membership',
      label: 'Adhésion',
      sortable: true,
      render: (value) => {
        const variants = { gold: 'warning', silver: 'neutral', bronze: 'orange' };
        const labels = { gold: '🥇 Gold', silver: '🥈 Silver', bronze: '🥉 Bronze' };
        return <Badge variant={variants[value] as any}>{labels[value]}</Badge>;
      }
    },
    {
      key: 'points',
      label: 'Points',
      sortable: true,
      className: 'font-semibold text-blue-600'
    },
    {
      key: 'joinDate',
      label: 'Date d\'adhésion',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('fr-FR')
    },
    {
      key: 'isActive',
      label: 'Statut',
      render: (value) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Actif' : 'Inactif'}
        </Badge>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <Button size="sm" variant="outline" onClick={() => handleViewDetails(row)}>
          Détails
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Exemple 8 : Table Membres (Cas Réel)</h3>
        <p className="text-sm text-gray-600">Table complète avec badges, formatage et actions</p>
      </div>
      <DataTable
        columns={columns}
        data={mockMembers}
        rowKey="id"
      />
    </div>
  );
}

// ─── EXEMPLE 9 : TRANSACTIONS ────────────────────────────────────────────────

export function Example9_TransactionsTable() {
  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      label: 'ID',
      className: 'font-mono text-xs'
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true
    },
    {
      key: 'amount',
      label: 'Montant',
      sortable: true,
      className: 'text-right font-mono',
      render: (value) => {
        const isPositive = value >= 0;
        return (
          <span className={isPositive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {isPositive ? '+' : ''}{value.toFixed(2)} €
          </span>
        );
      }
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <Badge variant={value === 'credit' ? 'success' : 'info'}>
          {value === 'credit' ? 'Crédit' : 'Débit'}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value) => {
        const variants = { completed: 'success', pending: 'warning', failed: 'danger' };
        const labels = { completed: 'Complété', pending: 'En attente', failed: 'Échoué' };
        return <Badge variant={variants[value] as any}>{labels[value]}</Badge>;
      }
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Exemple 9 : Transactions</h3>
        <p className="text-sm text-gray-600">Formatage de montants, dates et statuts</p>
      </div>
      <DataTable
        columns={columns}
        data={mockTransactions}
        rowKey="id"
      />
    </div>
  );
}

// ─── EXEMPLE COMPLET : SHOWCASE ──────────────────────────────────────────────

export function ExampleShowcase() {
  return (
    <div className="space-y-12 p-6 bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DataTable Component Showcase</h1>
        <p className="text-gray-600">Exemples d'utilisation du composant DataTable réutilisable</p>
      </div>

      <Example1_SimpleTable />
      <Example2_WithSorting />
      <Example3_CustomRender />
      <Example4_WithActions />
      <Example5_ClickableRows />
      <Example6_LoadingState />
      <Example7_EmptyState />
      <Example8_MembersTable />
      <Example9_TransactionsTable />
    </div>
  );
}

export default ExampleShowcase;
