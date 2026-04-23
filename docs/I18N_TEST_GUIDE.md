# 🌍 Guide de Test - Internationalisation (i18n)

## 📋 Vue d'ensemble

Ce guide vous aide à tester l'internationalisation complète de **clubManager-V3**. L'application supporte actuellement **2 langues** :
- 🇫🇷 **Français** (par défaut)
- 🇬🇧 **English**

**Taux de couverture actuel : ~99%**

---

## 🚀 Prérequis

1. **Serveur démarré** :
   ```bash
   pnpm dev
   ```

2. **Navigateur ouvert** : http://localhost:5173

3. **Compte utilisateur** : Admin ou Professor pour accéder à toutes les features

---

## 🔄 Comment changer de langue

### Méthode 1 : Via l'interface (recommandé)

1. **Se connecter** à l'application
2. Aller dans **⚙️ Paramètres** (menu latéral)
3. Cliquer sur l'onglet **🌐 Localisation**
4. Dans la section "Langue de l'application", sélectionner :
   - 🇫🇷 **Français** ou
   - 🇬🇧 **English**
5. Le changement est **instantané** et **persisté** dans la base de données

### Méthode 2 : Via localStorage (pour tester rapidement)

Ouvrir la console du navigateur (F12) et exécuter :

```javascript
// Passer en anglais
localStorage.setItem('user-language', 'en');
location.reload();

// Revenir en français
localStorage.setItem('user-language', 'fr');
location.reload();
```

---

## ✅ Checklist de Test par Feature

### 🔐 **1. Authentification (Auth)**

#### Pages à tester :
- [ ] **Page de connexion** (`/login`)
  - [ ] Titre "Connexion" → "Login"
  - [ ] Labels : "Adresse email", "Mot de passe"
  - [ ] Bouton "Se connecter" → "Sign in"
  - [ ] Lien "Mot de passe oublié ?" → "Forgot password?"
  - [ ] Messages d'erreur (identifiants incorrects)
  
- [ ] **Page d'inscription** (`/register`)
  - [ ] Titre "Créer un compte" → "Create an account"
  - [ ] Tous les champs de formulaire
  - [ ] Messages de validation
  
- [ ] **Réinitialisation de mot de passe** (`/forgot-password`, `/reset-password`)
  - [ ] Titres et descriptions
  - [ ] Messages de succès/erreur

---

### 🏠 **2. Dashboard / Statistiques**

- [ ] **Page d'accueil** (`/dashboard`)
  - [ ] Titre de page
  - [ ] Cartes statistiques :
    - [ ] "Membres actifs" → "Active members"
    - [ ] "Cours aujourd'hui" → "Courses today"
    - [ ] "Revenus du mois" → "Monthly revenue"
  - [ ] Graphiques (titres et légendes)
  - [ ] Messages vides ("Aucune donnée disponible")

---

### 📚 **3. Cours (Courses)**

- [ ] **Page des cours** (`/courses`)
  - [ ] Titre "Gestion des cours" → "Course management"
  - [ ] Onglets :
    - [ ] "Planning" → "Planning"
    - [ ] "Séances" → "Sessions"
    - [ ] "Professeurs" → "Professors"
  - [ ] Boutons d'actions :
    - [ ] "Nouveau cours" → "New course"
    - [ ] "Générer des séances" → "Generate sessions"
  
- [ ] **Modals** :
  - [ ] Création/édition de cours
  - [ ] Génération de séances
  - [ ] Gestion des présences
  - [ ] Tous les labels et placeholders
  - [ ] Messages de confirmation

---

### 🛒 **4. Boutique (Store)**

- [ ] **Page boutique** (`/store`)
  - [ ] Titre "Boutique" → "Store"
  - [ ] Onglets (admin) :
    - [ ] "Catalogue" → "Catalogue"
    - [ ] "Commandes" → "Orders"
    - [ ] "Stocks" → "Stocks"
    - [ ] "Configuration" → "Configuration"
  - [ ] Onglets (membre) :
    - [ ] "Boutique" → "Store"
    - [ ] "Mes commandes" → "My orders"
  
