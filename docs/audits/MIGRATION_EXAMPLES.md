# 🔄 Guide de Migration - Exemples Concrets

**Date:** 2024  
**Objectif:** Migrer du code hardcodé vers les composants réutilisables  
**Niveau:** Intermédiaire

---

## 📋 Table des Matières

1. [Migration de Boutons](#migration-de-boutons)
2. [Migration de Cards](#migration-de-cards)
3. [Migration de Modals](#migration-de-modals)
4. [Migration d'Inputs](#migration-dinputs)
5. [Migration de Tables](#migration-de-tables)
6. [Migration de Badges](#migration-de-badges)
7. [Migration de Layouts](#migration-de-layouts)

---

## 🔘 Migration de Boutons

### Exemple 1: Bouton Primaire Simple

#### ❌ AVANT
```typescript
<button 
  onClick={handleSubmit}
  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium 
             text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm 
             transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 
             focus:ring-offset-2"
>
  Enregistrer
</button>
```

#### ✅ APRÈS
```typescript
import { Button } from '@/shared/components/Button';

<Button variant="primary" size="md" onClick={handleSubmit}>
  Enregistrer
</Button>
```

**Gain:** -4 lignes, maintenance facilitée

---

### Exemple 2: Bouton avec Icône et Loading

#### ❌ AVANT
```typescript
<button 
  onClick={handleSave}
  disabled={isSaving}
  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium 
             text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors 
             disabled:opacity-60 disabled:cursor-not-allowed"
>
  {isSaving ? (
    <>
      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
      <span>Enregistrement...</span>
    </>
  ) : (
    <>
      <SaveIcon className="h-4 w-4" />
      <span>Enregistrer</span>
    </>
  )}
</button>
```

#### ✅ APRÈS
```typescript
import { Button } from '@/shared/components/Button';
import { SaveIcon } from '@patternfly/react-icons';

<Button 
  variant="primary" 
  size="lg"
  icon={<SaveIcon />}
  loading={isSaving}
  onClick={handleSave}
>
  Enregistrer
</Button>
```

**Gain:** -15 lignes, spinner automatique !

---

### Exemple 3: Bouton Secondaire Outline

#### ❌ AVANT
```typescript
<button
  onClick={onCancel}
  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 
             bg-white hover:bg-blue-50 rounded-lg transition-colors"
>
  Annuler
</button>
```

#### ✅ APRÈS
```typescript
<Button variant="outline" onClick={onCancel}>
  Annuler
</Button>
```

**Gain:** -2 lignes

---

### Exemple 4: Bouton Danger (Suppression)

#### ❌ AVANT
```typescript
<button
  onClick={handleDelete}
  className="px-4 py-2 text-sm font-medium text-white bg-red-600 
             hover:bg-red-700 rounded-lg shadow-sm transition-colors"
>
  <TrashIcon className="h-4 w-4 mr-2" />
  Supprimer
</button>
```

#### ✅ APRÈS
```typescript
import { TrashIcon } from '@patternfly/react-icons';

<Button 
  variant="danger" 
  icon={<TrashIcon />}
  onClick={handleDelete}
>
  Supprimer
</Button>
```

---

### Exemple 5: Bouton Icon-Only

#### ❌ AVANT
```typescript
<button
  onClick={handleEdit}
  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 
             rounded-lg transition-colors"
  aria-label="Modifier"
>
  <PencilIcon className="h-5 w-5" />
</button>
```

#### ✅ APRÈS
```typescript
<Button 
  variant="ghost" 
  size="md"
  iconOnly
  icon={<PencilIcon />}
  onClick={handleEdit}
  aria-label="Modifier"
/>
```

---

## 📦 Migration de Cards

### Exemple 1: Card Simple

#### ❌ AVANT
```typescript
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques</h2>
  <p className="text-sm text-gray-600">Contenu de la carte</p>
</div>
```

#### ✅ APRÈS
```typescript
import { Card } from '@/shared/components/Card';

<Card variant="standard">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques</h2>
  <p className="text-sm text-gray-600">Contenu de la carte</p>
</Card>
```

**Gain:** Cohérence automatique (rounded-xl, shadow-sm, border-gray-100)

---

### Exemple 2: Card avec Header et Footer

#### ❌ AVANT
```typescript
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
  <div className="border-b border-gray-200 pb-4 mb-4">
    <h2 className="text-xl font-semibold text-gray-900">Utilisateur</h2>
    <p className="text-sm text-gray-500 mt-1">Informations du profil</p>
  </div>
  
  <div className="space-y-4">
    {/* Contenu */}
  </div>
  
  <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
    <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
      Annuler
    </button>
    <button className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
      Enregistrer
    </button>
  </div>
</div>
```

#### ✅ APRÈS
```typescript
import { Card, Button } from '@/shared/components';

<Card variant="standard">
  <Card.Header>
    <h2 className="text-xl font-semibold text-gray-900">Utilisateur</h2>
    <p className="text-sm text-gray-500 mt-1">Informations du profil</p>
  </Card.Header>
  
  <Card.Body>
    <div className="space-y-4">
      {/* Contenu */}
    </div>
  </Card.Body>
  
  <Card.Footer>
    <Button variant="secondary" onClick={onCancel}>Annuler</Button>
    <Button variant="primary" onClick={onSave}>Enregistrer</Button>
  </Card.Footer>
</Card>
```

**Gain:** -8 lignes, structure claire

---

### Exemple 3: Card Compacte (Grille)

#### ❌ AVANT
```typescript
{articles.map(article => (
  <div 
    key={article.id}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 
               hover:shadow-md transition-shadow"
  >
    <h3 className="font-semibold text-gray-900">{article.nom}</h3>
    <p className="text-sm text-gray-500">{article.prix} €</p>
  </div>
))}
```

#### ✅ APRÈS
```typescript
{articles.map(article => (
  <Card key={article.id} variant="compact" hover>
    <h3 className="font-semibold text-gray-900">{article.nom}</h3>
    <p className="text-sm text-gray-500">{article.prix} €</p>
  </Card>
))}
```

**Gain:** Prop `hover` gère la transition automatiquement

---

## 🪟 Migration de Modals

### Exemple 1: Modal Simple

#### ❌ AVANT (85 lignes)
```typescript
function ConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Confirmer l'action
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 
                       hover:bg-gray-100 transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">
            Êtes-vous sûr de vouloir continuer ?
          </p>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### ✅ APRÈS (20 lignes)
```typescript
import { Modal, Button } from '@/shared/components';

function ConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header 
        title="Confirmer l'action" 
        showCloseButton 
        onClose={onClose} 
      />
      
      <Modal.Body>
        <p className="text-sm text-gray-600">
          Êtes-vous sûr de vouloir continuer ?
        </p>
      </Modal.Body>
      
      <Modal.Footer align="right">
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button variant="danger" onClick={onConfirm}>Confirmer</Button>
      </Modal.Footer>
    </Modal>
  );
}
```

**Gain:** -65 lignes ! ESC, overlay click, focus trap gratuits !

---

### Exemple 2: Modal de Formulaire

#### ❌ AVANT
```typescript
function CreateUserModal({ isOpen, onClose }) {
  const [saving, setSaving] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // ...
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold">Nouvel utilisateur</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input 
                type="text"
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg 
                           shadow-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Plus d'inputs... */}
          </div>
          
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg 
                         disabled:opacity-60"
            >
              {saving ? 'Enregistrement...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

#### ✅ APRÈS
```typescript
import { Modal, Button, FormField, Input } from '@/shared/components';

function CreateUserModal({ isOpen, onClose }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  
  const onSubmit = async (data) => {
    // ...
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <Modal.Header title="Nouvel utilisateur" showCloseButton onClose={onClose} />
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <div className="space-y-4">
            <FormField label="Prénom" error={errors.prenom?.message}>
              <Input {...register('prenom')} />
            </FormField>
            {/* Plus d'inputs... */}
          </div>
        </Modal.Body>
        
        <Modal.Footer align="right">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>
            Créer
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
```

**Gain:** -30 lignes, validation automatique, loading state gratuit

---

## 📝 Migration d'Inputs

### Exemple 1: Input Simple avec Label et Erreur

#### ❌ AVANT
```typescript
<div>
  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
    Email *
  </label>
  <input
    id="email"
    type="email"
    {...register('email')}
    className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg 
               shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 
               focus:ring-blue-500 focus:border-blue-500 transition-colors"
    placeholder="vous@example.com"
  />
  {errors.email && (
    <p className="mt-1 text-xs text-red-600">
      {errors.email.message}
    </p>
  )}
</div>
```

#### ✅ APRÈS
```typescript
import { FormField, Input } from '@/shared/components';

<FormField 
  id="email" 
  label="Email" 
  required
  error={errors.email?.message}
>
  <Input 
    type="email"
    placeholder="vous@example.com"
    {...register('email')}
  />
</FormField>
```

**Gain:** -10 lignes, gestion d'erreur automatique

---

### Exemple 2: Input avec Icône

#### ❌ AVANT
```typescript
<div>
  <label className="block text-sm font-medium text-gray-700">Recherche</label>
  <div className="relative mt-1">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <SearchIcon className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type="text"
      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg 
                 shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
      placeholder="Rechercher..."
    />
  </div>
</div>
```

#### ✅ APRÈS
```typescript
import { FormField, Input } from '@/shared/components';
import { SearchIcon } from '@patternfly/react-icons';

<FormField label="Recherche">
  <Input 
    iconLeft={<SearchIcon />}
    placeholder="Rechercher..."
  />
</FormField>
```

**Gain:** -8 lignes

---

### Exemple 3: Password Input avec Toggle

#### ❌ AVANT
```typescript
const [showPassword, setShowPassword] = useState(false);

// ...

<div>
  <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
  <div className="relative mt-1">
    <input
      type={showPassword ? 'text' : 'password'}
      className="block w-full pr-10 px-3 py-2.5 border border-gray-300 rounded-lg"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-0 pr-3 flex items-center"
    >
      {showPassword ? (
        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
      ) : (
        <EyeIcon className="h-5 w-5 text-gray-400" />
      )}
    </button>
  </div>
</div>
```

#### ✅ APRÈS
```typescript
import { FormField, PasswordInput } from '@/shared/components';

<FormField label="Mot de passe">
  <PasswordInput {...register('password')} />
</FormField>
```

**Gain:** -15 lignes, toggle automatique !

---

### Exemple 4: Select / Dropdown

#### ❌ AVANT
```typescript
<div>
  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
  <select
    className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg 
               shadow-sm focus:ring-2 focus:ring-blue-500"
  >
    <option value="">-- Sélectionner --</option>
    <option value="1">Judo</option>
    <option value="2">Karaté</option>
  </select>
</div>
```

#### ✅ APRÈS
```typescript
import { FormField, SelectField } from '@/shared/components';

<FormField label="Catégorie">
  <SelectField
    options={[
      { value: '1', label: 'Judo' },
      { value: '2', label: 'Karaté' },
    ]}
  />
</FormField>
```

---

## 📊 Migration de Tables

### Exemple 1: Table Simple

#### ❌ AVANT (60+ lignes)
```typescript
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Nom
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Email
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Rôle
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {users.map(user => (
        <tr key={user.id} className="hover:bg-gray-50">
          <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
          <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
          <td className="px-4 py-3 text-sm">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {user.role}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

#### ✅ APRÈS (10 lignes)
```typescript
import { DataTable, Badge } from '@/shared/components';

<DataTable
  columns={[
    { key: 'name', label: 'Nom', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'role', 
      label: 'Rôle',
      render: (role) => <Badge variant="info">{role}</Badge>
    },
  ]}
  data={users}
  rowKey="id"
  onRowClick={(user) => handleEdit(user)}
/>
```

**Gain:** -50 lignes, tri gratuit, skeleton loader intégré !

---

## 🏷️ Migration de Badges

### Exemple 1: Badge de Statut

#### ❌ AVANT
```typescript
{user.status === 'actif' ? (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs 
                   font-medium bg-green-100 text-green-800">
    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></span>
    Actif
  </span>
) : user.status === 'inactif' ? (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs 
                   font-medium bg-gray-100 text-gray-700">
    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-gray-500"></span>
    Inactif
  </span>
) : (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs 
                   font-medium bg-yellow-100 text-yellow-800">
    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
    En attente
  </span>
)}
```

#### ✅ APRÈS
```typescript
import { Badge } from '@/shared/components';

<Badge.Status status={user.status} />
```

**Gain:** -15 lignes, couleurs cohérentes automatiquement !

---

### Exemple 2: Badge de Paiement

#### ❌ AVANT
```typescript
{payment.status === 'paye' && (
  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
    Payé
  </span>
)}
{payment.status === 'en_attente' && (
  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
    En attente
  </span>
)}
{payment.status === 'echoue' && (
  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
    Échoué
  </span>
)}
```

#### ✅ APRÈS
```typescript
<Badge.PaymentStatus status={payment.status} />
```

**Gain:** -10 lignes

---

## 📐 Migration de Layouts

### Exemple 1: Page Header

#### ❌ AVANT
```typescript
<div className="flex items-center justify-between gap-4 mb-6">
  <div className="flex items-center gap-3">
    <CalendarIcon className="h-8 w-8 text-blue-600" />
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Cours</h1>
      <p className="text-sm text-gray-500">Gestion du planning</p>
    </div>
  </div>
  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
    Ajouter un cours
  </button>
</div>
```

#### ✅ APRÈS
```typescript
import { PageHeader, Button } from '@/shared/components';
import { CalendarIcon } from '@patternfly/react-icons';

<PageHeader
  icon={<CalendarIcon className="h-8 w-8 text-blue-600" />}
  title="Cours"
  description="Gestion du planning"
  actions={
    <Button variant="primary" onClick={handleAdd}>
      Ajouter un cours
    </Button>
  }
/>
```

**Gain:** -8 lignes, responsive automatique

---

### Exemple 2: Empty State

#### ❌ AVANT
```typescript
{users.length === 0 && (
  <div className="rounded-xl border border-dashed border-gray-300 bg-white 
                  px-6 py-12 text-center">
    <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <p className="text-sm font-semibold text-gray-700">Aucun utilisateur</p>
    <p className="mt-2 text-sm text-gray-500">
      Commencez par ajouter votre premier utilisateur
    </p>
  </div>
)}
```

#### ✅ APRÈS
```typescript
import { EmptyState } from '@/shared/components';
import { UsersIcon } from '@patternfly/react-icons';

{users.length === 0 && (
  <EmptyState
    icon={<UsersIcon />}
    title="Aucun utilisateur"
    description="Commencez par ajouter votre premier utilisateur"
  />
)}
```

**Gain:** -12 lignes

---

## 🔄 Migration Complète - RegisterPage

### ❌ AVANT (250+ lignes)

```typescript
export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 
                    flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Créer un compte</h1>
          <p className="text-gray-600">Rejoignez ClubManager</p>
        </div>
        
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prénom *
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('first_name')}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 
                             rounded-lg shadow-sm placeholder-gray-400 
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John"
                />
              </div>
              {errors.first_name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.first_name.message}
                </p>
              )}
            </div>
            
            {/* 10+ champs similaires... */}
            
            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="block w-full pr-10 px-3 py-3 border border-gray-300 
                             rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {/* Password strength indicator (30 lignes) */}
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent 
                         rounded-lg shadow-sm text-sm font-medium text-white 
                         bg-blue-600 hover:bg-blue-700 focus:outline-none 
                         disabled:opacity-50"
            >
              {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>
        </div>
        
        <p className="text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};
```

### ✅ APRÈS (80 lignes)

```typescript
import { 
  AuthPageContainer, 
  FormField, 
  Input, 
  PasswordInput,
  SelectField,
  SubmitButton 
} from '@/shared/components';
import { UserIcon, EnvelopeIcon, CalendarIcon } from '@patternfly/react-icons';

export const RegisterPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerFormSchema),
  });
  
  return (
    <AuthPageContainer
      title="Créer un compte"
      subtitle="Rejoignez ClubManager"
      footer={
        <p className="text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Se connecter
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Prénom" required error={errors.first_name?.message}>
            <Input 
              iconLeft={<UserIcon />}
              placeholder="John"
              {...register('first_name')}
            />
          </FormField>
          
          <FormField label="Nom" required error={errors.last_name?.message}>
            <Input 
              iconLeft={<UserIcon />}
              placeholder="Doe"
              {...register('last_name')}
            />
          </FormField>
        </div>
        
        <FormField label="Email" required error={errors.email?.message}>
          <Input 
            type="email"
            iconLeft={<EnvelopeIcon />}
            placeholder="vous@example.com"
            {...register('email')}
          />
        </FormField>
        
        <FormField label="Mot de passe" required error={errors.password?.message}>
          <PasswordInput 
            placeholder="••••••••"
            showStrengthIndicator
            {...register('password')}
          />
        </FormField>
        
        <FormField label="Date de naissance" required error={errors.date_of_birth?.message}>
          <Input 
            type="date"
            iconLeft={<CalendarIcon />}
            {...register('date_of_birth')}
          />
        </FormField>
        
        <FormField label="Genre" required error={errors.genre_id?.message}>
          <SelectField
            options={[
              { value: '1', label: 'Homme' },
              { value: '2', label: 'Femme' },
              { value: '3', label: 'Autre' },
            ]}
            {...register('genre_id')}
          />
        </FormField>
        
        <SubmitButton 
          isLoading={isSubmitting}
          loadingText="Création en cours..."
          fullWidth
        >
          Créer mon compte
        </SubmitButton>
      </form>
    </AuthPageContainer>
  );
};
```

**Gain Total:**
- **-170 lignes** (250 → 80)
- Password strength indicator intégré dans PasswordInput
- Validation automatique via FormField
- Layout auth cohérent avec LoginPage
- Loading state automatique

---

## 📊 Résumé des Gains

| Migration | Avant | Après | Gain |
|-----------|-------|-------|------|
| Bouton simple | 7 lignes | 3 lignes | -57% |
| Bouton + loading | 20 lignes | 5 lignes | -75% |
| Card avec header/footer | 25 lignes | 12 lignes | -52% |
| Modal simple | 85 lignes | 20 lignes | -76% |
| Input avec label + erreur | 15 lignes | 5 lignes | -67% |
| Table complète | 60 lignes | 10 lignes | -83% |
| Password input + toggle | 20 lignes | 3 lignes | -85% |
| RegisterPage complète | 250 lignes | 80 lignes | -68% |

**Gain moyen: -70% de code**

---

## 🎯 Checklist de Migration

Avant de soumettre une PR, vérifiez :

- [ ] Tous les boutons utilisent `<Button variant="...">`
- [ ] Toutes les cards utilisent `<Card variant="...">`
- [ ] Tous les modals utilisent `<Modal>` + sous-composants
- [ ] Tous les inputs utilisent `<FormField>` + `<Input>`
- [ ] Les tables utilisent `<DataTable>` quand possible
- [ ] Les badges utilisent `<Badge>` ou `<Badge.Status>`
- [ ] Les headers de page utilisent `<PageHeader>`
- [ ] Aucun `className="bg-blue-600..."` hardcodé
- [ ] Aucun `rounded-md` (sauf cas spécifique validé)
- [ ] Imports depuis `@/shared/components` ou chemins relatifs corrects

---

## 🔗 Ressources

- **Composants:** `frontend/src/shared/components/`
- **Design Tokens:** `frontend/src/shared/styles/designTokens.ts`
- **Storybook:** (à venir)
- **Audit complet:** `docs/audits/STYLE_CONSISTENCY_AUDIT.md`

---

**🎉 Happy Refactoring!**