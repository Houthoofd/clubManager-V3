# 🔄 HANDOFF AGENT 2 → AGENT 3

## ✅ MISSION AGENT 2 ACCOMPLIE

L'infrastructure react-i18next est **complètement configurée et opérationnelle** :

### 1. Dépendances installées ✓
```json
"i18next": "^26.0.6",
"i18next-browser-languagedetector": "^8.2.1",
"react-i18next": "^17.0.4"
```

### 2. Structure de dossiers créée ✓
```
frontend/src/i18n/
├── index.ts                    ✓ Configuration i18next complète
├── hooks/
│   └── useLanguage.ts         ✓ Hook personnalisé avec sync API
├── locales/
│   ├── fr/                    ⚠️ VIDE - À REMPLIR PAR AGENT 3
│   │   └── .gitkeep
│   └── en/                    ⚠️ VIDE - À REMPLIR PAR AGENT 3
│       └── .gitkeep
└── README.md                   ✓ Documentation complète
```

### 3. Configuration i18next (index.ts) ✓
- Détection automatique de langue (localStorage → navigateur)
- 9 namespaces définis : `common`, `auth`, `settings`, `errors`, `courses`, `store`, `payments`, `statistics`, `messages`
- Langues supportées : `fr` (défaut), `en` (extensible : nl, de, es)
- Interpolation et pluralisation activées
- Lazy loading prêt

### 4. Hook useLanguage ✓
Fonctionnalités :
- `language` : langue courante
- `changeLanguage(lang)` : changement avec sync API backend (`PATCH /users/me`)
- `availableLanguages` : liste avec drapeaux
- Gestion d'erreur complète

### 5. App.tsx modifié ✓
- `<I18nextProvider i18n={i18n}>` wrapper ajouté
- Application prête à utiliser les traductions

---

## 🎯 MISSION AGENT 3

**Créer TOUS les fichiers de traduction JSON pour les 9 namespaces en FR et EN.**

### Fichiers à créer (18 fichiers JSON)

#### Français (fr/)
1. `common.json` - Éléments communs
2. `auth.json` - Authentification
3. `settings.json` - Paramètres
4. `errors.json` - Messages d'erreur
5. `courses.json` - Gestion des cours
6. `store.json` - Boutique
7. `payments.json` - Paiements
8. `statistics.json` - Statistiques
9. `messages.json` - Messagerie

#### Anglais (en/)
1. `common.json` - Common elements
2. `auth.json` - Authentication
3. `settings.json` - Settings
4. `errors.json` - Error messages
5. `courses.json` - Course management
6. `store.json` - Store
7. `payments.json` - Payments
8. `statistics.json` - Statistics
9. `messages.json` - Messaging

---

## 📋 STRUCTURE ATTENDUE PAR NAMESPACE

### 1. common.json
**Contenu :** Navigation, boutons génériques, labels communs, statuts, actions CRUD

```json
{
  "navigation": {
    "dashboard": "...",
    "courses": "...",
    "users": "...",
    "payments": "...",
    "store": "...",
    "messages": "...",
    "statistics": "...",
    "settings": "...",
    "profile": "...",
    "family": "...",
    "logout": "..."
  },
  "buttons": {
    "save": "...",
    "cancel": "...",
    "delete": "...",
    "edit": "...",
    "add": "...",
    "search": "...",
    "filter": "...",
    "export": "...",
    "import": "...",
    "close": "...",
    "confirm": "...",
    "back": "...",
    "next": "...",
    "submit": "...",
    "reset": "..."
  },
  "labels": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "address": "...",
    "city": "...",
    "zipCode": "...",
    "country": "...",
    "description": "...",
    "status": "...",
    "date": "...",
    "time": "...",
    "price": "...",
    "quantity": "...",
    "total": "...",
    "actions": "..."
  },
  "status": {
    "active": "...",
    "inactive": "...",
    "pending": "...",
    "completed": "...",
    "cancelled": "...",
    "draft": "..."
  },
  "common": {
    "loading": "...",
    "noData": "...",
    "error": "...",
    "success": "...",
    "warning": "...",
    "info": "...",
    "confirmation": "...",
    "welcomeBack": "..."
  }
}
```