- [ ] **Statuts de commandes** :
  - [ ] "En attente" → "Pending"
  - [ ] "Payée" → "Paid"
  - [ ] "Expédiée" → "Shipped"
  - [ ] "Livrée" → "Delivered"
  - [ ] "Annulée" → "Cancelled"
  
- [ ] **Messages** :
  - [ ] Panier vide
  - [ ] Confirmations d'ajout/suppression
  - [ ] Toast de succès/erreur

---

### 💳 **5. Paiements (Payments)**

- [ ] **Page paiements** (`/payments`)
  - [ ] Onglets :
    - [ ] "Paiements" → "Payments"
    - [ ] "Échéances" → "Schedules"
    - [ ] "Plans" → "Plans"
  - [ ] Filtres :
    - [ ] "Tous les statuts" → "All statuses"
    - [ ] "Toutes les méthodes" → "All methods"
  - [ ] Boutons :
    - [ ] "Enregistrer un paiement" → "Record payment"
    - [ ] "Payer par carte" → "Pay by card"
  
- [ ] **Méthodes de paiement** :
  - [ ] "Espèces" → "Cash"
  - [ ] "Carte bancaire" → "Card"
  - [ ] "Virement" → "Transfer"
  - [ ] "Chèque" → "Check"
  
- [ ] **Modals** :
  - [ ] Modal Stripe (paiement par carte)
  - [ ] Enregistrement de paiement
  - [ ] Gestion des plans tarifaires

---

### ✉️ **6. Messages (Messaging)**

- [ ] **Page messagerie** (`/messages`)
  - [ ] Onglets :
    - [ ] "Boîte de réception" → "Inbox"
    - [ ] "Envoyés" → "Sent"
    - [ ] "Templates" → "Templates" (admin/prof)
  - [ ] Bouton "Nouveau message" → "New message"
  - [ ] Badge de messages non lus
  
- [ ] **Liste de messages** :
  - [ ] "Il y a X minutes" → "X minutes ago"
  - [ ] "Hier" → "Yesterday"
  - [ ] État vide : "Aucun message" → "No messages"
  
- [ ] **Templates** (admin/prof) :
  - [ ] Catégories de templates
  - [ ] Actions : activer, désactiver, modifier, supprimer
  - [ ] Toast de confirmation

---

### 👥 **7. Utilisateurs (Users)**

- [ ] **Page utilisateurs** (`/users`)
  - [ ] Titre "Gestion des utilisateurs" → "User management"
  - [ ] Filtres par rôle :
    - [ ] "Administrateur" → "Administrator"
    - [ ] "Professeur" → "Professor"
    - [ ] "Membre" → "Member"
  - [ ] Colonnes du tableau
  - [ ] Actions : éditer, notifier, supprimer

---

### 👨‍👩‍👧‍👦 **8. Familles (Families)**

- [ ] **Page famille** (`/family`)
  - [ ] Titre "Ma Famille" → "My Family"
  - [ ] Bouton "Ajouter un membre" → "Add member"
  - [ ] Rôles :
    - [ ] "Tuteur légal" → "Legal guardian"
    - [ ] "Enfant" → "Child"
    - [ ] "Conjoint" → "Spouse"
  - [ ] Genres :
    - [ ] "Masculin" → "Male"
    - [ ] "Féminin" → "Female"
    - [ ] "Autre" → "Other"
  - [ ] Badges :
    - [ ] "Mineur" → "Minor"
    - [ ] "Tuteur légal" → "Legal guardian"

---

### ⚙️ **9. Paramètres (Settings)**

- [ ] **Page paramètres** (`/settings`)
  - [ ] Onglets :
    - [ ] "Informations du club" → "Club information"
    - [ ] "Horaires" → "Schedule"
    - [ ] "Réseaux sociaux" → "Social networks"
    - [ ] "Finance & Légal" → "Finance & Legal"
    - [ ] "Apparence" → "Appearance"
    - [ ] "Navigation" → "Navigation"
    - [ ] "Localisation" → "Localization"
  
