-- ============================================================================
-- Analytics Performance Indexes
-- ============================================================================
-- Migration script to add indexes for optimizing analytics queries
-- Created: 2024-01-15
-- Module: Statistics
--
-- These indexes are designed to improve the performance of analytics queries
-- by indexing columns frequently used in WHERE, GROUP BY, and JOIN clauses.
-- ============================================================================

-- Check if indexes already exist before creating them
-- MySQL will throw an error if we try to create duplicate indexes

-- ============================================================================
-- UTILISATEURS (Members) - Analytics Indexes
-- ============================================================================

-- Index for date-based member filtering and growth trends
CREATE INDEX IF NOT EXISTS idx_utilisateurs_date_inscription
ON utilisateurs(date_inscription);

-- Index for filtering active/inactive members
CREATE INDEX IF NOT EXISTS idx_utilisateurs_status
ON utilisateurs(status);

-- Index for excluding admin users from member statistics
CREATE INDEX IF NOT EXISTS idx_utilisateurs_role_id
ON utilisateurs(role_id);

-- Index for grouping members by grade
CREATE INDEX IF NOT EXISTS idx_utilisateurs_grade_id
ON utilisateurs(grade_id);

-- Index for grouping members by gender
CREATE INDEX IF NOT EXISTS idx_utilisateurs_genre_id
ON utilisateurs(genre_id);

-- Index for age-based analytics
CREATE INDEX IF NOT EXISTS idx_utilisateurs_date_of_birth
ON utilisateurs(date_of_birth);

-- Composite index for common member queries (status + date)
CREATE INDEX IF NOT EXISTS idx_utilisateurs_status_date
ON utilisateurs(status, date_inscription);

-- Composite index for member analytics (role + status)
CREATE INDEX IF NOT EXISTS idx_utilisateurs_role_status
ON utilisateurs(role_id, status);

-- ============================================================================
-- COURS (Courses) - Analytics Indexes
-- ============================================================================

-- Index for date-based course filtering and attendance trends
CREATE INDEX IF NOT EXISTS idx_cours_date_cours
ON cours(date_cours);

-- Index for grouping courses by type
CREATE INDEX IF NOT EXISTS idx_cours_type
ON cours(type_cours);

-- Composite index for course analytics (date + type)
CREATE INDEX IF NOT EXISTS idx_cours_date_type
ON cours(date_cours, type_cours);

-- Index for day-of-week analytics
CREATE INDEX IF NOT EXISTS idx_cours_date_type_combo
ON cours(date_cours, type_cours, cours_id);

-- ============================================================================
-- INSCRIPTIONS (Course Registrations) - Analytics Indexes
-- ============================================================================

-- Index for attendance filtering
CREATE INDEX IF NOT EXISTS idx_inscriptions_presence
ON inscriptions(presence);

-- Composite index for attendance analytics (course + presence)
CREATE INDEX IF NOT EXISTS idx_inscriptions_cours_presence
ON inscriptions(cours_id, presence);

-- Index for member course history
CREATE INDEX IF NOT EXISTS idx_inscriptions_utilisateur
ON inscriptions(utilisateur_id);

-- ============================================================================
-- PAIEMENTS (Payments) - Analytics Indexes
-- ============================================================================

-- Index for date-based financial analytics and revenue trends
CREATE INDEX IF NOT EXISTS idx_paiements_date
ON paiements(date_paiement);

-- Index for filtering payments by status
CREATE INDEX IF NOT EXISTS idx_paiements_statut
ON paiements(statut);

-- Index for grouping payments by method
CREATE INDEX IF NOT EXISTS idx_paiements_methode
ON paiements(methode_paiement);

-- Composite index for financial analytics (status + date)
CREATE INDEX IF NOT EXISTS idx_paiements_statut_date
ON paiements(statut, date_paiement);

-- Composite index for revenue calculations (status + method)
CREATE INDEX IF NOT EXISTS idx_paiements_statut_methode
ON paiements(statut, methode_paiement);

-- Index for subscription revenue analytics
CREATE INDEX IF NOT EXISTS idx_paiements_abonnement
ON paiements(abonnement_id);

-- ============================================================================
-- ECHEANCES_PAIEMENTS (Payment Deadlines) - Analytics Indexes
-- ============================================================================

-- Index for filtering late payments
CREATE INDEX IF NOT EXISTS idx_echeances_statut
ON echeances_paiements(statut);

-- Index for date-based late payment detection
CREATE INDEX IF NOT EXISTS idx_echeances_date
ON echeances_paiements(date_echeance);

