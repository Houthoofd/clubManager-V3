import type { Step } from "react-joyride";

export const getCoursesAdminSteps = (): Step[] => [
  {
    target: "body",
    content: "Bienvenue dans la gestion des cours ! Faisons un petit tour d'horizon.",
    placement: "center",
  },
  {
    target: "[data-testid='tab-planning']",
    content: "Ici, vous pouvez voir le planning récurrent hebdomadaire. C'est ici que vous définissez vos cours hebdomadaires de base.",
  },
  {
    target: "[data-testid='tab-sessions']",
    content: "L'onglet 'Séances' affiche les séances individuelles générées à partir de votre planning récurrent.",
  },
  {
    target: "[data-testid='course-generate-sessions-btn']",
    content: "Une fois votre planning prêt, cliquez ici pour générer les séances pour une période donnée.",
  },
  {
    target: "[data-testid='tab-planning']",
    content: "Maintenant, à vous de jouer ! Repassons sur le planning pour créer un exemple.",
  },
  {
    target: "[data-testid='course-add-recurrent-btn']",
    content: "Cliquez sur ce bouton pour ouvrir le formulaire de création.",
    spotlightClicks: true,
    disableOverlayClose: true,
    hideFooter: true,
  },
  {
    target: "[data-testid='course-recurrent-submit-btn']",
    content: "Remplissez les informations de votre cours, puis cliquez sur 'Enregistrer' pour valider.",
    spotlightClicks: true,
    disableOverlayClose: true,
    hideFooter: true,
  },
  {
    target: "[data-testid='courses-list']",
    content: "Votre nouveau cours est là ! Cliquez sur la petite corbeille rouge pour le supprimer.",
    spotlightClicks: true,
    disableOverlayClose: true,
    hideFooter: true,
  },
  {
    target: "[data-testid='confirm-dialog-confirm-btn']",
    content: "Confirmez la suppression pour terminer l'exercice. C'est tout pour la gestion des cours !",
    spotlightClicks: true,
    disableOverlayClose: true,
    hideFooter: true,
  },
];

export const getCoursesUserSteps = (): Step[] => [
  {
    target: "body",
    content: "Bienvenue dans la gestion des cours ! Faisons un petit tour d'horizon.",
    placement: "center",
  },
  {
    target: "[data-testid='tab-planning']",
    content: "Ici, vous pouvez voir le planning récurrent hebdomadaire.",
  },
  {
    target: "[data-testid='tab-sessions']",
    content: "Cet onglet affiche les séances individuelles générées.",
  }
];

export const getDashboardSteps = (): Step[] => [
  {
    target: "body",
    content: "Bienvenue sur votre tableau de bord ! C'est ici que vous retrouvez l'essentiel de l'activité du club.",
    placement: "center",
  },
  {
    target: "[data-testid='kpi-grid']",
    content: "Voici vos indicateurs clés (inscriptions, chiffre d'affaires...). Ils vous donnent une vue d'ensemble instantanée.",
  },
  {
    target: "[data-testid='quick-actions']",
    content: "Ces raccourcis vous permettent d'effectuer vos tâches courantes en un clic.",
  },
  {
    target: "[data-testid='today-courses']",
    content: "Retrouvez ici le planning de la journée avec un accès direct à la feuille d'appel.",
  }
];

export const getUsersSteps = (): Step[] => [
  {
    target: "body",
    content: "Bienvenue dans l'annuaire de vos membres.",
    placement: "center",
  },
  {
    target: "[data-testid='users-search']",
    content: "Trouvez rapidement n'importe quel membre grâce à la barre de recherche. Vous pouvez taper le nom, prenom ou email.",
  },
  {
    target: "[data-testid='users-role-filter']",
    content: "Vous pouvez egalement filtrer la liste par role (administrateur, professeur, membre) ou statut (actif, inactif).",
  },
  {
    target: "[data-testid='btn-notify-bulk']",
    content: "Besoin de communiquer rapidement ? Ce bouton vous permet d'envoyer un message groupe a l'ensemble de vos membres. Pratique pour les annonces importantes !",
  },
  {
    target: "[data-testid='btn-invite-member']",
    content: "Ajoutons un membre pour voir. Cliquez sur ce bouton pour inviter de nouveaux membres par e-mail.",
    spotlightClicks: true,
    disableOverlayClose: true,
    hideFooter: true,
  },
  {
    target: "[data-testid='invite-submit-btn']",
    content: "Saisissez l'e-mail du membre et choisissez son role. Cliquez ensuite sur 'Inviter' pour envoyer l'invitation.",
    spotlightClicks: true,
    disableOverlayClose: true,
    hideFooter: true,
  },
  {
    target: "[data-testid='users-table']",
    content: "Cette table vous permet de gerer vos membres en detail. Cliquez sur la ligne d'un membre pour voir son profil detaille, ou utilisez les icones d'action a droite pour modifier son role ou son statut.",
  }
];

export const getMessagingSteps = (): Step[] => [
  {
    target: "body",
    content: "Bienvenue dans la messagerie integree du club. C'est ici que vous gerez toutes vos communications.",
    placement: "center",
  },
  {
    target: "[data-testid='tab-inbox']",
    content: "Voici votre boite de reception. Vous y trouverez tous les messages recus de la part des membres. Les messages non lus sont signales par un point bleu.",
  },
  {
    target: "[data-testid='tab-sent']",
    content: "L'onglet 'Envoyes' vous permet de consulter l'historique complet de vos communications.",
  },
  {
    target: "[data-testid='tab-archived']",
    content: "L'onglet 'Archives' stocke les anciens messages que vous souhaitez conserver sans encombrer la boite de reception.",
  },
  {
    target: "[data-testid='tab-templates']",
    content: "L'onglet 'Modeles' (si vous etes admin) vous permet de creer des messages types pour gagner du temps lors de l'envoi d'e-mails frequents.",
  },
  {
    target: "[data-testid='messages-list']",
    content: "Cliquez sur un message dans cette liste pour l'ouvrir et afficher son contenu detaille sur la partie droite de l'ecran.",
  },
  {
    target: "[data-testid='messages-compose-btn']",
    content: "Testons cela ! Cliquez ici pour rediger un nouveau message.",
    spotlightClicks: true,
    disableOverlayClose: true,
    hideFooter: true,
  },
  {
    target: "[data-testid='compose-submit-btn']",
    content: "Il ne vous reste plus qu'a choisir un destinataire, taper votre sujet et votre message. Vous pouvez aussi utiliser un modele ! Cliquez ensuite sur 'Envoyer' pour terminer le tutoriel.",
    spotlightClicks: true,
    disableOverlayClose: true,
    hideFooter: true,
  }
];
