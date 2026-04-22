# 🚀 Guide de Migration - TabGroup & Modal

**Version:** 1.0  
**Date:** Janvier 2024  
**Audience:** Développeurs ClubManager V3

---

## 📖 Table des matières

1. [Introduction](#-introduction)
2. [Migration TabGroup](#-migration-tabgroup)
3. [Migration Modal](#-migration-modal)
4. [Templates Réutilisables](#-templates-réutilisables)
5. [Exemples Complets](#-exemples-complets)
6. [Checklist de Validation](#-checklist-de-validation)
7. [FAQ](#-faq)

---

## 🎯 Introduction

### Pourquoi migrer ?

| Critère | Sans composants réutilisables | Avec TabGroup/Modal |
|---------|-------------------------------|---------------------|
| **Lignes de code** | ~150 lignes/modal | ~60 lignes/modal |
| **Accessibilité** | ⚠️ Manuelle, inconsistante | ✅ Automatique, WCAG |
| **Maintenance** | 🔴 Difficile (18 fichiers) | ✅ Facile (1 composant) |
| **Temps création** | 45min | 10min |
| **Bugs potentiels** | Élevés | Faibles |

### Gains concrets

- ✅ **-60% de code** par modal
- ✅ **Focus trap automatique**
- ✅ **ESC + Click outside gratuits**
- ✅ **Animations cohérentes**
- ✅ **Scroll lock automatique**
- ✅ **Styles standardisés**

---

## 🔄 Migration TabGroup

### Étape 1 : Identifier le code à remplacer

#### ❌ Pattern à remplacer

```tsx
// Code custom à supprimer
const [activeTab, setActiveTab] = useState("tab1");

<div className="border-b border-gray-200">
  <div className="flex gap-4">
    <button
      onClick={() => setActiveTab("tab1")}
      className={`px-4 py-2 border-b-2 ${
        activeTab === "tab1"
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500"
      }`}
    >
      Onglet 1
    </button>
    <button
      onClick={() => setActiveTab("tab2")}
      className={`px-4 py-2 border-b-2 ${
        activeTab === "tab2"
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500"
      }`}
    >
      Onglet 2
    </button>
  </div>
</div>
```

### Étape 2 : Ajouter l'import

```tsx
import { TabGroup } from "../../../shared/components/Navigation/TabGroup";
import type { Tab } from "../../../shared/components/Navigation/TabGroup";
```

### Étape 3 : Définir les tabs

```tsx
const tabs: Tab[] = [
  { id: "tab1", label: "Onglet 1" },
  { id: "tab2", label: "Onglet 2" },
];
```

### Étape 4 : Utiliser TabGroup

```tsx
<TabGroup
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

---

### Variantes TabGroup

#### Variant "default" (classique)

**Quand l'utiliser ?** La plupart des cas (CoursesPage, StorePage, PaymentsPage)

```tsx
<TabGroup
  variant="default"
  tabs={[
    { id: "tab1", label: "Produits" },
    { id: "tab2", label: "Catégories" },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

**Rendu:**
- Border-b-2 simple
- Pas de background sur l'onglet actif
- Style épuré

---

#### Variant "highlight" (avec background)

**Quand l'utiliser ?** Pages complexes avec beaucoup d'onglets (SettingsPage)

```tsx
<TabGroup
  variant="highlight"
  scrollable={true}
  tabs={[
    { id: "club", label: "Informations", icon: <BuildingIcon /> },
    { id: "horaires", label: "Horaires", icon: <ClockIcon /> },
    { id: "social", label: "Réseaux", icon: <GlobeIcon /> },
    { id: "finance", label: "Finance", icon: <BankIcon /> },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

**Rendu:**
- Background `bg-blue-50` sur onglet actif
- Boutons chevron automatiques (si `scrollable={true}`)
- Style plus visible

---

#### Avec icônes

```tsx
import { CalendarIcon, ClipboardIcon, UsersIcon } from "./icons";

const tabs = [
  { 
    id: "planning", 
    label: "Planning", 
    icon: <CalendarIcon className="h-4 w-4" /> 
  },
  { 
    id: "sessions", 
    label: "Séances", 
    icon: <ClipboardIcon className="h-4 w-4" /> 
  },
];

<TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
```

---

#### Avec badges numériques

```tsx
const tabs = [
  { id: "all", label: "Tous", badge: 42 },
  { id: "pending", label: "En attente", badge: 5 },
  { id: "completed", label: "Terminés", badge: 37 },
];

<TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
```

---

### Migration complète : SettingsPage

#### ❌ AVANT (103 lignes custom)

```tsx
const tabs = [
  { id: "club", label: "Informations du club", icon: <BuildingIcon /> },
  { id: "horaires", label: "Horaires", icon: <ClockIcon /> },
  // ... 7 onglets
];

const tabsScrollRef = useRef<HTMLDivElement>(null);

const scrollTabs = (direction: "left" | "right") => {
  tabsScrollRef.current?.scrollBy({
    left: direction === "left" ? -180 : 180,
    behavior: "smooth",
  });
};

return (
  <div className="relative flex items-end border-b border-gray-200">
    {/* Bouton gauche */}
    <button
      onClick={() => scrollTabs("left")}
      className="flex-shrink-0 w-8 h-10 text-gray-400 hover:text-gray-600"
    >
      <ChevronLeftIcon />
    </button>

    {/* Liste scrollable */}
    <div
      ref={tabsScrollRef}
      className="flex-1 flex overflow-x-auto scroll-smooth"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium ${
            activeTab === tab.id
              ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
              : "border-b-2 border-transparent text-gray-500 hover:bg-gray-50"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>

    {/* Bouton droite */}
    <button
      onClick={() => scrollTabs("right")}
      className="flex-shrink-0 w-8 h-10 text-gray-400 hover:text-gray-600"
    >
      <ChevronRightIcon />
    </button>
  </div>
);
```

#### ✅ APRÈS (15 lignes)

```tsx
import { TabGroup } from "../../../shared/components/Navigation/TabGroup";

const tabs = [
  { id: "club", label: "Informations du club", icon: <BuildingIcon /> },
  { id: "horaires", label: "Horaires d'ouverture", icon: <ClockIcon /> },
  { id: "social", label: "Réseaux sociaux", icon: <GlobeAltIcon /> },
  { id: "finance", label: "Finance & Légal", icon: <BanknotesIcon /> },
  { id: "apparence", label: "Apparence", icon: <PaintBrushIcon /> },
  { id: "navigation", label: "Navigation", icon: <Squares2x2Icon /> },
  { id: "localisation", label: "Localisation", icon: <LanguageIcon /> },
];

<TabGroup
  variant="highlight"
  scrollable={true}
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

**Gains:**
- ✅ **-88 lignes** de code
- ✅ Scroll automatique (chevrons + swipe mobile)
- ✅ Accessibilité clavier (flèches, Tab, Enter)
- ✅ Cohérence garantie avec les autres pages

---

## 🎨 Migration Modal

### Étape 1 : Identifier le code à remplacer

#### ❌ Pattern à remplacer

```tsx
// Hook custom pour ESC + scroll lock
function useModalEffects(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
}

// Modal custom
function MyModal({ isOpen, onClose, onSubmit }) {
  useModalEffects(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header custom */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Titre</h2>
            <button onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Body custom */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {/* Contenu */}
        </div>

        {/* Footer custom */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose}>Annuler</button>
          <button onClick={onSubmit}>Valider</button>
        </div>
      </div>
    </div>
  );
}
```

### Étape 2 : Ajouter les imports

```tsx
import { Modal } from "../../../shared/components/Modal/Modal";
import { Button } from "../../../shared/components/Button/Button";
```

### Étape 3 : Remplacer par Modal

```tsx
function MyModal({ isOpen, onClose, onSubmit }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header title="Titre" onClose={onClose} />
      
      <Modal.Body>
        {/* Contenu */}
      </Modal.Body>
      
      <Modal.Footer align="right">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={onSubmit}>
          Valider
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

### Étape 4 : Supprimer le code obsolète

**À supprimer :**
- ❌ `useModalEffects` hook
- ❌ `if (!isOpen) return null;`
- ❌ `onClick={(e) => e.stopPropagation()}`
- ❌ Toutes les classes CSS custom

**Bonus automatiques :**
- ✅ ESC pour fermer
- ✅ Click outside pour fermer
- ✅ Focus trap
- ✅ Scroll lock du body
- ✅ Animations fade-in/zoom-in
- ✅ ARIA labels corrects

---

### Tailles de Modal

```tsx
// Petit formulaire (connexion, confirmation)
<Modal size="sm">  {/* 384px */}

// Formulaire standard (défaut)
<Modal size="md">  {/* 512px */}

// Formulaire complexe
<Modal size="lg">  {/* 640px */}

// Édition de contenu
<Modal size="xl">  {/* 768px */}

// Tableaux, listes
<Modal size="2xl"> {/* 896px */}

// Dashboards
<Modal size="3xl"> {/* 1024px */}

// Plein écran
<Modal size="4xl"> {/* 1280px */}
```

---

### Modal avec sous-titre

```tsx
<Modal isOpen={isOpen} onClose={onClose} size="lg">
  <Modal.Header
    title="Créer un nouveau cours"
    subtitle="Remplissez les informations du cours récurrent"
    onClose={onClose}
  />
  <Modal.Body>
    {/* Formulaire */}
  </Modal.Body>
  <Modal.Footer align="right">
    <Button variant="outline" onClick={onClose}>Annuler</Button>
    <Button onClick={handleSubmit}>Créer</Button>
  </Modal.Footer>
</Modal>
```

---

### Modal avec loading state

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await saveData();
    toast.success("Enregistré !");
    onClose();
  } catch (error) {
    toast.error("Erreur");
  } finally {
    setIsSubmitting(false);
  }
};

return (
  <Modal isOpen={isOpen} onClose={onClose}>
    <Modal.Header title="Modifier" onClose={onClose} />
    <Modal.Body>
      {/* Formulaire */}
    </Modal.Body>
    <Modal.Footer align="right">
      <Button 
        variant="outline" 
        onClick={onClose}
        disabled={isSubmitting}
      >
        Annuler
      </Button>
      <Button 
        onClick={handleSubmit}
        loading={isSubmitting}
      >
        Enregistrer
      </Button>
    </Modal.Footer>
  </Modal>
);
```

---

### Modal sans bouton X (confirmation critique)

```tsx
<Modal isOpen={isOpen} onClose={onClose} size="sm">
  <Modal.Header
    title="Confirmer la suppression"
    showCloseButton={false}
  />
  <Modal.Body>
    <p>Êtes-vous sûr ? Cette action est irréversible.</p>
  </Modal.Body>
  <Modal.Footer align="right">
    <Button variant="outline" onClick={onClose}>Annuler</Button>
    <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
  </Modal.Footer>
</Modal>
```

---

### ConfirmDialog (cas spécial)

Pour les confirmations simples, utilisez `ConfirmDialog` :

```tsx
import { ConfirmDialog } from "../../../shared/components/Modal/ConfirmDialog";

const [showConfirm, setShowConfirm] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async () => {
  setIsDeleting(true);
  try {
    await deleteItem(itemId);
    toast.success("Supprimé !");
    setShowConfirm(false);
  } catch (error) {
    toast.error("Erreur");
  } finally {
    setIsDeleting(false);
  }
};

return (
  <>
    <Button 
      variant="danger" 
      onClick={() => setShowConfirm(true)}
    >
      Supprimer
    </Button>

    <ConfirmDialog
      isOpen={showConfirm}
      onClose={() => setShowConfirm(false)}
      onConfirm={handleDelete}
      title="Supprimer l'élément"
      message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
      variant="danger"
      isLoading={isDeleting}
    />
  </>
);
```

**Variants disponibles :**
- `danger` (rouge, icône triangle) - Suppressions
- `warning` (jaune, icône exclamation) - Avertissements
- `info` (bleu, icône info) - Informations

---

## 📦 Templates Réutilisables

### Template 1 : Formulaire Simple

```tsx
import { useState } from "react";
import { Modal, Button, FormField, Input } from "@/shared/components";
import { toast } from "sonner";

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateItemModal({ isOpen, onClose, onSuccess }: CreateItemModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    setIsSubmitting(true);
    try {
      await createItem({ name, description });
      toast.success("Élément créé !");
      onSuccess?.();
      onClose();
      // Reset form
      setName("");
      setDescription("");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header
        title="Créer un élément"
        subtitle="Remplissez les informations ci-dessous"
        onClose={onClose}
      />

      <Modal.Body>
        <form onSubmit={handleSubmit} id="create-item-form" className="space-y-4">
          <FormField label="Nom" required error={!name && "Requis"}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de l'élément"
              autoFocus
            />
          </FormField>

          <FormField label="Description">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description optionnelle"
            />
          </FormField>
        </form>
      </Modal.Body>

      <Modal.Footer align="right">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          form="create-item-form"
          loading={isSubmitting}
        >
          Créer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

---

### Template 2 : Formulaire de Modification

```tsx
import { useState, useEffect } from "react";
import { Modal, Button, FormField, Input } from "@/shared/components";
import { toast } from "sonner";

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: { id: number; name: string; description: string } | null;
  onSuccess?: () => void;
}

export function EditItemModal({ isOpen, onClose, item, onSuccess }: EditItemModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pré-remplir le formulaire
  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsSubmitting(true);
    try {
      await updateItem(item.id, { name, description });
      toast.success("Élément modifié !");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la modification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header
        title="Modifier l'élément"
        subtitle={`#${item?.id} - ${item?.name}`}
        onClose={onClose}
      />

      <Modal.Body>
        <form onSubmit={handleSubmit} id="edit-item-form" className="space-y-4">
          <FormField label="Nom" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de l'élément"
              autoFocus
            />
          </FormField>

          <FormField label="Description">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
          </FormField>
        </form>
      </Modal.Body>

      <Modal.Footer align="right">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" form="edit-item-form" loading={isSubmitting}>
          Enregistrer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

---

### Template 3 : Modal Lecture Seule

```tsx
interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export function ViewDetailsModal({ isOpen, onClose, item }: ViewDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title="Détails de l'élément"
        subtitle={`Référence: ${item?.id}`}
        onClose={onClose}
      />

      <Modal.Body>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Nom</h3>
            <p className="mt-1 text-sm text-gray-900">{item?.name}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700">Description</h3>
            <p className="mt-1 text-sm text-gray-900">{item?.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700">Date de création</h3>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(item?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer align="right">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

---

## 🎓 Exemples Complets

### Exemple 1 : Migration CoursesPage Modal

#### ❌ AVANT (~200 lignes)

```tsx
function CreateCourseRecurrentModal({ isOpen, onClose, onSubmit }) {
  useModalEffects(isOpen, onClose);
  
  const [form, setForm] = useState({
    type_cours: "",
    jour_semaine: 1,
    heure_debut: "",
    heure_fin: "",
    professeur_id: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Créer un cours récurrent
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Type de cours
              </label>
              <input
                type="text"
                value={form.type_cours}
                onChange={(e) => setForm({ ...form, type_cours: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jour de la semaine
              </label>
              <select
                value={form.jour_semaine}
                onChange={(e) => setForm({ ...form, jour_semaine: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {/* Options */}
              </select>
            </div>

            {/* Autres champs... */}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### ✅ APRÈS (~90 lignes)

```tsx
import { Modal, Button, FormField, Input, SelectField } from "@/shared/components";
import { useState } from "react";

interface CreateCourseRecurrentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  professors: Array<{ id: number; nom: string; prenom: string }>;
}

export function CreateCourseRecurrentModal({
  isOpen,
  onClose,
  onSubmit,
  professors,
}: CreateCourseRecurrentModalProps) {
  const [form, setForm] = useState({
    type_cours: "",
    jour_semaine: 1,
    heure_debut: "",
    heure_fin: "",
    professeur_id: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
      // Reset
      setForm({
        type_cours: "",
        jour_semaine: 1,
        heure_debut: "",
        heure_fin: "",
        professeur_id: null,
      });
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title="Créer un cours récurrent"
        subtitle="Remplissez les informations du cours hebdomadaire"
        onClose={onClose}
      />

      <Modal.Body>
        <form onSubmit={handleSubmit} id="create-course-form" className="space-y-4">
          <FormField label="Type de cours" required>
            <Input
              value={form.type_cours}
              onChange={(e) => setForm({ ...form, type_cours: e.target.value })}
              placeholder="Ex: Judo Enfants"
              autoFocus
            />
          </FormField>

          <SelectField
            label="Jour de la semaine"
            value={form.jour_semaine}
            onChange={(e) => setForm({ ...form, jour_semaine: Number(e.target.value) })}
            options={[
              { value: 1, label: "Lundi" },
              { value: 2, label: "Mardi" },
              { value: 3, label: "Mercredi" },
              { value: 4, label: "Jeudi" },
              { value: 5, label: "Vendredi" },
              { value: 6, label: "Samedi" },
              { value: 7, label: "Dimanche" },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Heure de début" required>
              <Input
                type="time"
                value={form.heure_debut}
                onChange={(e) => setForm({ ...form, heure_debut: e.target.value })}
              />
            </FormField>

            <FormField label="Heure de fin" required>
              <Input
                type="time"
                value={form.heure_fin}
                onChange={(e) => setForm({ ...form, heure_fin: e.target.value })}
              />
            </FormField>
          </div>

          <SelectField
            label="Professeur"
            value={form.professeur_id || ""}
            onChange={(e) => setForm({ ...form, professeur_id: Number(e.target.value) })}
            options={[
              { value: "", label: "-- Sélectionner --" },
              ...professors.map((p) => ({
                value: p.id,
                label: `${p.prenom} ${p.nom}`,
              })),
            ]}
          />
        </form>
      </Modal.Body>

      <Modal.Footer align="right">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" form="create-course-form" loading={isSubmitting}>
          Créer le cours
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

**Gains:**
- ✅ **-55%** de code (200 → 90 lignes)
- ✅ ESC automatique
- ✅ Focus trap
- ✅ Accessibilité WCAG
- ✅ Loading state sur bouton
- ✅ Reset automatique du form

---

## ✅ Checklist de Validation

### Pour TabGroup

#### Avant Migration
- [ ] J'ai identifié le code custom à remplacer
- [ ] J'ai choisi le bon variant (`default` ou `highlight`)
- [ ] J'ai déterminé si `scrollable` est nécessaire (>5 onglets)
- [ ] J'ai les icônes si nécessaire
- [ ] J'ai lu `TabGroup.README.md`

#### Après Migration
- [ ] L'import est correct : `import { TabGroup } from "@/shared/components/Navigation/TabGroup"`
- [ ] Les types sont importés : `import type { Tab } from "@/shared/components/Navigation/TabGroup"`
- [ ] Le code custom est supprimé (refs, scroll handlers, styles)
- [ ] Les onglets s'affichent correctement
- [ ] Le scroll fonctionne (desktop + mobile)
- [ ] Les icônes s'affichent si présentes
- [ ] Les badges s'affichent si présents
- [ ] L'accessibilité clavier fonctionne (Tab, Enter, Flèches)
- [ ] Le style est cohérent avec les autres pages
- [ ] Pas de console errors

---

### Pour Modal

#### Avant Migration
- [ ] J'ai identifié le wrapper `fixed inset-0` à remplacer
- [ ] J'ai identifié le hook `useModalEffects` ou équivalent
- [ ] J'ai déterminé la taille appropriée (`sm`, `md`, `lg`, etc.)
- [ ] J'ai lu `Modal.md`
- [ ] J'ai vérifié s'il y a des cas ConfirmDialog

#### Après Migration
- [ ] L'import est correct : `import { Modal } from "@/shared/components/Modal/Modal"`
- [ ] `Modal.Header` est utilisé avec `title` et `onClose`
- [ ] `Modal.Body` entoure le contenu
- [ ] `Modal.Footer` est utilisé avec `align="right"`
- [ ] Le hook custom est supprimé
- [ ] Le wrapper custom est supprimé
- [ ] Les props `isOpen` et `onClose` sont passées
- [ ] ESC ferme la modal
- [ ] Click outside ferme la modal
- [ ] Le bouton X ferme la modal
- [ ] Le focus est piégé (Tab/Shift+Tab)
- [ ] Le scroll du body est bloqué quand ouvert
- [ ] Le loading state fonctionne sur les boutons
- [ ] Pas de console errors
- [ ] Test avec axe DevTools : 0 erreurs A11Y

---

## ❓ FAQ

### TabGroup

**Q: Quand utiliser `variant="default"` vs `variant="highlight"` ?**

R: 
- `default` : La plupart des cas (CoursesPage, StorePage, PaymentsPage)
- `highlight` : Pages avec beaucoup d'onglets où la visibilité est cruciale (SettingsPage)

---

**Q: Quand activer `scrollable` ?**

R: Activez `scrollable={true}` si vous avez :
- Plus de 5 onglets
- Des labels longs
- Une page destinée au mobile

---

**Q: Comment personnaliser le style ?**

R: N'ajoutez PAS de classes custom. Si le besoin est légitime, modifiez `TabGroup.tsx` pour bénéficier tous les usages.

---

**Q: Puis-je utiliser des icônes custom ?**

R: Oui ! Passez n'importe quel ReactNode dans `tab.icon`.

---

### Modal

**Q: Quelle taille choisir ?**

R:
- `sm` (384px) : Confirmations, petits formulaires
- `md` (512px) : **Défaut**, formulaires standards
- `lg` (640px) : Formulaires complexes
- `xl`+ : Contenus larges (tableaux, édition riche)

---

**Q: Comment gérer plusieurs modals ?**

R: Utilisez un état qui décrit le modal actif :

```tsx
type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; item: Item }
  | { type: "delete"; itemId: number };

const [modal, setModal] = useState<ModalState>({ type: "none" });

// Usage
setModal({ type: "edit", item: selectedItem });
setModal({ type: "none" }); // fermer
```

---

**Q: Comment empêcher la fermeture ?**

R: Utilisez les props de contrôle :

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  closeOnEscape={false}        // Désactive ESC
  closeOnOverlayClick={false}  // Désactive click outside
>
  <Modal.Header
    showCloseButton={false}    // Cache le bouton X
    title="Action requise"
  />
  {/* ... */}
</Modal>
```

---

**Q: Comment reset le formulaire à la fermeture ?**

R: Créez un wrapper `handleClose` :

```tsx
const handleClose = () => {
  setForm({ name: "", email: "" }); // Reset
  onClose();
};

<Modal isOpen={isOpen} onClose={handleClose}>
```

---

**Q: Puis-je imbriquer des modals ?**

R: Techniquement oui (z-index gérés), mais **déconseillé** pour l'UX. Préférez fermer la première modal avant d'ouvrir la seconde.

---

**Q: Comment ajouter un scroll dans le Body ?**

R: `Modal.Body` a déjà `overflow-y-auto`. Si le contenu dépasse `max-h-[90vh]`, il scrollera automatiquement.

---

**Q: `ConfirmDialog` ou `Modal` pour les confirmations ?**

R:
- Utilisez `ConfirmDialog` si : Simple oui/non, pas de formulaire
- Utilisez `Modal` si : Formulaire, raison de suppression, choix multiples

---

## 🎯 Pièges à Éviter

### TabGroup

❌ **Ne pas :**
```tsx
// Réinventer la roue
const [showLeft, setShowLeft] = useState(false);
const scrollRef = useRef();
// ... 50 lignes de logique custom
```

✅ **Faire :**
```tsx
<TabGroup scrollable={true} tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
```

---

❌ **Ne pas :**
```tsx
// Mélanger les styles
<TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="border-green-500" />
```

✅ **Faire :**
```tsx
// Si besoin de customisation, modifier le composant source
<TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
```

---

### Modal

❌ **Ne pas :**
```tsx
// Garder le wrapper custom
<div className="fixed inset-0 bg-black/50 z-50">
  <Modal>...</Modal>
</div>
```

✅ **Faire :**
```tsx
// Modal gère déjà l'overlay
<Modal isOpen={isOpen} onClose={onClose}>...</Modal>
```

---

❌ **Ne pas :**
```tsx
// Gérer ESC manuellement
useEffect(() => {
  const handler = (e) => {
    if (e.key === "Escape") onClose();
  };
  // ...
}, []);
```

✅ **Faire :**
```tsx
// Modal gère déjà ESC
<Modal isOpen={isOpen} onClose={onClose}>
```

---

❌ **Ne pas :**
```tsx
// Oublier le form id
<Modal.Body>
  <form onSubmit={handleSubmit}>
    {/* ... */}
  </form>
</Modal.Body>
<Modal.Footer>
  <button onClick={handleSubmit}>Valider</button>
</Modal.Footer>
```

✅ **Faire :**
```tsx
<Modal.Body>
  <form onSubmit={handleSubmit} id="my-form">
    {/* ... */}
  </form>
</Modal.Body>
<Modal.Footer>
  <Button type="submit" form="my-form">Valider</Button>
</Modal.Footer>
```

---

## 📚 Ressources

### Documentation
- `shared/components/Modal/Modal.md`
- `shared/components/Modal/Modal.examples.tsx`
- `shared/components/Navigation/TabGroup.README.md`
- `shared/components/Navigation/TabGroup.examples.tsx`

### Exemples de Code
- ✅ AddFamilyMemberModal.tsx (Modal simple)
- ✅ ComposeModal.tsx (Modal avec formulaire complexe)
- ✅ CoursesPage.tsx (TabGroup avec icônes)
- ✅ SettingsPage.tsx (TabGroup highlight + scrollable) - À MIGRER

### Audits & Rapports
- `TABGROUP_MODAL_INCONSISTENCIES.md` (ce rapport)
- `docs/MODALS_AUDIT.md`
- `docs/MODALS_MIGRATION_ROADMAP.md`

---

## 🚀 Prochaines Étapes

1. **Lire ce guide en entier** (15min)
2. **Étudier 2-3 exemples** de modals migrées (30min)
3. **Migrer SettingsPage** vers TabGroup (1h)
4. **Migrer 1 modal simple** en pratique (1h)
5. **Demander une review** à l'équipe Design System

**Bon courage ! 💪**

---

**Questions ?** Contactez l'équipe Design System ou créez une issue avec le tag `migration`.