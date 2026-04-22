# 📊 Statistics Module - Quick Start Guide

Guide de démarrage rapide pour le module Statistiques de ClubManager V3.

## 🎯 Aperçu

Le module Statistiques fournit un dashboard complet d'analytics pour votre club de jiu-jitsu avec :

- 👥 **Statistiques Membres** : Croissance, démographie, répartition par grade
- 📅 **Statistiques Cours** : Taux de présence, cours populaires, fréquentation
- 💰 **Statistiques Finances** : Revenus, paiements en retard, méthodes de paiement
- 🛍️ **Statistiques Magasin** : Ventes, produits populaires, alertes de stock
- 📈 **Tendances** : Évolution temporelle de toutes les métriques

## ⚡ Démarrage Rapide (5 minutes)

### 1️⃣ Installation des dépendances

```bash
# À la racine du projet
pnpm install
```

### 2️⃣ Configuration de la base de données

Assurez-vous que votre base de données MySQL est configurée et accessible :

```bash
# Variables d'environnement Backend (créer backend/.env)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=clubmanager
PORT=3001
NODE_ENV=development
```

### 3️⃣ Démarrage du Backend

```bash
cd backend
pnpm dev
```

Le serveur démarre sur `http://localhost:3001`

✅ Vérifiez que le serveur fonctionne : `http://localhost:3001/health`

### 4️⃣ Démarrage du Frontend

```bash
# Dans un nouveau terminal
cd frontend
pnpm dev
```

Le frontend démarre sur `http://localhost:5173`

### 5️⃣ Accéder aux Statistiques

Ouvrez votre navigateur et allez sur :

```
http://localhost:5173/statistics
```

🎉 **Vous devriez voir le dashboard de statistiques !**

## 📍 Navigation

Une fois dans l'application :

1. **Sidebar gauche** : Menu de navigation
2. Cliquez sur **"Statistiques"**
3. Vous verrez 5 sous-pages disponibles :
   - **Dashboard** : Vue d'ensemble complète
   - **Membres** : Analytics détaillées des membres
   - **Cours** : Fréquentation et présences
   - **Finances** : Revenus et paiements
   - **Magasin** : Ventes et inventaire

## 🔌 Endpoints API

Le backend expose les endpoints suivants (tous préfixés par `/api/statistics`) :

### Récupérer toutes les statistiques
```http
GET /api/statistics/dashboard
```

**Query Parameters (optionnels) :**
- `date_debut` : Date de début (ISO 8601)
- `date_fin` : Date de fin (ISO 8601)
- `period_type` : Type de période (`day`, `week`, `month`, `quarter`, `year`)
- `include_trends` : Inclure les tendances (boolean)

**Exemple :**
```bash
curl http://localhost:3001/api/statistics/dashboard?date_debut=2024-01-01&date_fin=2024-12-31&period_type=month
```

### Statistiques Membres
```http
GET /api/statistics/members
```

### Statistiques Cours
```http
GET /api/statistics/courses
```

### Statistiques Finances
```http
GET /api/statistics/finance
```

### Statistiques Magasin
```http
GET /api/statistics/store
```

### Tendances
```http
GET /api/statistics/trends
```

## 🧪 Tester avec des données

Pour tester le module, vous aurez besoin de données dans votre base de données :

### Option 1 : Données de test (recommandé)

Créez des données de test dans votre base de données :

```sql
-- Insérer des utilisateurs de test
INSERT INTO utilisateurs (first_name, last_name, email, ...) VALUES (...);

-- Insérer des cours de test
INSERT INTO cours (type_cours, date_cours, ...) VALUES (...);

-- Insérer des inscriptions de test
INSERT INTO inscriptions (utilisateur_id, cours_id, ...) VALUES (...);

-- Insérer des paiements de test
INSERT INTO paiements (utilisateur_id, montant, ...) VALUES (...);

-- Insérer des commandes de test
INSERT INTO commandes (utilisateur_id, total, ...) VALUES (...);
```

### Option 2 : Utiliser vos données existantes

Si vous avez déjà des données dans votre base, le module les utilisera automatiquement.

## 📱 Utilisation du Frontend

### Filtrer par période

1. Cliquez sur le **PeriodSelector** en haut à droite
2. Sélectionnez une période prédéfinie :
   - Aujourd'hui
   - Cette semaine
   - Ce mois
   - 30 derniers jours
   - 90 derniers jours
   - Cette année
   - Personnalisé (choisissez vos dates)

3. Les statistiques se mettent à jour automatiquement

### Actualiser les données

Cliquez sur le bouton **"Actualiser"** pour recharger les statistiques.

### Navigation entre les pages

