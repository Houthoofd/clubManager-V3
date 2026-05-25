# 🚀 Guide de démarrage rapide - i18n

Guide d'installation et d'utilisation rapide du système d'internationalisation de ClubManager V3.

---

## ⚡ Installation en 5 minutes

### 1️⃣ Installer les dépendances

```bash
cd frontend
pnpm add i18next react-i18next i18next-browser-languagedetector
```

### 2️⃣ Initialiser i18n dans votre application

Modifiez `frontend/src/main.tsx` :

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ⚡ Ajouter cette ligne
import './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 3️⃣ Ajouter Suspense dans votre App

Modifiez `frontend/src/App.tsx` :

```tsx
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      {/* Votre contenu existant */}
    </Suspense>
  );
}

export default App;
```

### 4️⃣ Utiliser les traductions

Dans n'importe quel composant :

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');

  return (
    <div>
      <h1>{t('navigation.dashboard')}</h1>
      <button>{t('buttons.save')}</button>
      <button>{t('buttons.cancel')}</button>
    </div>
  );
}
```

---

## 📚 Namespaces disponibles

Utilisez le namespace approprié selon votre besoin :

| Namespace | Usage | Exemple |
|-----------|-------|---------|
| `common` | Éléments communs | `t('buttons.save')` |
| `auth` | Authentification | `t('login.title')` |
| `settings` | Paramètres | `t('clubInfo.name')` |
| `errors` | Messages d'erreur | `t('validation.required')` |

---

## 🌍 Ajouter un sélecteur de langue

```tsx
import { LanguageSwitcher } from '@/i18n/components';

function Header() {
  return (
    <header>
      <h1>ClubManager V3</h1>
      <LanguageSwitcher variant="toggle" showFlag />
    </header>
  );
}
```

**Variantes disponibles :**
- `dropdown` - Menu déroulant
- `toggle` - Boutons côte à côte
- `buttons` - Boutons séparés

---

## 🎯 Exemples rapides

### Exemple 1 : Page de connexion

```tsx
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t } = useTranslation('auth');

  return (
    <div>
      <h1>{t('login.title')}</h1>
      <input placeholder={t('login.email')} />
      <input placeholder={t('login.password')} type="password" />
      <button>{t('login.submit')}</button>
    </div>
  );
}
```

### Exemple 2 : Plusieurs namespaces

```tsx
import { useTranslation } from 'react-i18next';

function Dashboard() {
  const { t: tCommon } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');

  return (
    <div>
      <h1>{tCommon('navigation.dashboard')}</h1>
      <p>{tErrors('messages.loading')}</p>
    </div>
  );
}
```

### Exemple 3 : Formatage de date et devise

```tsx
import { useI18n } from '@/i18n/hooks';

function Profile() {
  const { t, formatDate, formatCurrency } = useI18n('common');

  return (
    <div>
      <h1>{t('navigation.profile')}</h1>
      <p>Inscrit le : {formatDate(new Date(), 'long')}</p>
      <p>Solde : {formatCurrency(150.50)}</p>
    </div>
  );
}
```

### Exemple 4 : Avec interpolation

```tsx
import { useTranslation } from 'react-i18next';

function Welcome({ userName }: { userName: string }) {
  const { t } = useTranslation('common');

  // Nécessite d'ajouter "welcome": "Bienvenue {{name}} !" dans common.json
  return <h1>{t('welcome', { name: userName })}</h1>;
}
```

---

## 🔑 Clés de traduction les plus utilisées

### Common (Boutons)
```tsx
t('buttons.save')      // Enregistrer
t('buttons.cancel')    // Annuler
t('buttons.delete')    // Supprimer
t('buttons.edit')      // Modifier
t('buttons.add')       // Ajouter
t('buttons.close')     // Fermer
```

### Common (Navigation)
```tsx
t('navigation.dashboard')   // Tableau de bord
t('navigation.users')       // Utilisateurs
t('navigation.courses')     // Cours
t('navigation.settings')    // Paramètres
```

### Common (Status)
```tsx
t('status.active')     // Actif
t('status.inactive')   // Inactif
t('status.pending')    // En attente
```

### Errors (Validation)
```tsx
t('validation.required')      // Ce champ est requis
t('validation.emailInvalid')  // Adresse email invalide
t('validation.tooShort')      // Valeur trop courte
```

---

## 🎨 Changer de langue manuellement

```tsx
import { useLanguage } from '@/i18n/hooks';

function MyComponent() {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div>
      <p>Langue actuelle : {currentLanguage}</p>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('fr')}>Français</button>
    </div>
  );
}
```

---

## 🛠️ Ajouter une nouvelle traduction

### 1. Ajouter dans les fichiers JSON

**locales/fr/common.json :**
```json
{
  "mySection": {
    "myKey": "Ma traduction en français"
  }
}
```

**locales/en/common.json :**
```json
{
  "mySection": {
    "myKey": "My translation in English"
  }
}
```

### 2. Utiliser dans un composant

```tsx
const { t } = useTranslation('common');
<p>{t('mySection.myKey')}</p>
```

---

## 🐛 Dépannage rapide

### Erreur : "Translation key not found"
✅ Vérifiez que la clé existe dans le fichier JSON
✅ Vérifiez que vous utilisez le bon namespace
✅ Relancez le serveur de développement

### Les traductions ne changent pas
✅ Videz le cache du navigateur
✅ Vérifiez le localStorage (clé: 'user-language')
✅ Relancez l'application

### Erreur au build
✅ Vérifiez que tous les fichiers JSON sont valides
✅ Assurez-vous que les imports sont corrects
✅ Vérifiez que les dépendances sont installées

---

## 📖 Ressources supplémentaires

- **Documentation complète :** [README.md](./README.md)
- **Exemples détaillés :** [EXAMPLES.md](./EXAMPLES.md)
- **Résumé de la mission :** [MISSION_COMPLETE.md](./MISSION_COMPLETE.md)
- **Documentation i18next :** https://www.i18next.com/
- **Documentation react-i18next :** https://react.i18next.com/

---

## ✅ Checklist de démarrage

- [ ] Dépendances installées (`pnpm add i18next react-i18next i18next-browser-languagedetector`)
- [ ] Import de `./i18n` dans `main.tsx`
- [ ] `Suspense` ajouté dans `App.tsx`
- [ ] Premier composant avec `useTranslation` fonctionne
- [ ] Sélecteur de langue ajouté (optionnel)
- [ ] Test du changement de langue FR ↔ EN

---

## 🎉 C'est tout !

Vous êtes maintenant prêt à utiliser le système d'internationalisation de ClubManager V3 !

Pour des cas d'usage plus avancés, consultez :
- **README.md** - Documentation complète
- **EXAMPLES.md** - Exemples de code détaillés
- **types.ts** - Définitions TypeScript pour l'autocomplétion

**Bon développement ! 🚀**