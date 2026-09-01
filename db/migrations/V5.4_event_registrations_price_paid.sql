-- ============================================================
-- MIGRATION V5.4 - Ajout price_paid a event_registrations
-- ============================================================
ALTER TABLE event_registrations 
ADD COLUMN price_paid DECIMAL(10,2) DEFAULT NULL AFTER payment_status;