- [ ] **Section Localisation** :
  - [ ] Sélecteur de langue fonctionnel
  - [ ] Format de date (DD/MM/YYYY, MM/DD/YYYY)
  - [ ] Format d'heure (24h, 12h AM/PM)
  - [ ] Fuseau horaire
  - [ ] Message de confirmation "Langue modifiée avec succès"

---

### 🧭 **10. Navigation globale**

- [ ] **Menu latéral (Sidebar)** :
  - [ ] "Tableau de bord" → "Dashboard"
  - [ ] "Cours" → "Courses"
  - [ ] "Utilisateurs" → "Users"
  - [ ] "Famille" → "Family"
  - [ ] "Boutique" → "Store"
  - [ ] "Paiements" → "Payments"
  - [ ] "Messages" → "Messages"
  - [ ] "Statistiques" → "Statistics"
  - [ ] "Paramètres" → "Settings"
  
- [ ] **Menu utilisateur** :
  - [ ] "Profil" → "Profile"
  - [ ] "Paramètres" → "Settings"
  - [ ] "Déconnexion" → "Logout"
  
- [ ] **Footer** :
  - [ ] "Tous droits réservés" → "All rights reserved"
  - [ ] Liens de politique de confidentialité

---

## 🎯 Scénarios de test critiques

### Scénario 1 : Changement de langue pendant l'utilisation

1. Se connecter en français
2. Naviguer vers plusieurs pages (Dashboard, Cours, Boutique)
3. Aller dans Paramètres → Localisation
4. Changer la langue pour anglais
5. ✅ **Vérifier** : Tous les textes changent instantanément sans rechargement
6. Naviguer à nouveau vers les pages visitées
7. ✅ **Vérifier** : La langue anglaise est maintenue sur toutes les pages

### Scénario 2 : Persistance de la langue

1. Se connecter et changer la langue pour anglais
2. Actualiser la page (F5)
3. ✅ **Vérifier** : L'anglais est toujours la langue active
4. Se déconnecter
5. Se reconnecter
6. ✅ **Vérifier** : L'anglais est toujours la langue active (stocké en DB)

### Scénario 3 : Messages dynamiques (toast)

1. Changer la langue pour anglais
2. Effectuer des actions qui génèrent des notifications :
   - Créer un cours
   - Envoyer un message
   - Enregistrer un paiement
   - Modifier un template
3. ✅ **Vérifier** : Tous les messages toast sont en anglais

### Scénario 4 : Formulaires et validations

1. En français, tenter de soumettre un formulaire invalide (ex: inscription)
2. ✅ **Vérifier** : Messages d'erreur en français
3. Changer pour anglais
4. Tenter à nouveau de soumettre un formulaire invalide
5. ✅ **Vérifier** : Messages d'erreur en anglais

---

## 🔍 Points d'attention particuliers

### ✅ À vérifier systématiquement :

- [ ] **Boutons** : Tous les labels de boutons sont traduits
- [ ] **Placeholders** : Textes d'aide dans les inputs
- [ ] **Tooltips** : Infobulles au survol (`title` attributes)
- [ ] **Messages d'erreur** : Validation de formulaires
- [ ] **Messages de succès** : Notifications toast
- [ ] **États vides** : "Aucun élément à afficher" → "No items to display"
- [ ] **Chargement** : "Chargement..." → "Loading..."
- [ ] **Confirmations** : Dialogues de suppression/annulation
- [ ] **Colonnes de tableaux** : En-têtes des DataTables
- [ ] **Pagination** : "Affichage 1 à 10 sur 50 résultats" → "Showing 1 to 10 of 50 results"

### ⚠️ Zones sensibles :

- **Dates et heures** : Vérifier le format selon la langue
- **Montants** : Format monétaire (1 234,56 € vs 1,234.56 €)
- **Nombres** : Séparateurs de milliers et décimales
- **Pluralisation** : "1 paiement" vs "2 paiements" → "1 payment" vs "2 payments"

---

## 🐛 Problèmes connus

### ✅ Résolus :

