/**
 * AlertBanner - Exemples visuels
 *
 * Collection d'exemples démontrant les différentes utilisations
 * du composant AlertBanner avec ses variants et options.
 */

import { useState } from 'react';
import { AlertBanner } from './AlertBanner';

export default function AlertBannerExamples() {
  const [showDismissible1, setShowDismissible1] = useState(true);
  const [showDismissible2, setShowDismissible2] = useState(true);
  const [showDismissible3, setShowDismissible3] = useState(true);

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AlertBanner</h1>
        <p className="text-gray-600 mb-8">
          Composant de bannière d'alerte réutilisable avec variants, icônes et fermeture optionnelle.
        </p>

        {/* ─── Variant: Success ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Variant: Success</h2>
          <AlertBanner variant="success" message="Opération réussie !" />

          <AlertBanner
            variant="success"
            title="Membre ajouté"
            message="Le nouveau membre a été ajouté avec succès à votre club."
          />
        </section>

        {/* ─── Variant: Warning ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Variant: Warning</h2>
          <AlertBanner
            variant="warning"
            message="Votre abonnement expire dans 7 jours."
          />

          <AlertBanner
            variant="warning"
            title="Action requise"
            message="Certaines informations de votre profil sont incomplètes. Veuillez les mettre à jour."
          />
        </section>

        {/* ─── Variant: Danger ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Variant: Danger</h2>
          <AlertBanner variant="danger" message="Une erreur est survenue." />

          <AlertBanner
            variant="danger"
            title="Erreur de connexion"
            message="Impossible de se connecter au serveur. Veuillez réessayer plus tard."
          />
        </section>

        {/* ─── Variant: Info ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Variant: Info</h2>
          <AlertBanner variant="info" message="Nouvelle mise à jour disponible." />

          <AlertBanner
            variant="info"
            title="Maintenance planifiée"
            message="Le système sera en maintenance le 15 janvier de 2h à 4h du matin."
          />
        </section>

        {/* ─── Dismissible ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Dismissible (avec fermeture)</h2>
          {showDismissible1 && (
            <AlertBanner
              variant="info"
              message="Cette alerte peut être fermée."
              dismissible
              onDismiss={() => setShowDismissible1(false)}
            />
          )}
          {!showDismissible1 && (
            <button
              onClick={() => setShowDismissible1(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Réafficher l'alerte
            </button>
          )}

          {showDismissible2 && (
            <AlertBanner
              variant="success"
              title="Opération terminée"
              message="Vos modifications ont été enregistrées avec succès."
              dismissible
              onDismiss={() => {
                setShowDismissible2(false);
                console.log('Alerte fermée');
              }}
            />
          )}
          {!showDismissible2 && (
            <button
              onClick={() => setShowDismissible2(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Réafficher l'alerte
            </button>
          )}
        </section>

        {/* ─── Icône personnalisée ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Icône personnalisée</h2>
          <AlertBanner
            variant="info"
            title="Nouveauté"
            message="Découvrez notre nouvelle fonctionnalité de gestion des événements !"
            icon={
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            }
          />

          <AlertBanner
            variant="warning"
            message="Icône de fusée personnalisée"
            icon={
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.536-4.464a.75.75 0 10-1.061-1.061 3.5 3.5 0 01-4.95 0 .75.75 0 00-1.06 1.06 5 5 0 007.07 0zM9 8.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S7.448 7 8 7s1 .672 1 1.5zm3 1.5c.552 0 1-.672 1-1.5S12.552 7 12 7s-1 .672-1 1.5.448 1.5 1 1.5z"
                  clipRule="evenodd"
                />
              </svg>
            }
          />
        </section>

        {/* ─── Message long ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Message long</h2>
          <AlertBanner
            variant="warning"
            title="Mise à jour importante"
            message="Une nouvelle version de l'application est disponible. Cette version inclut des améliorations de performance, des corrections de bugs et de nouvelles fonctionnalités. Nous vous recommandons fortement de mettre à jour dès que possible pour bénéficier de toutes ces améliorations."
          />
        </section>

        {/* ─── Cas d'usage combinés ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Cas d'usage complets</h2>
          {showDismissible3 && (
            <AlertBanner
              variant="danger"
              title="Erreur de validation"
              message="Veuillez corriger les erreurs dans le formulaire avant de continuer. Tous les champs marqués d'un astérisque sont obligatoires."
              dismissible
              onDismiss={() => setShowDismissible3(false)}
            />
          )}
          {!showDismissible3 && (
            <button
              onClick={() => setShowDismissible3(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Réafficher l'alerte
            </button>
          )}

          <AlertBanner
            variant="success"
            title="Paiement confirmé"
            message="Votre paiement a été traité avec succès. Un email de confirmation vous a été envoyé."
            icon={
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z"
                  clipRule="evenodd"
                />
              </svg>
            }
            dismissible
            onDismiss={() => console.log('Paiement confirmé fermé')}
          />
        </section>

        {/* ─── Classes CSS additionnelles ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Classes CSS personnalisées</h2>
          <AlertBanner
            variant="info"
            message="Alerte avec marges personnalisées"
            className="my-8 shadow-lg"
          />
        </section>
      </div>
    </div>
  );
}
