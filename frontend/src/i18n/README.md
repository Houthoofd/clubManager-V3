# Système d'internationalisation (i18n)

Ce dossier contient tous les fichiers de traduction pour l'application ClubManager V3.

## 📁 Structure des fichiers

```
i18n/
├── locales/
│   ├── fr/                 # Traductions françaises
│   │   ├── common.json     # Éléments communs (boutons, navigation, etc.)
│   │   ├── auth.json       # Module d'authentification
│   │   ├── settings.json   # Module paramètres
│   │   ├── errors.json     # Messages d'erreur
│   │   ├── courses.json    # Module des cours
│   │   ├── store.json      # Module boutique
│   │   ├── payments.json   # Module paiements
│   │   ├── statistics.json # Module statistiques
│   │   └── messages.json   # Module messagerie
│   └── en/                 # Traductions anglaises
│       ├── common.json     # Common elements (buttons, navigation, etc.)
│       ├── auth.json       # Authentication module
│       ├── settings.json   # Settings module
│       ├── errors.json     # Error messages
│       ├── courses.json    # Courses module
│       ├── store.json      # Store module
│       ├── payments.json   # Payments module
│       ├── statistics.json # Statistics module
│       └── messages.json   # Messaging module
├── hooks/
│   └── useLanguage.ts      # Hook personnalisé pour changement de langue
├── index.ts                # Configuration i18next principale
└── README.md               # Documentation (ce fichier)
```

## 🚀 Installation

Les dépendances nécessaires sont déjà installées :

```bash
pnpm add i18next react-i18next i18next-browser-languagedetector
```

L'application est déjà configurée avec `I18nextProvider` dans `App.tsx`.

## 📖 Utilisation

### Dans un composant React

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('navigation.dashboard')}</h1>
      <button>{t('buttons.save')}</button>
    </div>
  );
}
```

### Avec plusieurs namespaces

```tsx
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t: tCommon } = useTranslation('common');
  const { t: tAuth } = useTranslation('auth');
  
  return (
    <div>
      <h1>{tAuth('login.title')}</h1>
      <button>{tCommon('buttons.submit')}</button>
      <p>{tAuth('errors.invalidCredentials')}</p>
    </div>
  );
}
```

### Avec interpolation

```tsx
const { t } = useTranslation('errors');

// Pour les erreurs avec variables
<p>{t('validation.minValue', { min: 10 })}</p>
// Affiche : "La valeur doit être supérieure ou égale à 10"
```

## 🌍 Changer de langue

### Avec le hook useLanguage (Recommandé)

Le hook `useLanguage` gère automatiquement :
- Le changement de langue dans i18next
- La sauvegarde dans localStorage
- La synchronisation avec l'API backend (pour les utilisateurs connectés)

```tsx
import { useLanguage } from '../i18n/hooks/useLanguage';

function LanguageSwitcher() {
  const { language, changeLanguage, availableLanguages } = useLanguage();
  
  const handleLanguageChange = async (lng: string) => {
    try {
      await changeLanguage(lng);
      // Langue changée avec succès !
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
    }
  };
  
  return (
    <div>
      <p>Langue actuelle : {language}</p>
      {availableLanguages.map((lang) => (
        <button 
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
        >
          {lang.flag} {lang.label}
        </button>
      ))}
    </div>
  );
}
```

### Depuis un composant (Alternative)

```tsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('user-language', lng);
  };
  
  return (
    <div>
      <button onClick={() => changeLanguage('fr')}>Français 🇫🇷</button>
      <button onClick={() => changeLanguage('en')}>English 🇬🇧</button>
    </div>
  );
}
```

### Obtenir la langue actuelle

```tsx
const { i18n } = useTranslation();
const currentLanguage = i18n.language; // 'fr' ou 'en'