### 2. auth.json
**Contenu :** Login, register, mot de passe, vérification email

```json
{
  "login": {
    "title": "...",
    "subtitle": "...",
    "emailLabel": "...",
    "emailPlaceholder": "...",
    "passwordLabel": "...",
    "passwordPlaceholder": "...",
    "rememberMe": "...",
    "forgotPassword": "...",
    "submitButton": "...",
    "noAccount": "...",
    "registerLink": "...",
    "success": "...",
    "error": "..."
  },
  "register": {
    "title": "...",
    "subtitle": "...",
    "firstNameLabel": "...",
    "lastNameLabel": "...",
    "emailLabel": "...",
    "passwordLabel": "...",
    "confirmPasswordLabel": "...",
    "submitButton": "...",
    "hasAccount": "...",
    "loginLink": "...",
    "terms": "...",
    "success": "...",
    "error": "..."
  },
  "forgotPassword": {
    "title": "...",
    "subtitle": "...",
    "emailLabel": "...",
    "submitButton": "...",
    "backToLogin": "...",
    "success": "...",
    "error": "..."
  },
  "resetPassword": {
    "title": "...",
    "subtitle": "...",
    "passwordLabel": "...",
    "confirmPasswordLabel": "...",
    "submitButton": "...",
    "success": "...",
    "error": "..."
  },
  "emailVerification": {
    "title": "...",
    "subtitle": "...",
    "verifying": "...",
    "success": "...",
    "error": "...",
    "resend": "..."
  }
}
```

### 3. errors.json
**Contenu :** Tous les messages d'erreur (validation, network, database, auth)

```json
{
  "network": {
    "timeout": "...",
    "connectionLost": "...",
    "serverError": "...",
    "notFound": "...",
    "unauthorized": "...",
    "forbidden": "..."
  },
  "validation": {
    "required": "...",
    "invalidEmail": "...",
    "invalidPhone": "...",
    "minLength": "...",
    "maxLength": "...",
    "passwordMismatch": "...",
    "invalidFormat": "..."
  },
  "auth": {
    "invalidCredentials": "...",
    "emailAlreadyExists": "...",
    "tokenExpired": "...",
    "sessionExpired": "...",
    "unauthorized": "..."
  },
  "generic": {
    "unexpected": "...",
    "tryAgain": "...",
    "contactSupport": "..."
  }
}
```

### 4. settings.json
**Contenu :** Configuration club, apparence, notifications, préférences

```json
{
  "title": "...",
  "tabs": {
    "general": "...",
    "appearance": "...",
    "notifications": "...",
    "security": "...",
    "advanced": "..."
  },
  "general": {
    "clubName": "...",
    "clubDescription": "...",
    "language": "...",
    "timezone": "...",
    "currency": "..."
  },
  "appearance": {
    "theme": "...",
    "darkMode": "...",
    "lightMode": "..."
  },
  "notifications": {
    "emailNotifications": "...",
    "pushNotifications": "...",
    "smsNotifications": "..."
  }
}
```

### 5. courses.json
**Contenu :** Gestion des cours, planning, inscriptions

```json
{
  "title": "...",
  "list": {
    "title": "...",
    "empty": "...",
    "addNew": "..."
  },
  "form": {
    "createTitle": "...",
    "editTitle": "...",
    "nameLabel": "...",
    "descriptionLabel": "...",
    "professorLabel": "...",
    "scheduleLabel": "...",
    "capacityLabel": "...",
    "priceLabel": "..."
  },
  "details": {
    "enrolledStudents": "...",
    "availableSpots": "...",
    "schedule": "...",
    "professor": "..."
  }
}
```

### 6. store.json
**Contenu :** Boutique, produits, panier, commandes

```json
{
  "title": "...",
  "products": {
    "title": "...",
    "empty": "...",
    "addToCart": "...",
    "outOfStock": "..."
  },
  "cart": {
    "title": "...",
    "empty": "...",
    "subtotal": "...",
    "total": "...",
    "checkout": "..."
  },
  "orders": {
    "title": "...",
    "orderNumber": "...",
    "orderDate": "...",
    "orderStatus": "..."
  }
}
```