-- Composite index for late payment analytics (status + date)
CREATE INDEX IF NOT EXISTS idx_echeances_statut_date
ON echeances_paiements(statut, date_echeance);

-- Index for subscription deadline tracking
CREATE INDEX IF NOT EXISTS idx_echeances_abonnement
ON echeances_paiements(abonnement_id);

-- ============================================================================
-- ABONNEMENTS (Subscriptions) - Analytics Indexes
-- ============================================================================

-- Index for subscription plan analytics
CREATE INDEX IF NOT EXISTS idx_abonnements_plan
ON abonnements(plan_abonnement_id);

-- Index for member subscription lookup
CREATE INDEX IF NOT EXISTS idx_abonnements_utilisateur
ON abonnements(utilisateur_id);

-- Index for subscription status filtering
CREATE INDEX IF NOT EXISTS idx_abonnements_statut
ON abonnements(statut);

-- Composite index for plan revenue analytics
CREATE INDEX IF NOT EXISTS idx_abonnements_plan_statut
ON abonnements(plan_abonnement_id, statut);

-- ============================================================================
-- COMMANDES (Orders) - Analytics Indexes
-- ============================================================================

-- Index for date-based store analytics and sales trends
CREATE INDEX IF NOT EXISTS idx_commandes_date
ON commandes(date_commande);

-- Index for filtering orders by payment status
CREATE INDEX IF NOT EXISTS idx_commandes_statut_paiement
ON commandes(statut_paiement);

-- Composite index for store revenue analytics (status + date)
CREATE INDEX IF NOT EXISTS idx_commandes_statut_date
ON commandes(statut_paiement, date_commande);

-- Index for customer order history
CREATE INDEX IF NOT EXISTS idx_commandes_utilisateur
ON commandes(utilisateur_id);

-- ============================================================================
-- COMMANDE_ARTICLES (Order Items) - Analytics Indexes
-- ============================================================================

-- Index for order line items lookup
CREATE INDEX IF NOT EXISTS idx_commande_articles_commande
ON commande_articles(commande_id);

-- Index for product sales analytics
CREATE INDEX IF NOT EXISTS idx_commande_articles_article
ON commande_articles(article_id);

-- Composite index for sales analytics (article + quantity)
CREATE INDEX IF NOT EXISTS idx_commande_articles_article_qty
ON commande_articles(article_id, quantite);

-- ============================================================================
-- ARTICLES (Products) - Analytics Indexes
-- ============================================================================

-- Index for grouping products by category
CREATE INDEX IF NOT EXISTS idx_articles_categorie
ON articles(categorie_id);

-- Index for product name searches
CREATE INDEX IF NOT EXISTS idx_articles_nom
ON articles(nom);

-- ============================================================================
-- STOCK (Inventory) - Analytics Indexes
-- ============================================================================

-- Index for low stock alerts
CREATE INDEX IF NOT EXISTS idx_stock_quantite
ON stock(quantite_disponible);

-- Index for stock lookup by article
CREATE INDEX IF NOT EXISTS idx_stock_article
ON stock(article_id);

-- Composite index for inventory analytics (article + quantity)
CREATE INDEX IF NOT EXISTS idx_stock_article_qty
ON stock(article_id, quantite_disponible);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Display all indexes created on relevant tables
SELECT
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS COLUMNS,
    INDEX_TYPE,
    NON_UNIQUE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN (
    'utilisateurs',
    'cours',
    'inscriptions',
    'paiements',
    'echeances_paiements',
    'abonnements',
    'commandes',
    'commande_articles',
    'articles',
    'stock'
)
AND INDEX_NAME LIKE 'idx_%'
GROUP BY TABLE_NAME, INDEX_NAME, INDEX_TYPE, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Performance Impact:
-- - These indexes will significantly improve SELECT query performance
-- - INSERT/UPDATE/DELETE operations may be slightly slower due to index maintenance
-- - Disk space usage will increase (estimated 5-10% of table size per index)
--
-- Maintenance:
-- - Run ANALYZE TABLE periodically to update index statistics
-- - Monitor index usage with: SHOW INDEX FROM table_name;
-- - Consider removing unused indexes to reduce overhead
--
-- Recommended After Creating Indexes:
--
-- ANALYZE TABLE utilisateurs;
-- ANALYZE TABLE cours;
-- ANALYZE TABLE inscriptions;
-- ANALYZE TABLE paiements;
-- ANALYZE TABLE echeances_paiements;
-- ANALYZE TABLE abonnements;
-- ANALYZE TABLE commandes;
-- ANALYZE TABLE commande_articles;
-- ANALYZE TABLE articles;
-- ANALYZE TABLE stock;
--
-- ============================================================================
