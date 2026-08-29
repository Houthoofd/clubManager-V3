USE clubmanager;

-- 1. S'assurer que les types existent (Bienvenue, Inscription, Paiement)
INSERT INTO types_messages_personnalises (nom, description, actif) VALUES 
('Bienvenue', 'Message de bienvenue pour les nouveaux membres', TRUE),
('Inscription', 'Confirmation d''inscription', TRUE),
('Paiement', 'Confirmation de paiement', TRUE)
ON DUPLICATE KEY UPDATE actif = TRUE;

-- 2. Insérer les templates
INSERT INTO messages_personnalises (type_id, titre, contenu, actif)
VALUES (
    (SELECT id FROM types_messages_personnalises WHERE nom = 'Bienvenue' LIMIT 1),
    'Bienvenue au club, {{prenom}} !',
    'Bonjour {{prenom}},\n\nNous sommes ravis de vous compter parmi nos membres !\nVotre identifiant est {{userId}}.\n\nSportivement,\nL''équipe.',
    TRUE
),
(
    (SELECT id FROM types_messages_personnalises WHERE nom = 'Inscription' LIMIT 1),
    'Confirmation d''inscription',
    'Bonjour {{prenom}},\n\nNous confirmons votre inscription.\n\nA très vite !',
    TRUE
),
(
    (SELECT id FROM types_messages_personnalises WHERE nom = 'Paiement' LIMIT 1),
    'Reçu de paiement',
    'Bonjour {{prenom}},\n\nNous avons bien reçu votre paiement.\n\nMerci !',
    TRUE
);