Utilisez les onglets ou la sidebar pour naviguer entre :
- Dashboard (vue d'ensemble)
- Pages détaillées (Membres, Cours, Finances, Magasin)

## 🎨 Personnalisation

### Modifier les couleurs

Les couleurs sont définies par PatternFly. Pour personnaliser :

```css
/* frontend/src/index.css ou un fichier CSS personnalisé */
:root {
  --pf-global-primary-color--100: #0066CC; /* Votre couleur primaire */
  --pf-global-success-color--100: #3E8635; /* Vert de succès */
  --pf-global-danger-color--100: #C9190B;  /* Rouge de danger */
}
```

### Modifier les périodes par défaut

Éditez `frontend/src/features/statistics/stores/filtersStore.ts` :

```typescript
const getDefaultState = () => {
  const preset: PresetPeriod = 'thisMonth'; // Changez ici
  // ...
};
```

## 🔧 Développement

### Architecture du code

```
Module Statistiques
│
├── Backend (backend/src/modules/statistics/)
│   ├── domain/           # Interfaces et contrats
│   ├── application/      # Use cases (logique métier)
│   ├── infrastructure/   # Implémentation (MySQL)
│   └── presentation/     # Routes et contrôleurs
│
└── Frontend (frontend/src/features/statistics/)
    ├── components/       # Composants réutilisables
    ├── hooks/           # React Query hooks
    ├── pages/           # Pages complètes
    ├── api/             # Client API
    └── stores/          # État global (Zustand)
```

### Ajouter une nouvelle statistique

1. **Backend** :
   - Ajouter la méthode dans `IStatisticsRepository`
   - Implémenter dans `MySQLStatisticsRepository`
   - Créer un use case si nécessaire
   - Ajouter une route dans le contrôleur

2. **Frontend** :
   - Ajouter la fonction API dans `api/statistics.api.ts`
   - Créer un hook dans `hooks/useStatistics.ts`
   - Ajouter un composant pour afficher la stat
   - Mettre à jour la page concernée

### Debugging

**Backend - Logs :**
```bash
# Les logs apparaissent dans la console du serveur
cd backend
pnpm dev
# Observez les requêtes SQL et les erreurs
```

**Frontend - React Query DevTools :**
```typescript
// Déjà configuré dans App.tsx
// Ouvrez l'onglet DevTools en bas de la page (mode développement)
```

**Vérifier les requêtes API :**
```bash
# Utilisez les DevTools du navigateur
# Onglet Network > Filter par "statistics"
# Inspectez les réponses JSON
```

## 🐛 Dépannage

### Problème : "Cannot connect to database"

**Solution :**
1. Vérifiez que MySQL est démarré
2. Vérifiez les credentials dans `backend/.env`
3. Vérifiez que la base de données `clubmanager` existe

```bash
mysql -u root -p
CREATE DATABASE IF NOT EXISTS clubmanager;
```

### Problème : "No data available"

**Solution :**
1. Vérifiez que vous avez des données dans la base
2. Vérifiez les filtres de date (peut-être aucune donnée dans cette période)
3. Changez la période sélectionnée

### Problème : "Failed to fetch"

**Solution :**
1. Vérifiez que le backend est démarré (`http://localhost:3001/health`)
2. Vérifiez les CORS dans `backend/src/server.ts`
3. Vérifiez l'URL de l'API dans le frontend

### Problème : "Type errors" dans le frontend

**Solution :**
```bash
cd frontend
pnpm install
# Redémarrez le serveur de dev
```

### Problème : Statistiques incorrectes

**Solution :**
1. Vérifiez les données dans la base directement
2. Vérifiez les requêtes SQL dans `MySQLStatisticsRepository.ts`
3. Activez les logs SQL pour voir les requêtes exécutées

## 📚 Documentation Complète

Pour plus d'informations détaillées :

- **Frontend** : `frontend/src/features/statistics/README.md`
- **Backend** : `backend/src/modules/statistics/README.md`
- **Types** : `packages/types/src/validators/statistics/`

## 🚀 Prochaines étapes

Une fois le module statistiques fonctionnel :

1. ✅ Explorez les différentes pages de statistiques
2. ✅ Testez les filtres de période
3. ✅ Vérifiez que les données correspondent à votre base
4. ✅ Personnalisez les couleurs et le style si nécessaire
5. ✅ Intégrez avec les autres modules à venir

## 💡 Conseils

- **Performance** : Les statistiques sont mises en cache pendant 5 minutes (React Query)
- **Temps réel** : Utilisez le bouton "Actualiser" pour les données les plus récentes
- **Mobile** : L'interface est responsive et fonctionne sur mobile
- **Impression** : Vous pouvez imprimer les pages de statistiques depuis le navigateur

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez la console du navigateur (F12)
2. Vérifiez les logs du serveur backend
3. Consultez la documentation complète
4. Vérifiez que toutes les dépendances sont installées

---

**Version du module** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Compatible avec** : ClubManager V3.0.0

🥋 Bon usage du module Statistiques !