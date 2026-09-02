const fs = require('fs');

const tutConfigFile = 'frontend/src/shared/providers/tutorialsConfig.ts';
let tutConfig = fs.readFileSync(tutConfigFile, 'utf8');

const alertsSteps = `
export const getAlertsAdminSteps = (): Step[] => [
  {
    target: "body",
    content: "Bienvenue sur la page Alertes ! Cet outil vous permet de gérer les différents rappels et incidents liés à vos membres.",
    placement: "center",
  },
  {
    target: "[data-testid='tab-my-alerts']",
    content: "Cet onglet affiche les alertes qui vous concernent directement. Très utile pour voir ce que vous devez corriger ou payer.",
  },
  {
    target: "[data-testid='tab-admin']",
    content: "L'onglet Admin vous donne une vue d'ensemble sur toutes les alertes du club. C'est ici que vous pilotez la gestion.",
  },
  {
    target: "[data-testid='subtab-types']",
    content: "Si vous êtes administrateur, cet onglet vous permet de définir vos propres catégories d'alertes (ex: Certificat médical, Retard de paiement).",
  },
  {
    target: "[data-testid='btn-create-alert-type']",
    content: "Ce bouton permet d'ajouter un nouveau type d'alerte, avec son propre niveau de priorité (Basse, Normale, Haute, Critique).",
  },
  {
    target: "[data-testid='subtab-alerts']",
    content: "Une fois vos catégories prêtes, vous assignez ici les alertes aux membres qui en ont besoin.",
  },
  {
    target: "[data-testid='btn-create-alert']",
    content: "Et voici le bouton pour déclencher manuellement une alerte sur le dossier d'un membre. Parfait pour ne rien oublier !",
  }
];
`;
if (!tutConfig.includes('getAlertsAdminSteps')) {
    tutConfig += alertsSteps;
    fs.writeFileSync(tutConfigFile, tutConfig, 'utf8');
    console.log('Updated tutorialsConfig.ts');
}