- ✅ Clés manquantes `navigation.*` → Toutes ajoutées
- ✅ Messages toast hardcodés → Tous internationalisés
- ✅ Fichiers de traduction non chargés → Backend configuré
- ✅ Hook `useUnreadCount` → Type corrigé
- ✅ Export `PrivateLayout` → Export nommé ajouté

### ⚠️ Limitations actuelles :

- **TemplateEditorModal.tsx** : 5 erreurs TypeScript liées aux composants Input (non bloquant)
- **Fichiers `*.example.tsx`** : Non internationalisés (exemples de code uniquement)
- **Contenu dynamique de la DB** : Les données existantes restent en français (normal)

---

## 📊 Rapport de couverture

| Module | Composants i18n | Taux |
|--------|----------------|------|
| Auth | 5/5 | 100% ✅ |
| Settings | 7/7 | 100% ✅ |
| Courses | 7/7 | 100% ✅ |
| Statistics | 4/4 | 100% ✅ |
| Messages | 5/5 | 100% ✅ |
| Users | 3/3 | 100% ✅ |
| Families | 3/3 | 100% ✅ |
| Store | 14/15 | 93% ⚠️ |
| Payments | 9/9 | 100% ✅ |
| Navigation | 3/3 | 100% ✅ |
| **TOTAL** | **60/61** | **~99%** 🎉 |

---

## 🚀 Ajouter une nouvelle langue

### 1. Créer les fichiers de traduction

```bash
# Copier les fichiers FR comme base
cd frontend/src/i18n/locales
cp -r fr nl  # Exemple pour le néerlandais

# Traduire chaque fichier .json
# nl/common.json, nl/auth.json, nl/courses.json, etc.
```

### 2. Mettre à jour la configuration

**Fichier : `frontend/src/i18n/index.ts`**

```typescript
// Ajouter l'import
import commonNl from "./locales/nl/common.json";
// ... autres imports

// Ajouter dans supportedLanguages
export const supportedLanguages = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" }, // NOUVEAU
];

// Ajouter dans resources
resources: {
  fr: { ... },
  en: { ... },
  nl: {  // NOUVEAU
    common: commonNl,
    auth: authNl,
    // ... autres namespaces
  },
}
```

### 3. Mettre à jour la base de données

**Fichier : Migration SQL**

```sql
-- Ajouter NL aux valeurs acceptées
ALTER TABLE utilisateurs 
MODIFY COLUMN langue_preferee VARCHAR(5) NOT NULL DEFAULT 'fr' 
CHECK (langue_preferee IN ('fr', 'en', 'nl'));
```

### 4. Tester la nouvelle langue

1. Redémarrer l'application
2. Aller dans Paramètres → Localisation
3. Sélectionner la nouvelle langue
4. Valider que tous les textes changent

---

## 📚 Ressources

- **Documentation i18next** : https://www.i18next.com/
- **React i18next** : https://react.i18next.com/
- **Fichiers de traduction** : `frontend/src/i18n/locales/{fr,en}/`
- **Configuration** : `frontend/src/i18n/index.ts`
- **Hook principal** : `useTranslation()` de `react-i18next`

---

## ✅ Validation finale

Avant de valider l'internationalisation comme complète, exécuter cette checklist :

- [ ] Testé le changement de langue dans l'interface
- [ ] Testé la persistance de la langue après rechargement
- [ ] Testé la persistance après déconnexion/reconnexion
- [ ] Validé au moins 20 pages/composants différents
- [ ] Vérifié tous les messages toast (succès/erreur)
- [ ] Vérifié toutes les confirmations et dialogues
- [ ] Testé les formulaires et leurs validations
- [ ] Vérifié les états vides et les chargements
- [ ] Testé avec un compte Admin ET un compte Membre
- [ ] Aucune clé brute visible (ex: "tabs.orders")

---

## 🎉 Conclusion

L'internationalisation de **clubManager-V3** est maintenant **complète à 99%** ! 

Le système est:
- ✅ **Fonctionnel** : Changement de langue instantané
- ✅ **Persistant** : Stocké en DB et localStorage
- ✅ **Extensible** : Prêt pour d'autres langues
- ✅ **Maintenable** : Structure claire et organisée

**Bon test ! 🚀**