# 🥋 ClubManager V3

> Plateforme complète de gestion pour clubs de jiu-jitsu brésilien - Architecture moderne et scalable

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![RGPD Compliant](https://img.shields.io/badge/RGPD-Compliant-success)](./db/README.md)

---

## 📋 Vue d'ensemble

**ClubManager V3** est une refonte complète de la plateforme ClubManager, construite from scratch avec les meilleures pratiques modernes :

- ✅ **Clean Architecture** - Séparation claire des responsabilités
- ✅ **Architecture Modulaire** - 7 modules indépendants et testables
- ✅ **TypeScript Strict** - Type safety à 100%
- ✅ **Base de données v4.2** - RGPD compliant (Score 9.6/10)
- ✅ **Tests intégrés** - TDD avec Jest
- ✅ **API REST moderne** - Express + validation Zod

---

## 🎯 Fonctionnalités Principales

### 1. 👥 Gestion des Membres
- Inscription et profils utilisateurs
- Authentification sécurisée (JWT + Refresh tokens)
- Soft Delete + Anonymisation RGPD
- Gestion des grades (ceintures)

### 2. 👨‍👩‍👧‍👦 Gestion des Familles
- Création de comptes enfants sans email ni mot de passe
- Groupes familiaux avec rôles (parent, tuteur, enfant, conjoint)
- Chaque membre reçoit son propre `userId` unique
- Le parent gère inscriptions, paiements et suivi de ses enfants
- Connexion directe bloquée pour les comptes enfants (sécurité)

### 3. 📅 Planning & Cours
- Cours récurrents automatiques
- Réservations en ligne
- Gestion multi-professeurs
- Suivi des présences

### 4. 💰 Paiements & Abonnements
- Intégration Stripe
- Plans tarifaires flexibles
- Échéances automatiques
- Historique complet

### 5. 🛒 Boutique E-commerce
- Catalogue articles (kimonos, ceintures)
- Gestion stocks par taille
- Panier et commandes
- Inventaire temps réel

### 6. 💬 Messagerie
- Messages internes
- Templates personnalisés
- Notifications multi-canal

### 7. 🔔 Alertes Intelligentes
- Détection proactive
- Prioritisation (basse → critique)
- Actions traçables

### 8. 📊 Statistiques & Analytics
- Tableaux de bord
- Rapports personnalisables
- Métriques en temps réel

---

## 🏗️ Architecture

```
clubManager-V3/
├── backend/                    # Backend REST API
│   ├── src/
│   │   ├── modules/           # Modules fonctionnels
│   │   │   ├── auth/          # Authentification
│   │   │   ├── users/         # Gestion utilisateurs
│   │   │   ├── families/      # Gestion des familles ← nouveau
│   │   │   ├── payments/      # Paiements Stripe
│   │   │   ├── courses/       # Cours & planning
│   │   │   ├── store/         # E-commerce
│   │   │   ├── messaging/     # Messagerie
│   │   │   └── statistics/    # Analytics
│   │   ├── shared/            # Code partagé
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── errors/        # Gestion erreurs
│   │   │   ├── utils/         # Utilitaires
│   │   │   └── types/         # Types communs
│   │   └── core/              # Configuration centrale
│   │       ├── database/      # MySQL connection pool
│   │       └── config/        # App config
│   ├── tests/                 # Tests E2E
│   └── docs/                  # Documentation API
├── packages/                  # Packages partagés
│   ├── types/                 # Types TypeScript (réutilisés)
│   └── utils/                 # Utilitaires communs
├── db/                        # Base de données v4.2
│   ├── creation/              # Schema SQL complet
│   ├── procedures/            # Procédures stockées (10)
│   ├── triggers/              # Triggers automatiques (4)
│   └── README.md              # Documentation DB
└── docker-compose.yml         # Stack complète Docker
```

### Architecture par module (Clean Architecture)

Chaque module suit le pattern Clean Architecture :

```
modules/[module-name]/
├── domain/                    # Entités & logique métier
│   ├── entities/             # Entités du domaine
│   ├── value-objects/        # Value Objects
│   └── repositories/         # Interfaces repositories
├── application/              # Use Cases (logique applicative)
│   ├── use-cases/           # Use cases métier
│   └── dto/                 # Data Transfer Objects
├── infrastructure/           # Implémentations techniques
│   ├── repositories/        # Repositories MySQL
│   ├── services/            # Services externes (Stripe, etc.)
│   └── mappers/             # Mappers DTO ↔ Entity
├── presentation/             # Controllers & Routes
│   ├── controllers/         # Express controllers
│   ├── routes/              # Express routes
│   ├── validators/          # Validation Zod
│   └── middleware/          # Module-specific middleware
└── __tests__/                # Tests du module
    ├── unit/                # Tests unitaires
    ├── integration/         # Tests d'intégration
    └── fixtures/            # Données de test
```

---

## 🚀 Quick Start

### Prérequis

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MySQL** >= 8.0 ou **MariaDB** >= 10.6
- **Git**

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/Houthoofd/ClubManager.git
cd clubManager-V3

# 2. Installer les dépendances
npm install

# 3. Créer la base de données
mysql -u root -p < db/creation/SCHEMA_CONSOLIDATE.sql

# 4. Installer les procédures stockées
cd backend
npm run db:procedures
npm run db:triggers

# 5. Configurer l'environnement
cd backend
cp .env.example .env
# Éditer .env avec vos valeurs

# 6. Lancer le serveur de développement
npm run dev
```

Le serveur démarre sur `http://localhost:3000` 🎉

---

## 📦 Stack Technique

### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Node.js** | 18+ | Runtime JavaScript |
| **TypeScript** | 5.8 | Typage statique |
| **Express** | 4.19 | Framework web |
| **MySQL2** | 3.11 | Driver MySQL |
| **Zod** | 3.25 | Validation runtime |
| **Jest** | 29.7 | Testing framework |
| **JWT** | 9.0 | Authentification |
| **Bcrypt** | 5.1 | Hashing passwords |
| **Stripe** | 17.7 | Paiements |
| **SendGrid** | 8.1 | Emails |
| **Winston** | 3.11 | Logging |

### Base de Données

- **MySQL 8.0+** / **MariaDB 10.6+**
- **43 tables** organisées en 10 domaines (dont `familles` + `membres_famille`)
- **45 Foreign Keys** (intégrité référentielle)
- **~162 Index** (performance optimisée)
- **13 CHECK constraints** (validation métier)
- **10 Procédures stockées** + **4 Triggers**
- **Score sécurité : 9.6/10** (RGPD v4.3)

---

## 🛠️ Scripts Disponibles

### Backend

```bash
# Développement
npm run dev              # Lance le serveur en mode watch
npm run build            # Compile TypeScript → JavaScript
npm run start            # Lance le serveur compilé

# Tests
npm test                 # Lance tous les tests
npm run test:watch       # Tests en mode watch
npm run test:coverage    # Tests avec coverage
npm run test:unit        # Tests unitaires seulement
npm run test:e2e         # Tests E2E seulement

# Qualité de code
npm run lint             # Lint le code
npm run lint:fix         # Fix automatique
npm run typecheck        # Vérification types TypeScript
npm run format           # Format avec Prettier
npm run format:check     # Vérifie le formatage

# Base de données
npm run db:migrate       # Migrer le schéma complet
npm run db:procedures    # Installer procédures stockées
npm run db:triggers      # Installer triggers
```

### Racine (Monorepo)

```bash
# Global
npm run dev              # Lance le backend en dev
npm run build            # Build tous les workspaces
npm test                 # Tests sur tous les workspaces
npm run clean            # Nettoie dist/ + node_modules

# Docker
npm run docker:up        # Lance stack complète
npm run docker:down      # Arrête stack
npm run docker:logs      # Logs conteneurs
```

---

## 🗃️ Base de Données v4.2

### Installation

```bash
# Migration complète
mysql -u root -p < db/creation/SCHEMA_CONSOLIDATE.sql

# Ou via npm script
cd backend
npm run db:migrate
```

### Caractéristiques

- ✅ **RGPD Article 17** : Soft Delete + Anonymisation
- ✅ **Sécurité OWASP** : Passwords bcrypt, tokens SHA-256
- ✅ **Performance** : ~154 index stratégiques (x30 vitesse)
- ✅ **Intégrité** : 45 Foreign Keys
- ✅ **Validation** : 17 CHECK constraints

📖 Documentation complète : [`db/README.md`](./db/README.md)

---

## 🧪 Tests

### Philosophie

- **TDD** (Test-Driven Development)
- Tests **colocalisés** avec le code (`__tests__/`)
- Coverage minimum : **70%**

### Structure

```
src/modules/auth/
├── domain/
├── application/
├── infrastructure/
├── presentation/
└── __tests__/                 # Tests du module
    ├── unit/                  # Tests unitaires
    │   ├── use-cases/
    │   └── domain/
    ├── integration/           # Tests d'intégration
    │   └── repositories/
    └── fixtures/              # Données de test
        ├── users.fixture.ts
        └── tokens.fixture.ts
```

### Lancer les tests

```bash
# Tous les tests
npm test

# Un module spécifique
npm test -- auth

# Avec coverage
npm run test:coverage

# En mode watch
npm run test:watch
```

---

## 📝 Documentation API

La documentation complète de l'API sera disponible via **Swagger/OpenAPI** :

```bash
# Lancer le serveur
npm run dev

# Accéder à la doc
open http://localhost:3000/api-docs
```

---

## 🔒 Sécurité & Conformité

### RGPD v4.1

- ✅ Soft Delete + Anonymisation (Article 17)
- ✅ Audit Trail complet (Article 30)
- ✅ Chiffrement données sensibles (Article 32)
- ✅ Consentement tracking

### OWASP Top 10 2021

- ✅ A01 - Broken Access Control → JWT + RBAC
- ✅ A02 - Cryptographic Failures → Bcrypt + SHA-256
- ✅ A03 - Injection → Prepared statements
- ✅ A04 - Insecure Design → Clean Architecture
- ✅ A05 - Security Misconfiguration → Helmet + CSP
- ✅ A06 - Vulnerable Components → npm audit
- ✅ A07 - Authentication Failures → Rate limiting
- ✅ A08 - Software Data Integrity → Validation Zod
- ✅ A09 - Security Logging → Winston + monitoring
- ✅ A10 - SSRF → Input sanitization

**Score sécurité : 9.6/10** 🛡️

---

## 🐳 Docker

### Stack complète

```bash
# Lancer tous les services
docker-compose up -d

# Services disponibles :
# - Backend API    : http://localhost:3000
# - MySQL          : localhost:3306
# - Adminer (DB UI): http://localhost:8080
```

### Configuration

Fichier `docker-compose.yml` inclut :
- API Node.js (backend)
- MySQL 8.0
- Adminer (interface DB)
- Volumes persistants

---

## 📈 Roadmap

### ✅ Phase 1 : Avril 2025 (TERMINÉ)
- [x] Architecture projet
- [x] Base de données v4.3
- [x] Module Auth
- [x] Module Users
- [x] Module Payments
- [x] Module Families (V1 — comptes enfants + groupes familiaux)

### 🚧 Phase 2 : Mai 2025 (EN COURS)
- [ ] Module Courses
- [ ] Module Store
- [ ] Tests complets (70%+)
- [ ] Module Families V2 — niveaux d'accès (lecture seule pour ados)

### 📅 Phase 3 : Juin 2025
- [ ] Module Messaging
- [ ] Module Statistics
- [ ] Documentation API (OpenAPI)
- [ ] Integration tests E2E

### 🚀 Phase 4 : Juillet 2025
- [ ] Déploiement production
- [ ] CI/CD pipeline
- [ ] Monitoring & alerting
- [ ] **MISE EN LIGNE** 🎉

### 🎓 Phase 5 : Septembre 2025
- [ ] Présentation TFE
- [ ] Metrics & analytics
- [ ] Retour utilisateurs

---

## 🤝 Contribution

Ce projet est actuellement en développement actif pour un TFE.

### Guidelines

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'feat: Add AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Conventions

- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/)
- **Code Style** : ESLint + Prettier
- **Tests** : Coverage minimum 70%
- **TypeScript** : Strict mode

---

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👨‍💻 Auteur

**Benoit Houthoofd**

- GitHub: [@Houthoofd](https://github.com/Houthoofd)
- Projet: TFE 2025 - Gestion de club de jiu-jitsu

---

## 🙏 Remerciements

- **ClubManager v1 & v2** - Base et inspiration
- **Clean Architecture** - Robert C. Martin
- **TypeScript Community**
- **Node.js & Express Ecosystem**

---

## 📚 Documentation Additionnelle

- [📖 Architecture détaillée](./docs/ARCHITECTURE.md) _(à venir)_
- [👨‍👩‍👧‍👦 Système Familles — V1 & Roadmap V2](./docs/FAMILY_SYSTEM.md)
- [🗃️ Documentation Base de données](./db/README.md)
- [🔒 Guide Sécurité](./db/SECURITY_V4.0.md)
- [🧪 Guide Tests](./docs/TESTING.md) _(à venir)_
- [🚀 Guide Déploiement](./docs/DEPLOYMENT.md) _(à venir)_

---

<div align="center">

**⭐ Si ce projet vous intéresse, n'hésitez pas à lui donner une étoile ! ⭐**

Made with ❤️ and 🥋 by Benoit Houthoofd

</div>