-- Migration V5.5 : Unified Payments
ALTER TABLE paiements ADD COLUMN commande_id INT UNSIGNED NULL AFTER plan_tarifaire_id;
ALTER TABLE paiements ADD COLUMN echeance_id INT UNSIGNED NULL AFTER commande_id;

ALTER TABLE paiements ADD CONSTRAINT fk_paiements_commande FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE paiements ADD CONSTRAINT fk_paiements_echeance FOREIGN KEY (echeance_id) REFERENCES echeances_paiements(id) ON DELETE SET NULL ON UPDATE CASCADE;