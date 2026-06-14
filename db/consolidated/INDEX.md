# 📑 Index des fichiers SQL consolidés - ClubManager V3

**Date de consolidation :** 2026-06-13  
**Version de la base :** 5.1

---

## 📂 Fichiers disponibles

### 🏗️ Fichiers principaux (ordre d'exécution)

| # | Fichier | Description | Lignes | Statut |
|---|---------|-------------|--------|--------|
| 0 | `00_SCHEMA_COMPLET.sql` | Schéma complet de la base de données (56 tables) - **v5.1 normalisé** | ~1550 | ✅ Production |
| 1 | `01_PROCEDURES.sql` | 10 procédures stockées consolidées | ~694 | ✅ Production |
| 2 | `02_TRIGGERS.sql` | 6 triggers automatiques consolidés | ~200 | ✅ Production |
| 3 | `03_SEED_DATA.sql` | Données initiales de référence | ~150 | ✅ Production |
| 4 | `04_MIGRATIONS_CONSOLIDATED.sql` | Historique des 18 migrations (v4.2 à v4.10) | ~1577 | ⚠️ Référence |

### 📚 Documentation

| Fichier | Description |
|---------|-------------|
| `README.md` | Documentation complète de la base de données |
| `INDEX.md` | Ce fichier - Index de tous les fichiers disponibles |

---

## 📋 Contenu détaillé

### 00_SCHEMA_COMPLET.sql

**Contenu :**
- Création de la base `clubmanager`
- 14 tables de référence
- 8 tables utilisateurs (auth, sécurité, familles)
- 6 tables cours (planning, inscriptions)
- 2 tables paiements (paiements, échéances) **avec Foreign Keys normalisées** ✨
- 6 tables magasin (e-commerce)
- 6 tables messagerie (communication)
- 3 tables alertes
- 2 tables groupes
- 2 tables système
- ~55 Foreign Keys
- ~120 Indexes

**Utilisation :** Nouvelle installation uniquement

**Améliorations v5.1 :**
- ✅ `paiements.methode_paiement` : ENUM → FK vers `methodes_paiement(id)`
- ✅ `paiements.statut` : ENUM → FK vers `statuts_paiement(id)`
- ✅ `echeances_paiements.statut` : ENUM → FK vers `statuts_echeance(id)`

---

### 01_PROCEDURES.sql

**Contenu (10 procédures) :**

1. **ajouter_cours_recurrent_avec_professeurs**
   - Création de cours récurrents hebdomadaires
   - Génération automatique pour 1 an
   - Batch insert optimisé

2. **modifier_cours_recurrent_avec_professeurs**
   - Modification de cours récurrents existants
   - Mise à jour des professeurs associés

3. **create_email_validation_token**
   - Génération de tokens de validation email
   - Durée de validité : 24h

4. **validate_email_token**
   - Validation des tokens
   - Activation automatique du compte

5. **supprimer_association_professeur_cours**
   - Suppression d'associations professeur-cours récurrent

6. **auto_kill_sleep** (EVENT)
   - Nettoyage automatique des connexions Sleep
   - Exécution toutes les 5 minutes

7. **generate_token** (FUNCTION)
   - Génération de tokens aléatoires sécurisés
   - Utilise SHA2 + UUID

8. **obtenir_statistiques_frequentation**
   - Calcul des statistiques de fréquentation
   - Agrégation par mois pour un utilisateur

9. **recuperer_userId**
   - Récupération du userId par email

10. **inscrire_utilisateurs_aleatoirement**
    - Inscription aléatoire pour tests
    - Basé sur le grade de l'utilisateur

**Utilisation :** Après l'exécution du schéma

---

### 02_TRIGGERS.sql

**Contenu (6 triggers) :**

1. **after_utilisateur_insert**
   - Table : `utilisateurs`
   - Événement : AFTER INSERT
   - Action : Génère les échéances de paiement pour nouveaux utilisateurs

2. **after_utilisateur_update_abonnement**
   - Table : `utilisateurs`
   - Événement : AFTER UPDATE
   - Action : Régénère les échéances lors du changement d'abonnement

3. **ajouter_professeur_apres_insert**
   - Table : `utilisateurs`
   - Événement : AFTER INSERT
   - Action : Ajoute un professeur si status_id = 5

4. **maj_professeur_apres_update**
   - Table : `utilisateurs`
   - Événement : AFTER UPDATE
   - Action : Synchronise la table professeurs

5. **after_echeance_paiement_update** (x2 triggers)
   - Table : `echeances_paiements`
   - Événement : AFTER UPDATE
   - Action : Crée les entrées dans paiements quand échéance payée

**Utilisation :** Après les procédures

---

### 03_SEED_DATA.sql

**Contenu (données de référence) :**