// Ou avec le hook useLanguage
const { language } = useLanguage();
```

## ➕ Ajouter une nouvelle traduction

### 1. Ajouter dans le fichier JSON approprié

**fr/common.json**
```json
{
  "buttons": {
    "save": "Enregistrer",
    "myNewButton": "Mon nouveau bouton"
  }
}
```

**en/common.json**
```json
{
  "buttons": {
    "save": "Save",
    "myNewButton": "My new button"
  }
}
```

### 2. Utiliser dans le composant

```tsx
const { t } = useTranslation('common');
<button>{t('buttons.myNewButton')}</button>
```

## 📝 Namespaces disponibles

- **common** : Éléments communs (boutons, navigation, statuts, labels génériques)
- **auth** : Module d'authentification (login, register, reset password, vérification email)
- **settings** : Module paramètres (configuration du club, apparence, notifications)
- **errors** : Messages d'erreur (network, validation, database, authorization)
- **courses** : Module de gestion des cours (création, inscription, planning)
- **store** : Module boutique (produits, commandes, panier)
- **payments** : Module paiements (cotisations, factures, historique)
- **statistics** : Module statistiques (tableaux de bord, rapports, graphiques)
- **messages** : Module messagerie (conversation, notifications, envoi)

## 🎯 Conventions de nommage

- Utiliser **camelCase** pour les clés
- Structure hiérarchique avec des objets imbriqués
- Noms de clés en anglais, même pour les traductions françaises
- Être cohérent entre FR et EN

### ✅ Bon exemple

```json
{
  "user": {
    "profile": {
      "editTitle": "Modifier le profil"
    }
  }
}
```

### ❌ Mauvais exemple

```json
{
  "utilisateur-profil-modifier-titre": "Modifier le profil"
}
```

## 🔧 Configuration

Le fichier `index.ts` contient la configuration de i18next :

- **fallbackLng** : `'fr'` - Langue par défaut
- **supportedLngs** : `['fr', 'en']` - Langues supportées (extensible : nl, de, es)
- **defaultNS** : `'common'` - Namespace par défaut
- **ns** : Tous les namespaces de l'application
- **detection** : Détection automatique via :
  1. localStorage (`user-language`)
  2. Langue du navigateur
- **debug** : Activé en mode développement uniquement
- **interpolation** : Support des variables dynamiques
- **pluralSeparator** : Support de la pluralisation

### Hook useLanguage

Le hook personnalisé `useLanguage` offre :
- **language** : Langue courante
- **changeLanguage(lang)** : Fonction pour changer de langue avec sync API
- **availableLanguages** : Liste des langues disponibles avec drapeaux
- **isChanging** : État de chargement (extensible)

```tsx
const { language, changeLanguage, availableLanguages } = useLanguage();
```

Pour les utilisateurs authentifiés, le changement de langue :
1. Met à jour i18next localement
2. Sauvegarde dans localStorage
3. Appelle l'API `PATCH /users/me` avec `{ langue_preferee: newLang }`
4. Met à jour l'utilisateur dans le store

## 📚 Ressources

- [Documentation i18next](https://www.i18next.com/)
- [Documentation react-i18next](https://react.i18next.com/)
- [Guide i18next](https://www.i18next.com/overview/getting-started)

## 🚨 Points importants

1. **Toujours traduire** : Chaque clé doit exister dans FR et EN
2. **Structure identique** : Les fichiers FR et EN doivent avoir la même structure
3. **Pas de texte en dur** : Utiliser toujours `t()` pour les textes
4. **Interpolation** : Utiliser `{{variable}}` pour les variables dynamiques
5. **Pluralisation** : i18next gère automatiquement les pluriels

## 💡 Exemples avancés

### Avec pluralisation

```json
{
  "items": "{{count}} élément",
  "items_plural": "{{count}} éléments"
}
```

```tsx
t('items', { count: 1 }) // "1 élément"
t('items', { count: 5 }) // "5 éléments"
```

### Avec contexte

```json
{
  "friend": "Un ami",
  "friend_male": "Un ami",
  "friend_female": "Une amie"
}
```

```tsx
t('friend', { context: 'male' })   // "Un ami"
t('friend', { context: 'female' }) // "Une amie"
```

### Avec formatage de date

```tsx
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();
const formattedDate = new Date().toLocaleDateString(i18n.language);
```

## 🎨 Bonnes pratiques

1. **Organiser par fonctionnalité** : Créer un namespace par module majeur
2. **Garder les traductions courtes** : Préférer plusieurs clés plutôt qu'un long texte
3. **Tester les deux langues** : Vérifier que tout s'affiche correctement en FR et EN
4. **Commenter si nécessaire** : Ajouter des commentaires pour les traductions complexes
5. **Valider le JSON** : Utiliser un validateur JSON pour éviter les erreurs de syntaxe

## 🔄 Migration depuis du texte en dur

**Avant :**
```tsx
<button>Enregistrer</button>
```

**Après :**
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  return <button>{t('buttons.save')}</button>;
}
```

## 🔄 Synchronisation avec le Backend

Lorsqu'un utilisateur change de langue, la préférence est automatiquement sauvegardée :

1. **LocalStorage** : `user-language` - Pour la persistance locale
2. **API Backend** : `PATCH /users/me` - Pour synchroniser avec le profil utilisateur
3. **AuthStore** : Mise à jour de l'objet utilisateur

Au prochain login, la langue préférée est automatiquement détectée et appliquée.

## 🌐 Langues supportées

- 🇫🇷 **Français (fr)** - Langue par défaut
- 🇬🇧 **English (en)** - Disponible

### Langues futures (extensibles)
- 🇳🇱 Nederlands (nl)
- 🇩🇪 Deutsch (de)
- 🇪🇸 Español (es)

Pour ajouter une nouvelle langue :
1. Créer un dossier `locales/[code]/`
2. Ajouter tous les fichiers JSON de namespaces
3. Ajouter la langue dans `supportedLanguages` dans `index.ts`

---

**Maintenu par :** L'équipe ClubManager V3  
**Dernière mise à jour :** 2024  
**Agent :** Agent 2 - Infrastructure i18n