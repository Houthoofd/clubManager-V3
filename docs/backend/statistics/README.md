# Statistics Module

Module de statistiques et d'analytics pour ClubManager V3. Fournit des statistiques en temps réel sur les membres, les cours, les finances et la boutique.

## 📋 Table des matières

- [Architecture](#architecture)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [API Reference](#api-reference)
- [Types de données](#types-de-données)
- [Base de données](#base-de-données)
- [Exemples](#exemples)
- [Tests](#tests)

## 🏗️ Architecture

Le module suit les principes de la **Clean Architecture** avec une séparation claire des responsabilités :

```
statistics/
├── domain/
│   └── repositories/
│       └── StatisticsRepository.ts      # Interface du repository
├── application/
│   └── usecases/
│       ├── GetDashboardAnalytics.ts     # Récupérer analytics dashboard
│       ├── GetMemberAnalytics.ts        # Récupérer analytics membres
│       ├── GetCourseAnalytics.ts        # Récupérer analytics cours
│       ├── GetFinancialAnalytics.ts     # Récupérer analytics finances
│       ├── GetStoreAnalytics.ts         # Récupérer analytics boutique
│       └── GetTrendAnalytics.ts         # Récupérer analytics tendances
├── infrastructure/
│   └── repositories/
│       └── MySQLStatisticsRepository.ts # Implémentation MySQL
├── presentation/
│   ├── controllers/
│   │   └── StatisticsController.ts     # Contrôleur HTTP
│   ├── routes/
│   │   └── statistics.routes.ts        # Routes Express
│   └── middlewares/                     # Middlewares (validation, auth)
└── index.ts                             # Point d'entrée du module
```

## 📦 Installation

Le module est déjà intégré au backend ClubManager V3. Aucune installation supplémentaire n'est nécessaire.

### Dépendances

- `mysql2` - Client MySQL pour Node.js
- `@clubmanager/types` - Types partagés
- `express` - Framework web
- `zod` - Validation de schéma

## 🚀 Utilisation

### Intégration dans l'application

```typescript
// Dans votre fichier principal (server.ts ou app.ts)
import { statisticsRouter } from './modules/statistics/index.js';

// Monter le router
app.use('/api/statistics', statisticsRouter);
```

### Configuration de la base de données

Le module utilise la configuration MySQL définie dans `core/config/database.ts`. Assurez-vous que les variables d'environnement suivantes sont définies :

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=clubmanager
DB_CONNECTION_LIMIT=10
```

## 📚 API Reference

### Endpoints disponibles

#### 1. Dashboard Analytics
```http
GET /api/statistics/dashboard
```

**Query Parameters:**
- `date_debut` (optional): ISO date string - Date de début
- `date_fin` (optional): ISO date string - Date de fin
- `period_type` (optional): `day` | `week` | `month` | `quarter` | `year` - Granularité (défaut: `month`)
- `include_trends` (optional): boolean - Inclure les tendances (défaut: `true`)

**Response:**
```json
{
  "success": true,
  "data": {
    "members": { /* Member analytics */ },
    "courses": { /* Course analytics */ },
    "finance": { /* Financial analytics */ },
    "store": { /* Store analytics */ },
    "trends": { /* Trend analytics */ },
    "generated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Member Analytics
```http
GET /api/statistics/members
```

**Query Parameters:**
- `date_debut` (optional): ISO date string
- `date_fin` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_membres": 150,
      "membres_actifs": 140,
      "membres_inactifs": 10,
      "nouveaux_membres_mois": 12,
      "nouveaux_membres_semaine": 3,
      "taux_croissance": 8.5,
      "date_calcul": "2024-01-15T10:30:00.000Z"
    },
    "by_grade": [
      {
        "grade_id": 1,
        "grade_nom": "Ceinture blanche",
        "count": 45,
        "pourcentage": 30.0
      }
    ],
    "by_gender": [
      {
        "genre_id": 1,
        "genre_nom": "Homme",
        "count": 90,
        "pourcentage": 60.0
      }
    ],
    "by_age_group": [
      {
        "groupe_age": "18-25",
        "count": 35,
        "pourcentage": 23.3
      }
    ]
  }
}
```

#### 3. Course Analytics
```http
GET /api/statistics/courses
```

**Query Parameters:**
- `date_debut` (optional): ISO date string
- `date_fin` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_cours": 120,
      "total_inscriptions": 1850,
      "total_presences": 1665,
      "taux_presence": 90.0,
      "moyenne_participants_par_cours": 15.4,
      "date_calcul": "2024-01-15T10:30:00.000Z"
    },
    "by_type": [ /* Stats par type de cours */ ],
    "popular_courses": [ /* Cours populaires */ ],
    "by_day_of_week": [ /* Stats par jour de la semaine */ ]
  }
}
```

#### 4. Financial Analytics
```http
GET /api/statistics/financial
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_revenus": 25000.00,
      "total_paiements_valides": 145,
      "total_paiements_en_attente": 8,
      "total_paiements_echoues": 2,
      "montant_en_attente": 800.00,
      "montant_echeances_retard": 450.00,
      "nombre_echeances_retard": 5,
      "taux_paiement": 96.0
    },
    "by_payment_method": [ /* Stats par méthode de paiement */ ],
    "by_subscription_plan": [ /* Stats par plan d'abonnement */ ],
    "late_payments": [ /* Détails des paiements en retard */ ]
  }
}
```

#### 5. Store Analytics
```http
GET /api/statistics/store
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_commandes": 85,
      "commandes_payees": 78,
      "commandes_en_attente": 5,
      "commandes_annulees": 2,
      "total_revenus": 12500.00,
      "panier_moyen": 160.25,
      "total_articles_vendus": 245,
      "taux_conversion": 0
    },
    "popular_products": [ /* Produits populaires */ ],
    "by_category": [ /* Ventes par catégorie */ ],
    "low_stock": [ /* Alertes stock bas */ ]
  }
}
```

#### 6. Trend Analytics
```http
GET /api/statistics/trends
```

**Query Parameters (Required):**
- `date_debut`: ISO date string
- `date_fin`: ISO date string
- `period_type` (optional): `day` | `week` | `month` | `quarter` | `year`

**Response:**
```json
{
  "success": true,
  "data": {
    "member_growth": {
      "type": "member_growth",
      "period_type": "month",
      "data": [
        {
          "periode": "2024-01",
          "date_debut": "2024-01-01T00:00:00.000Z",
          "date_fin": "2024-01-31T23:59:59.000Z",
          "valeur": 12,
          "variation": 8.5
        }
      ],
      "total_variation": 15.3,
      "moyenne": 10.5
    },
    "attendance": { /* Tendance de présence */ },
    "revenue": { /* Tendance des revenus */ }
  }
}
```

#### 7. Specific Metrics
```http
GET /api/statistics/metrics/:metric
```

**Available Metrics:**
- `total-members` - Total des membres
- `active-members` - Membres actifs
- `new-members` - Nouveaux membres (nécessite date range)
- `total-courses` - Total des cours
- `attendance-rate` - Taux de présence
- `total-revenue` - Revenus totaux
- `late-payments-count` - Nombre de paiements en retard
- `late-payments-amount` - Montant des paiements en retard
- `total-orders` - Total des commandes
- `store-revenue` - Revenus de la boutique

**Example:**
```http
GET /api/statistics/metrics/total-members
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metric": "total-members",
    "value": 150,
    "date_range": null,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 8. Health Check
```http
GET /api/statistics/health
```

**Response:**
```json
{
  "success": true,
  "message": "Statistics service is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📊 Types de données

Tous les types sont définis dans `@clubmanager/types` et validés avec Zod.

### AnalyticsDateRange
```typescript
{
  date_debut: Date;
  date_fin: Date;
}
```

### PeriodType
```typescript
type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year';
```

### MemberAnalyticsResponse
Voir `packages/types/src/validators/statistics/analytics.validators.ts`

## 🗄️ Base de données

### Tables utilisées

Le module interroge les tables suivantes :

- **utilisateurs** - Données des membres (grade, genre, date de naissance, statut)
- **grades** - Grades/ceintures
- **genres** - Genres (Homme, Femme, Autre)
- **cours** - Cours programmés
- **inscriptions** - Inscriptions aux cours avec présences
- **paiements** - Paiements effectués
- **echeances_paiements** - Échéances de paiement
- **abonnements** - Abonnements des membres
- **plans_abonnement** - Plans d'abonnement disponibles
- **commandes** - Commandes boutique
- **commande_articles** - Lignes de commandes
- **articles** - Articles de la boutique
- **categories_articles** - Catégories d'articles
- **stock** - Stocks d'articles

### Optimisations SQL

Les requêtes sont optimisées avec :
- Agrégations groupées pour réduire les lectures
- Sous-requêtes pour les calculs de pourcentages
- Indexation recommandée sur :
  - `utilisateurs.date_inscription`
  - `utilisateurs.status`
  - `cours.date_cours`
  - `paiements.date_paiement`
  - `paiements.statut`
  - `commandes.date_commande`
  - `commandes.statut_paiement`

## 💡 Exemples

### Example 1: Récupérer les analytics du mois courant

```typescript
import axios from 'axios';

const currentMonth = {
  date_debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  date_fin: new Date()
};

const response = await axios.get('/api/statistics/dashboard', {
  params: {
    date_debut: currentMonth.date_debut.toISOString(),
    date_fin: currentMonth.date_fin.toISOString(),
    period_type: 'week'
  }
});

console.log(response.data);
```

### Example 2: Récupérer uniquement les stats de membres

```typescript
const response = await axios.get('/api/statistics/members');
const { overview, by_grade, by_gender, by_age_group } = response.data.data;

console.log(`Total membres: ${overview.total_membres}`);
console.log(`Membres actifs: ${overview.membres_actifs}`);
console.log(`Taux de croissance: ${overview.taux_croissance}%`);
```

### Example 3: Utilisation directe du repository

```typescript
import { statisticsRepository } from './modules/statistics/index.js';

// Récupérer le total des membres
const totalMembers = await statisticsRepository.getTotalMembers();

// Récupérer les membres actifs
const activeMembers = await statisticsRepository.getTotalMembers(true);

// Récupérer les analytics financières
const financialAnalytics = await statisticsRepository.getFinancialAnalytics({
  date_debut: new Date('2024-01-01'),
  date_fin: new Date('2024-12-31')
});
```

### Example 4: Utilisation des Use Cases

```typescript
import { GetDashboardAnalytics } from './modules/statistics/index.js';
import { statisticsRepository } from './modules/statistics/index.js';

const useCase = new GetDashboardAnalytics(statisticsRepository);

const analytics = await useCase.execute({
  dateRange: {
    date_debut: new Date('2024-01-01'),
    date_fin: new Date('2024-12-31')
  },
  periodType: 'month',
  includeTrends: true
});

console.log(analytics);
```

## 🧪 Tests

### Lancer les tests

```bash
npm test -- statistics
```

### Test unitaires

Les tests unitaires couvrent :
- Les use cases
- Le repository (avec mock de la base de données)
- Le contrôleur (avec mock des use cases)

### Tests d'intégration

Les tests d'intégration vérifient :
- Les routes Express
- L'intégration avec la base de données
- Les validations de données

### Coverage

Le module vise un coverage de test de **80%+**.

## 🔒 Sécurité

### Authentification

Les routes de statistiques devraient être protégées par un middleware d'authentification. Exemple :

```typescript
import { authMiddleware } from '../shared/middlewares/auth.js';

app.use('/api/statistics', authMiddleware, statisticsRouter);
```

### Autorisation

Seuls les utilisateurs avec le rôle **Admin** devraient avoir accès aux statistiques :

```typescript
import { requireRole } from '../shared/middlewares/authorization.js';

app.use('/api/statistics', authMiddleware, requireRole('admin'), statisticsRouter);
```

### Validation des données

Toutes les requêtes sont validées avec Zod pour éviter les injections et les données invalides.

## 🔧 Configuration

### Variables d'environnement

```env
# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=clubmanager
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

# Cache (optionnel pour optimisation)
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=300
```

## 📈 Performance

### Recommandations

1. **Mise en cache** : Implémenter un cache Redis pour les statistiques fréquemment consultées
2. **Indexation** : Créer des index sur les colonnes utilisées dans les `WHERE` et `GROUP BY`
3. **Pagination** : Limiter les résultats pour les listes (ex: produits populaires)
4. **Compression** : Activer la compression gzip pour les réponses HTTP

### Temps de réponse attendus

- Dashboard complet : < 1000ms
- Analytics par module : < 500ms
- Métriques simples : < 100ms

## 🚧 Développement futur

### Fonctionnalités prévues

- [ ] Export des statistiques en PDF/Excel
- [ ] Statistiques personnalisées par utilisateur
- [ ] Alertes automatiques (seuils configurables)
- [ ] Comparaisons période vs période
- [ ] Prédictions basées sur les tendances
- [ ] Dashboard temps réel avec WebSockets
- [ ] Rapports programmés par email

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation API complète

## 📝 License

MIT License - ClubManager V3

---

**Version:** 1.0.0  
**Dernière mise à jour:** 2024-01-15