### 7. payments.json
**Contenu :** Paiements, cotisations, factures, historique

```json
{
  "title": "...",
  "subscriptions": {
    "title": "...",
    "active": "...",
    "expired": "...",
    "renew": "..."
  },
  "invoices": {
    "title": "...",
    "number": "...",
    "date": "...",
    "amount": "...",
    "download": "..."
  },
  "history": {
    "title": "...",
    "empty": "..."
  }
}
```

### 8. statistics.json
**Contenu :** Tableaux de bord, rapports, graphiques

```json
{
  "title": "...",
  "dashboard": {
    "overview": "...",
    "totalMembers": "...",
    "activeCourses": "...",
    "revenue": "..."
  },
  "reports": {
    "title": "...",
    "generate": "...",
    "export": "..."
  },
  "charts": {
    "attendanceRate": "...",
    "revenueByMonth": "...",
    "membersByAge": "..."
  }
}
```

### 9. messages.json
**Contenu :** Messagerie, conversations, notifications

```json
{
  "title": "...",
  "inbox": {
    "title": "...",
    "empty": "...",
    "unread": "..."
  },
  "compose": {
    "title": "...",
    "toLabel": "...",
    "subjectLabel": "...",
    "messageLabel": "...",
    "send": "..."
  },
  "conversation": {
    "reply": "...",
    "forward": "...",
    "delete": "..."
  }
}
```

---

## 🎨 CONVENTIONS À RESPECTER

### 1. Nommage
- **camelCase** pour toutes les clés
- Noms en **anglais** (même pour FR)
- Structure identique entre FR et EN

### 2. Hiérarchie
- Maximum 3 niveaux de profondeur
- Grouper par fonctionnalité logique
- Cohérence entre tous les namespaces

### 3. Qualité
- Traductions naturelles et idiomatiques
- Pas de traduction littérale mot-à-mot
- Tonalité professionnelle mais accessible
- Pas de genre spécifique (utiliser des formulations neutres)

### 4. Format JSON
- Indentation : 2 espaces
- Pas de trailing commas
- Encodage UTF-8
- Validation JSON stricte

---

## ✅ CHECKLIST AGENT 3

- [ ] Créer `fr/common.json` avec navigation, boutons, labels
- [ ] Créer `fr/auth.json` avec login, register, passwords
- [ ] Créer `fr/settings.json` avec configuration
- [ ] Créer `fr/errors.json` avec tous les messages d'erreur
- [ ] Créer `fr/courses.json` avec gestion des cours
- [ ] Créer `fr/store.json` avec boutique
- [ ] Créer `fr/payments.json` avec paiements
- [ ] Créer `fr/statistics.json` avec statistiques
- [ ] Créer `fr/messages.json` avec messagerie
- [ ] Créer `en/common.json` (traduction anglaise)
- [ ] Créer `en/auth.json` (traduction anglaise)
- [ ] Créer `en/settings.json` (traduction anglaise)
- [ ] Créer `en/errors.json` (traduction anglaise)
- [ ] Créer `en/courses.json` (traduction anglaise)
- [ ] Créer `en/store.json` (traduction anglaise)
- [ ] Créer `en/payments.json` (traduction anglaise)
- [ ] Créer `en/statistics.json` (traduction anglaise)
- [ ] Créer `en/messages.json` (traduction anglaise)

---

## 📖 EXEMPLES DE QUALITÉ

### ✅ BON
```json
{
  "user": {
    "profile": {
      "editButton": "Modifier le profil",
      "saveSuccess": "Profil mis à jour avec succès"
    }
  }
}
```

### ❌ MAUVAIS
```json
{
  "user-profile-edit-button": "Editer",
  "msg_success_01": "OK"
}
```

---

## 🚀 COMMENCER MAINTENANT

**Agent 3, vous pouvez créer les 18 fichiers JSON immédiatement.**

Chemins exacts :
- `frontend/src/i18n/locales/fr/*.json`
- `frontend/src/i18n/locales/en/*.json`

**Tout est prêt pour recevoir vos traductions !**

---

**Infrastructure créée par :** Agent 2  
**Date :** 2024  
**Status :** ✅ Prêt pour Agent 3