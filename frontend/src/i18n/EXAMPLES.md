# 📚 Exemples d'utilisation du système i18n

Ce fichier contient des exemples pratiques d'utilisation du système d'internationalisation de ClubManager V3.

---

## 📖 Table des matières

1. [Installation et configuration](#installation-et-configuration)
2. [Exemples de base](#exemples-de-base)
3. [Utilisation des hooks personnalisés](#utilisation-des-hooks-personnalisés)
4. [Composant LanguageSwitcher](#composant-languageswitcher)
5. [Formatage des dates et nombres](#formatage-des-dates-et-nombres)
6. [Traductions avec interpolation](#traductions-avec-interpolation)
7. [Pluralisation](#pluralisation)
8. [Contexte](#contexte)
9. [Exemples complets de pages](#exemples-complets-de-pages)
10. [Bonnes pratiques](#bonnes-pratiques)

---

## Installation et configuration

### 1. Initialiser i18n dans l'application

**frontend/src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Importer la configuration i18n
import './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2. Vérifier que les traductions sont chargées

**App.tsx avec Suspense**

```tsx
import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <Suspense fallback={<div>Loading translations...</div>}>
      <BrowserRouter>
        {/* Votre application */}
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
```

---

## Exemples de base

### Exemple 1 : Traduction simple

```tsx
import { useTranslation } from 'react-i18next';

function Dashboard() {
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

### Exemple 2 : Utiliser plusieurs namespaces

```tsx
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t: tCommon } = useTranslation('common');
  const { t: tAuth } = useTranslation('auth');

  return (
    <div>
      <h1>{tAuth('login.title')}</h1>
      <form>
        <input placeholder={tAuth('login.email')} />
        <input placeholder={tAuth('login.password')} />
        <button>{tCommon('buttons.submit')}</button>
      </form>
    </div>
  );
}
```

### Exemple 3 : Traduction avec valeur par défaut

```tsx
import { useTranslation } from 'react-i18next';

function WelcomeMessage() {
  const { t } = useTranslation('common');

  return (
    <h1>
      {t('welcome.message', {
        defaultValue: 'Bienvenue dans ClubManager',
      })}
    </h1>
  );
}
```

---

## Utilisation des hooks personnalisés

### Hook `useLanguage`

```tsx
import { useLanguage } from '@/i18n/hooks';

function LanguageInfo() {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  return (
    <div>
      <p>Langue actuelle : {currentLanguage}</p>
      
      <select 
        value={currentLanguage} 
        onChange={(e) => changeLanguage(e.target.value as any)}
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### Hook `useI18n` (hook combiné)

```tsx
import { useI18n } from '@/i18n/hooks';

function ProfilePage() {
  const {
    t,
    currentLanguage,
    changeLanguage,
    formatDate,
    formatCurrency,
  } = useI18n('common');

  const user = {
    name: 'Jean Dupont',
    registeredAt: new Date('2024-01-15'),
    balance: 150.50,
  };

  return (
    <div>
      <h1>{t('navigation.profile')}</h1>
      <p>{t('common.name')}: {user.name}</p>
      <p>
        Inscrit le : {formatDate(user.registeredAt, 'long')}
      </p>
      <p>
        Solde : {formatCurrency(user.balance)}
      </p>
      
      <button onClick={() => changeLanguage('en')}>
        Switch to English
      </button>
    </div>
  );
}
```

### Hook `useFormatDate`

```tsx
import { useFormatDate } from '@/i18n/hooks';

function EventCard({ event }: { event: Event }) {
  const formatDate = useFormatDate();

  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>Date courte : {formatDate(event.date, 'short')}</p>
      <p>Date moyenne : {formatDate(event.date, 'medium')}</p>
      <p>Date longue : {formatDate(event.date, 'long')}</p>
      <p>Date complète : {formatDate(event.date, 'full')}</p>
    </div>
  );
}

// Résultat en FR :
// Date courte : 15/01/2024
// Date moyenne : 15 janv. 2024
// Date longue : 15 janvier 2024
// Date complète : lundi 15 janvier 2024
```

### Hook `useFormatNumber`

```tsx
import { useFormatNumber } from '@/i18n/hooks';

function Statistics() {
  const formatNumber = useFormatNumber();

  const stats = {
    members: 1234,
    courses: 56,
    percentage: 0.856,
  };

  return (
    <div>
      <p>Membres : {formatNumber(stats.members)}</p>
      <p>Cours : {formatNumber(stats.courses)}</p>
      <p>
        Taux : {formatNumber(stats.percentage, {
          style: 'percent',
          minimumFractionDigits: 1,
        })}
      </p>
    </div>
  );
}

// Résultat en FR : Membres : 1 234
// Résultat en EN : Members : 1,234
```

---

## Composant LanguageSwitcher

### Variante Dropdown

```tsx
import { LanguageSwitcher } from '@/i18n/components';

function Header() {
  return (
    <header>
      <h1>ClubManager V3</h1>
      <LanguageSwitcher 
        variant="dropdown" 
        showFlag 
        showLabel 
      />
    </header>
  );
}
```

### Variante Toggle

```tsx
import { LanguageSwitcher } from '@/i18n/components';

function Navbar() {
  return (
    <nav>
      <LanguageSwitcher 
        variant="toggle" 
        showFlag 
        onLanguageChange={(lng) => {
          console.log('Langue changée vers:', lng);
        }}
      />
    </nav>
  );
}
```

### Variante Buttons

```tsx
import { LanguageSwitcher } from '@/i18n/components';

function SettingsPage() {
  return (
    <div>
      <h2>Préférences de langue</h2>
      <LanguageSwitcher 
        variant="buttons" 
        showFlag 
        showLabel 
        className="my-custom-class"
      />
    </div>
  );
}
```

---

## Formatage des dates et nombres

### Formatage avancé des dates

```tsx
import { useI18n } from '@/i18n/hooks';

function CourseSchedule({ course }: { course: Course }) {
  const { formatDate, formatTime } = useI18n();

  return (
    <div>
      <h3>{course.name}</h3>
      <p>
        Date : {formatDate(course.startDate, 'full')}
      </p>
      <p>
        Heure de début : {formatTime(course.startDate, '24h')}
      </p>
      <p>
        Heure de fin : {formatTime(course.endDate, '24h')}
      </p>
    </div>
  );
}
```

### Formatage des devises

```tsx
import { useFormatCurrency } from '@/i18n/hooks';

function PriceList() {
  const formatCurrency = useFormatCurrency('EUR');

  const prices = [
    { name: 'Cours unique', price: 15 },
    { name: 'Abonnement mensuel', price: 80 },
    { name: 'Abonnement annuel', price: 800 },
  ];

  return (
    <ul>
      {prices.map((item) => (
        <li key={item.name}>
          {item.name} : {formatCurrency(item.price)}
        </li>
      ))}
    </ul>
  );
}
```

---

## Traductions avec interpolation

### Interpolation simple

```tsx
import { useTranslation } from 'react-i18next';

function UserGreeting({ userName }: { userName: string }) {
  const { t } = useTranslation('common');

  // Dans common.json : "greeting": "Bonjour {{name}} !"
  return <h1>{t('greeting', { name: userName })}</h1>;
}
```

### Interpolation avec erreurs de validation

```tsx
import { useTranslation } from 'react-i18next';

function ValidationMessage({ min, max }: { min: number; max: number }) {
  const { t } = useTranslation('errors');

  return (
    <div className="error">
      <p>{t('validation.minValue', { min })}</p>
      <p>{t('validation.maxValue', { max })}</p>
    </div>
  );
}

// Affiche : "La valeur doit être supérieure ou égale à 10"
// Affiche : "La valeur doit être inférieure ou égale à 100"
```

---

## Pluralisation

### Exemple de pluralisation automatique

**Ajouter dans common.json :**

```json
{
  "members": {
    "count_one": "{{count}} membre",
    "count_other": "{{count}} membres"
  }
}
```

**Utilisation :**

```tsx
import { useTranslation } from 'react-i18next';

function MemberCount({ count }: { count: number }) {
  const { t } = useTranslation('common');

  return <p>{t('members.count', { count })}</p>;
}

// count = 1 : "1 membre"
// count = 5 : "5 membres"
```

### Avec le hook `usePluralTranslation`

```tsx
import { usePluralTranslation } from '@/i18n/hooks';

function ItemsList({ items }: { items: any[] }) {
  const { tPlural } = usePluralTranslation('common');

  return (
    <p>{tPlural('items.count', items.length)}</p>
  );
}
```

---

## Contexte

### Traduction avec contexte (genre, etc.)

**Ajouter dans common.json :**

```json
{
  "member": "Membre",
  "member_male": "Membre masculin",
  "member_female": "Membre féminin"
}
```

**Utilisation :**

```tsx
import { useContextTranslation } from '@/i18n/hooks';

function MemberProfile({ member }: { member: Member }) {
  const { tContext } = useContextTranslation('common');

  return (
    <div>
      <h2>{tContext('member', member.gender)}</h2>
    </div>
  );
}
```

---

## Exemples complets de pages

### Page de connexion complète

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/i18n/components';

function LoginPage() {
  const { t: tAuth } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  const { t: tErrors } = useTranslation('errors');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email) {
      setError(tErrors('validation.required'));
      return;
    }
    
    if (!password) {
      setError(tAuth('errors.passwordRequired'));
      return;
    }

    try {
      // Logique de connexion...
      console.log('Connexion...');
    } catch (err) {
      setError(tAuth('errors.invalidCredentials'));
    }
  };

  return (
    <div className="login-page">
      <header>
        <LanguageSwitcher variant="toggle" showFlag />
      </header>

      <div className="login-card">
        <h1>{tAuth('login.title')}</h1>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{tAuth('login.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={tAuth('login.email')}
            />
          </div>

          <div className="form-group">
            <label>{tAuth('login.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tAuth('login.password')}
            />
          </div>

          <div className="form-group">
            <label>
              <input type="checkbox" />
              {tAuth('login.rememberMe')}
            </label>
          </div>

          <button type="submit" className="btn-primary">
            {tAuth('login.submit')}
          </button>

          <div className="links">
            <a href="/forgot-password">
              {tAuth('login.forgotPassword')}
            </a>
            <p>
              {tAuth('login.noAccount')}{' '}
              <a href="/register">{tAuth('login.register')}</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
```

### Page de paramètres complète

```tsx
import { useState } from 'react';
import { useI18n } from '@/i18n/hooks';
import { LanguageSwitcher } from '@/i18n/components';

function SettingsPage() {
  const { 
    t, 
    currentLanguage, 
    availableLanguages,
    formatDate 
  } = useI18n('settings');

  const [clubName, setClubName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    // Logique de sauvegarde...
    alert(t('messages.saveSuccess'));
  };

  return (
    <div className="settings-page">
      <header>
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </header>

      {/* Section Informations du club */}
      <section className="settings-section">
        <h2>{t('clubInfo.title')}</h2>
        <p className="description">{t('clubInfo.description')}</p>

        <div className="form-grid">
          <div className="form-group">
            <label>{t('clubInfo.name')}</label>
            <input
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder={t('clubInfo.namePlaceholder')}
            />
          </div>

          <div className="form-group">
            <label>{t('clubInfo.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('clubInfo.emailPlaceholder')}
            />
          </div>

          <div className="form-group">
            <label>{t('clubInfo.phone')}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('clubInfo.phonePlaceholder')}
            />
          </div>
        </div>
      </section>

      {/* Section Localisation */}
      <section className="settings-section">
        <h2>{t('localization.title')}</h2>
        <p className="description">{t('localization.description')}</p>

        <div className="form-group">
          <label>{t('localization.language')}</label>
          <LanguageSwitcher 
            variant="buttons" 
            showFlag 
            showLabel 
          />
        </div>

        <div className="form-group">
          <label>{t('localization.dateFormat')}</label>
          <div className="date-examples">
            <p>Court : {formatDate(new Date(), 'short')}</p>
            <p>Moyen : {formatDate(new Date(), 'medium')}</p>
            <p>Long : {formatDate(new Date(), 'long')}</p>
            <p>Complet : {formatDate(new Date(), 'full')}</p>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="actions">
        <button onClick={handleSave} className="btn-primary">
          {t('actions.save')}
        </button>
        <button className="btn-secondary">
          {t('actions.cancel')}
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;
```

### Composant de tableau avec traductions

```tsx
import { useI18n } from '@/i18n/hooks';

interface User {
  id: number;
  name: string;
  email: string;
  registeredAt: Date;
  status: 'active' | 'inactive';
}

function UsersTable({ users }: { users: User[] }) {
  const { t, formatDate } = useI18n('common');

  return (
    <div>
      <h2>{t('navigation.users')}</h2>

      {users.length === 0 ? (
        <div className="empty-state">
          {t('messages.noData')}
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{t('common.name')}</th>
              <th>{t('common.email')}</th>
              <th>{t('time.date')}</th>
              <th>{t('status.active')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{formatDate(user.registeredAt, 'medium')}</td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {t(`status.${user.status}`)}
                  </span>
                </td>
                <td>
                  <button>{t('buttons.edit')}</button>
                  <button>{t('buttons.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UsersTable;
```

---

## Bonnes pratiques

### 1. Toujours utiliser les traductions

❌ **Mauvais :**
```tsx
<button>Enregistrer</button>
```

✅ **Bon :**
```tsx
const { t } = useTranslation('common');
<button>{t('buttons.save')}</button>
```

### 2. Grouper les traductions par namespace

❌ **Mauvais :**
```tsx
const { t } = useTranslation('common');
const title = t('auth.login.title'); // Ne fonctionne pas !
```

✅ **Bon :**
```tsx
const { t } = useTranslation('auth');
const title = t('login.title');
```

### 3. Utiliser des clés descriptives

❌ **Mauvais :**
```json
{
  "btn1": "Enregistrer",
  "txt2": "Annuler"
}
```

✅ **Bon :**
```json
{
  "buttons": {
    "save": "Enregistrer",
    "cancel": "Annuler"
  }
}
```

### 4. Éviter les traductions imbriquées trop profondes

❌ **Trop complexe :**
```json
{
  "pages": {
    "dashboard": {
      "sections": {
        "statistics": {
          "cards": {
            "users": {
              "title": "Utilisateurs"
            }
          }
        }
      }
    }
  }
}
```

✅ **Mieux :**
```json
{
  "dashboard": {
    "usersCardTitle": "Utilisateurs"
  }
}
```

### 5. Utiliser l'interpolation pour les valeurs dynamiques

❌ **Mauvais :**
```tsx
<p>Bienvenue {userName} !</p>
```

✅ **Bon :**
```tsx
const { t } = useTranslation('common');
<p>{t('welcome', { name: userName })}</p>
```

### 6. Gérer les erreurs proprement

```tsx
import { useTranslation } from 'react-i18next';

function FormField({ error }: { error?: string }) {
  const { t } = useTranslation('errors');

  return (
    <div>
      <input />
      {error && (
        <span className="error">
          {t(`validation.${error}`, { 
            defaultValue: t('generic.unknownError') 
          })}
        </span>
      )}
    </div>
  );
}
```

---

## 🎉 Conclusion

Ces exemples couvrent la plupart des cas d'utilisation du système i18n. N'hésitez pas à les adapter à vos besoins spécifiques !

Pour plus d'informations, consultez :
- [README.md](./README.md) - Documentation complète
- [Documentation react-i18next](https://react.i18next.com/)
- [Documentation i18next](https://www.i18next.com/)

**Bon développement ! 🚀**