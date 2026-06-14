# 📚 Base de données ClubManager V3 - Documentation Consolidée

**Version:** 5.1  
**Date:** 2026-06-13  
**Auteur:** Benoit Houthoofd  
**Database:** MySQL 8.0+ / MariaDB 10.6+  
**Encoding:** UTF8MB4  
**Engine:** InnoDB

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Structure des fichiers](#structure-des-fichiers)
3. [Installation](#installation)
4. [Architecture de la base de données](#architecture-de-la-base-de-données)
5. [Historique des versions](#historique-des-versions)
6. [Maintenance](#maintenance)

---

## 🎯 Vue d'ensemble

Ce dossier contient **tous les fichiers SQL consolidés** du projet ClubManager V3. Ces fichiers regroupent de manière organisée :

- **56 tables** pour gérer un club sportif complet
- **10 procédures stockées** pour automatiser les opérations complexes
- **6 triggers** pour maintenir l'intégrité des données
- **Données de référence** pour initialiser la base
- **18 migrations** historiques documentées

---

## 📁 Structure des fichiers

### Fichiers principaux (ordre d'exécution recommandé)

| Fichier | Description | Lignes | Utilisation |
|---------|-------------|--------|-------------|
| `00_SCHEMA_COMPLET.sql` | 🏗️ Schéma complet de la base de données | ~1550 | **Nouvelle installation** |
| `01_PROCEDURES.sql` | ⚙️ Toutes les procédures stockées | ~694 | Après le schéma |
| `02_TRIGGERS.sql` | 🔔 Tous les triggers automatiques | ~200 | Après les procédures |
| `03_SEED_DATA.sql` | 🌱 Données initiales de référence | ~150 | Après les triggers |
| `04_MIGRATIONS_CONSOLIDATED.sql` | 📜 Historique des migrations | ~1577 | **Pour référence uniquement** |

### ⚠️ Avertissements importants

- ❌ **NE PAS exécuter `04_MIGRATIONS_CONSOLIDATED.sql`** si vous utilisez `00_SCHEMA_COMPLET.sql` (toutes les migrations sont déjà intégrées)
- ✅ Le fichier de migrations est fourni **uniquement pour documentation** et pour mettre à jour des bases existantes en production

---

## 🚀 Installation

### Option 1 : Nouvelle installation (recommandé)

Pour créer une nouvelle base de données ClubManager depuis zéro :

```bash
# 1. Créer le schéma complet
mysql -u root -p < 00_SCHEMA_COMPLET.sql

# 2. Ajouter les procédures stockées
mysql -u root -p clubmanager < 01_PROCEDURES.sql

# 3. Ajouter les triggers
mysql -u root -p clubmanager < 02_TRIGGERS.sql

# 4. Insérer les données initiales
mysql -u root -p clubmanager < 03_SEED_DATA.sql
```

### Option 2 : Base existante (mise à jour)

Si vous avez déjà une base ClubManager en production :

```bash
# Vérifier votre version actuelle
mysql -u root -p clubmanager -e "SELECT * FROM informations WHERE cle = 'version';"

# Appliquer uniquement les migrations nécessaires depuis le dossier ../migrations/
# ⚠️ Ne jamais exécuter 04_MIGRATIONS_CONSOLIDATED.sql en entier !
```

### Option 3 : Docker

```bash
# Utiliser le docker-compose.yml du projet
docker-compose up -d mysql

# Exécuter les scripts
docker exec -i clubmanager-mysql mysql -u root -ppassword < 00_SCHEMA_COMPLET.sql
docker exec -i clubmanager-mysql mysql -u root -ppassword clubmanager < 01_PROCEDURES.sql
docker exec -i clubmanager-mysql mysql -u root -ppassword clubmanager < 02_TRIGGERS.sql
docker exec -i clubmanager-mysql mysql -u root -ppassword clubmanager < 03_SEED_DATA.sql
```

---

## 🏛️ Architecture de la base de données

### 1️⃣ Tables de référence (14 tables)

Tables statiques contenant des valeurs de configuration :

- `genres` - Genres/sexes des utilisateurs (M, F, Autre, Non spécifié)
- `grades` - Ceintures (Blanche → Rouge)
- `status` - Statuts utilisateurs (Actif, Inactif, Suspendu...)
- `plans_tarifaires` - Plans d'abonnement
- `methodes_paiement` - Modes de paiement acceptés
- `statuts_commande` - États des commandes magasin
- `statuts_paiement` - États des paiements
- `statuts_echeance` - États des échéances
- `types_cours` - Types de cours disponibles
- `roles_utilisateur` - Rôles applicatifs
- `roles_familial` - Rôles dans les familles
- `tailles` - Tailles de vêtements
- `categories` - Catégories d'articles magasin
- `transitions_statut_commande` - Transitions valides entre statuts

### 2️⃣ Module Utilisateurs (8 tables)

Gestion des comptes, authentification et sécurité :

- `utilisateurs` - Données principales des utilisateurs
- `email_validation_tokens` - Tokens de validation email
- `password_reset_tokens` - Tokens de réinitialisation mot de passe
- `active_sessions` - Sessions actives des utilisateurs
- `login_attempts` - Tentatives de connexion (sécurité)
- `audit_logs` - Logs d'audit système
- `familles` - Groupes familiaux
- `membres_famille` - Liens familiaux (tuteurs/mineurs)

### 3️⃣ Module Cours (6 tables)

Gestion des cours, professeurs et inscriptions :

- `cours_recurrent` - Cours hebdomadaires récurrents
- `cours` - Instances de cours générées
- `professeurs` - Liste des professeurs
- `cours_professeurs` - Associations cours-professeurs
- `inscriptions` - Inscriptions des membres aux cours
- `reservations` - Réservations de cours

### 4️⃣ Module Paiements (2 tables)

Gestion financière et échéanciers :

- `paiements` - Historique des paiements
- `echeances_paiements` - Échéances mensuelles générées automatiquement

### 5️⃣ Module Magasin (6 tables)

E-commerce interne (kimonos, équipements...) :

- `articles` - Catalogue produits
- `images_articles` - Photos produits
- `stocks` - Inventaire par taille
- `commandes` - Commandes clients
- `commande_articles` - Lignes de commande
- `mouvements_stock` - Historique des mouvements

### 6️⃣ Module Messagerie (6 tables)

Communication interne membre-admin :

- `broadcasts` - Messages groupés admin → membres
- `messages` - Messages individuels
- `message_status` - États de lecture des messages
- `types_messages` - Types de messages prédéfinis
- `messages_personnalises` - Templates personnalisables
- `notifications` - Notifications utilisateur

### 7️⃣ Module Alertes (3 tables)

Système d'alertes automatiques :

- `alertes_types` - Types d'alertes (paiement en retard, absence...)
- `alertes_utilisateurs` - Alertes actives par utilisateur
- `alertes_actions` - Actions effectuées sur les alertes

### 8️⃣ Module Groupes (2 tables)

Groupes personnalisés de membres :

- `groupes` - Définition des groupes
- `groupes_utilisateurs` - Associations membres-groupes

### 9️⃣ Module Système (2 tables)

Données de configuration et statistiques :

- `informations` - Paramètres système (version, config...)
- `statistiques` - Métriques d'utilisation

---

## 📊 Statistiques de la base

| Métrique | Valeur |
|----------|--------|
| **Tables totales** | 56 |
| **Foreign Keys** | ~55 |
| **Indexes** | ~120 |
| **Procédures stockées** | 10 |
| **Triggers** | 6 |
| **Events** | 1 (auto_kill_sleep) |
| **Functions** | 1 (generate_token) |

---

## 🔄 Historique des versions

### Version 5.1 (2026-06-13) - **ACTUELLE**
- ✅ **Normalisation complète des références paiements** (ENUM → Foreign Keys)
- ✅ Schéma consolidé complet
- ✅ Intégration de toutes les migrations v4.1 à v4.10
- ✅ Support RGPD avec soft delete
- ✅ Système familial complet
- ✅ RBAC (Role-Based Access Control)
- ✅ Support multilingue (fr, en, nl, de, es)
- ✅ Archivage des messages (GAP-16)
- ✅ Suppression de validation_tokens (dépréciée)
- ✅ Support changement d'email (GAP-15)

### Version 5.0 (2026-05-19)
- Schéma consolidé avec migrations v4.1 à v4.10
- ⚠️ Problème : Utilisait ENUM au lieu de FK pour paiements (corrigé en v5.1)

### Migrations intégrées

| Version | Description | Date |
|---------|-------------|------|
| v4.1 | Soft Delete + RGPD | 2025-03 |
| v4.2 | Normalisation token_hash | 2025-03 |
| v4.3 | Système familial | 2025-03 |
| v4.4 | RBAC role_app | 2025-04 |
| v4.5 | Multilinguisme | 2025-04 |
| v4.6 | Tables référence Phase 1 | 2025-04 |
| v4.7 | Tables référence Phase 2 | 2025-04 |
| v4.8 | Normalisation user_id | 2025-05 |
| v4.9 | Fix inscriptions user_id | 2025-05 |
| v4.10 | Fix alertes user_id | 2025-05 |
| v5.0 | Schéma consolidé initial | 2026-05 |
| v5.1 | Normalisation FK paiements | 2026-06 |

---

## 🔧 Maintenance

### Vérifier la version actuelle

```sql
SELECT * FROM informations WHERE cle = 'version';
```

### Vérifier l'intégrité des Foreign Keys

```sql
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'clubmanager'
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;
```

### Voir les procédures stockées

```sql
SHOW PROCEDURE STATUS WHERE Db = 'clubmanager';
```

### Voir les triggers

```sql
SHOW TRIGGERS FROM clubmanager;
```

### Optimiser les tables

```sql
-- Optimiser toutes les tables
SELECT CONCAT('OPTIMIZE TABLE ', TABLE_NAME, ';')
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'clubmanager';
```

### Analyser l'utilisation de l'espace

```sql
SELECT 
    TABLE_NAME,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'clubmanager'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

---

## 📝 Notes importantes

### ✅ Bonnes pratiques

1. **Toujours faire un backup** avant d'appliquer des modifications
2. **Tester sur un environnement de dev** avant la production
3. **Utiliser des transactions** pour les modifications critiques
4. **Vérifier les logs** après chaque migration

### ⚠️ Attention

- Les triggers génèrent automatiquement des échéances de paiement
- Le soft delete est activé sur les utilisateurs (colonne `deleted_at`)
- Les sessions inactives sont nettoyées automatiquement toutes les 5 minutes
- Les tokens de validation expirent après 24h

### 🔐 Sécurité

- Les mots de passe sont hashés avec bcrypt
- Les tokens utilisent SHA2 + UUID pour la génération
- Les tentatives de connexion échouées sont trackées
- Les audit logs enregistrent toutes les actions critiques

---

## 📞 Support

Pour toute question ou problème :

- **Documentation technique :** Voir `/backend/docs/`
- **Issues :** GitHub Issues du projet
- **Contact :** houthoofd.benoit48@gmail.com

---

## 📄 Licence

© 2025-2026 Benoit Houthoofd - ClubManager V3

---

**Dernière mise à jour :** 2026-06-13  
**Généré automatiquement** à partir de la consolidation des fichiers SQL