- **Genres** (4) : Homme, Femme, Autre, Non spécifié
- **Grades** (7) : Blanche, Bleue, Violette, Marron, Noire, Rouge et Noire, Rouge
- **Status** (5) : Actif, Inactif, Suspendu, En attente, Archivé
- **Message Status** (4) : Non lu, Lu, Archivé, Supprimé
- **Alertes Types** (5) : Paiement en retard, Abonnement expiré, etc.
- **Types de messages** (5) : Bienvenue, Rappel paiement, etc.

**Utilisation :** Après les triggers

---

### 04_MIGRATIONS_CONSOLIDATED.sql

**Contenu (18 migrations historiques) :**

| # | Migration | Version | Description |
|---|-----------|---------|-------------|
| 1 | 002_normalize_user_id | v4.2 | Normalisation token_hash |
| 2 | 003_family_system | v4.3 | Système familial complet |
| 3 | 003_add_messages_archived | v4.3b | Archivage messages (GAP-16) |
| 4 | 004_app_roles | v4.4 | RBAC role_app |
| 5 | 005_messaging | v4.5 | Système broadcasts |
| 6 | 006_templates | v4.6 | Templates personnalisables |
| 7 | 007_store_setup | v4.7 | Magasin (ordre categories) |
| 8 | 008_fix_commandes_user_id | v4.8a | Fix user_id commandes |
| 9 | 009_deprecate_validation_tokens | v4.9 | DROP validation_tokens |
| 10 | 010_add_email_change_support | v4.10 | Support changement email |
| 11 | V4.5__add_langue_preferee | V4.5 | Multilinguisme |
| 12 | V4.6__reference_tables_phase1 | V4.6 | Tables référence Phase 1 |
| 13 | V4.7__reference_tables_phase2 | V4.7 | Tables référence Phase 2 |
| 14 | V4.7.1__hotfix_genres_structure | V4.7.1 | Fix structure genres |
| 15 | V4.7.2__manual_steps | V4.7.2 | Étapes manuelles |
| 16 | V4.8__fix_new_modules_user_id | V4.8 | Fix user_id modules |
| 17 | V4.9__fix_inscriptions_user_id | V4.9 | Fix user_id inscriptions |
| 18 | V4.10__fix_alertes_utilisateur_id | V4.10 | Fix user_id alertes |

**⚠️ ATTENTION :**
- Ne PAS exécuter ce fichier en entier sur une nouvelle installation
- Toutes ces migrations sont déjà intégrées dans `00_SCHEMA_COMPLET.sql`
- Ce fichier est fourni **uniquement pour documentation** et référence historique
- Utilisable uniquement pour mettre à jour une base existante en production

**Utilisation :** Documentation uniquement

---

## 🚀 Guide d'installation rapide

### Nouvelle installation (recommandé)

```bash
# Étape 1 : Créer le schéma complet
mysql -u root -p < 00_SCHEMA_COMPLET.sql

# Étape 2 : Ajouter les procédures
mysql -u root -p clubmanager < 01_PROCEDURES.sql

# Étape 3 : Ajouter les triggers
mysql -u root -p clubmanager < 02_TRIGGERS.sql

# Étape 4 : Insérer les données initiales
mysql -u root -p clubmanager < 03_SEED_DATA.sql
```

### Vérification post-installation

```bash
# Vérifier les tables
mysql -u root -p clubmanager -e "SHOW TABLES;"

# Vérifier les procédures
mysql -u root -p clubmanager -e "SHOW PROCEDURE STATUS WHERE Db = 'clubmanager';"

# Vérifier les triggers
mysql -u root -p clubmanager -e "SHOW TRIGGERS;"

# Vérifier la version
mysql -u root -p clubmanager -e "SELECT * FROM informations WHERE cle = 'version';"
```

---

## 📊 Statistiques globales

| Métrique | Valeur |
|----------|--------|
| **Fichiers SQL consolidés** | 5 |
| **Tables totales** | 56 |
| **Procédures stockées** | 10 |
| **Triggers** | 6 |
| **Events** | 1 |
| **Functions** | 1 |
| **Migrations historiques** | 18 |
| **Lignes de code SQL** | ~4170 |

---

## 🔄 Dernières modifications

| Date | Fichier | Action |
|------|---------|--------|
| 2026-06-13 | 00_SCHEMA_COMPLET.sql | Mise à jour v5.1 - Normalisation FK paiements |
| 2026-06-13 | Tous | Création de la consolidation complète |
| 2026-05-19 | 00_SCHEMA_COMPLET.sql | Version initiale v5.0 |

---

## 📞 Support

Pour toute question sur l'utilisation de ces fichiers :

- 📖 Lire le **README.md** pour la documentation complète
- 📧 Contact : houthoofd.benoit48@gmail.com
- 🐛 Issues GitHub du projet

---

**Consolidation générée le :** 2026-06-13  
**Auteur :** Benoit Houthoofd
