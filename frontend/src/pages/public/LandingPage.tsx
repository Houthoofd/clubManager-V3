import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  AcademicCapIcon,
  TicketIcon,
  EnvelopeOpenIcon,
} from "@heroicons/react/24/outline";

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate pt-14 pb-12 sm:pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-brand-dark sm:text-6xl">
            Gérez • Organisez • Faites grandir
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            La plateforme tout-en-un pour simplifier la gestion de votre club. 
            Des inscriptions aux paiements en passant par la communication, 
            libérez-vous de l'administratif.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/onboarding"
              className="rounded-md bg-brand-green px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors duration-300"
            >
              Créer mon club
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-brand-blue transition-colors"
            >
              Espace de connexion <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        
        {/* Main Dashboard Preview */}
        <div className="mt-16 sm:mt-24 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <img
              src="/screenshots/dashboard.png"
              alt="Tableau de bord de ClubManager"
              className="rounded-md shadow-2xl ring-1 ring-gray-900/10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Feature Showcase (Alternating) */}
      <div className="overflow-hidden bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          {/* Feature 1: Cours */}
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
            <div className="lg:pr-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-brand-green">Planning Intelligent</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">Gérez vos cours sans effort</p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Créez des plannings récurrents, assignez des professeurs et permettez à vos membres de s'inscrire en quelques clics. Fini les tableaux Excel compliqués.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <CalendarDaysIcon className="absolute left-1 top-1 h-5 w-5 text-brand-blue" aria-hidden="true" />
                      Inscriptions en ligne.
                    </dt>
                    <dd className="inline"> Les membres peuvent réserver leur place depuis leur espace.</dd>
                  </div>
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <UserGroupIcon className="absolute left-1 top-1 h-5 w-5 text-brand-blue" aria-hidden="true" />
                      Gestion des présences.
                    </dt>
                    <dd className="inline"> Les professeurs peuvent faire l'appel directement depuis leur smartphone.</dd>
                  </div>
                </dl>
              </div>
            </div>
            <img src="/screenshots/courses.png" alt="Gestion des cours" className="w-full rounded-xl shadow-xl ring-1 ring-gray-400/10" />
          </div>

          {/* Feature 2: Utilisateurs (Right aligned image) */}
          <div className="mx-auto mt-24 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
            <div className="lg:order-last lg:pl-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-brand-blue">Base de données</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">Vos membres à portée de main</p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Une vue complète sur vos adhérents. Suivez les paiements, les certificats médicaux, et les passages de grades en un seul endroit.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <DocumentCheckIcon className="absolute left-1 top-1 h-5 w-5 text-brand-green" aria-hidden="true" />
                      Dossiers centralisés.
                    </dt>
                    <dd className="inline"> Tous les documents obligatoires sont stockés et vérifiables en un clic.</dd>
                  </div>
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <AcademicCapIcon className="absolute left-1 top-1 h-5 w-5 text-brand-green" aria-hidden="true" />
                      Suivi des niveaux.
                    </dt>
                    <dd className="inline"> Historique complet des passages de grades et ceintures pour chaque membre.</dd>
                  </div>
                </dl>
              </div>
            </div>
            <img src="/screenshots/users.png" alt="Gestion des membres" className="w-full rounded-xl shadow-xl ring-1 ring-gray-400/10 lg:order-first" />
          </div>

          {/* Feature 3: Events */}
          <div className="mx-auto mt-24 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
            <div className="lg:pr-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-brand-green">Dynamisme</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">Organisez vos événements</p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Stages, tournois, fêtes de fin d'année... Créez des événements exceptionnels et suivez les inscriptions et invitations en temps réel.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <EnvelopeOpenIcon className="absolute left-1 top-1 h-5 w-5 text-brand-blue" aria-hidden="true" />
                      Invitations ciblées.
                    </dt>
                    <dd className="inline"> Envoyez des invitations par email à des groupes spécifiques de membres.</dd>
                  </div>
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <TicketIcon className="absolute left-1 top-1 h-5 w-5 text-brand-blue" aria-hidden="true" />
                      Billetterie intégrée.
                    </dt>
                    <dd className="inline"> Les membres peuvent confirmer leur présence et payer leur participation en ligne.</dd>
                  </div>
                </dl>
              </div>
            </div>
            <img src="/screenshots/events.png" alt="Évènements" className="w-full rounded-xl shadow-xl ring-1 ring-gray-400/10" />
          </div>

        </div>
      </div>

      {/* Pricing Section (Placeholder) */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
              Des tarifs simples et transparents
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choisissez le forfait qui s'adapte à la taille de votre structure.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-2 lg:gap-x-8">
            
            {/* Plan 1 */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 xl:p-10">
              <div>
                <h3 className="text-lg font-semibold leading-8 text-brand-dark">Essentiel</h3>
                <p className="mt-4 text-sm leading-6 text-gray-600">Pour les petites associations qui se lancent.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">29€</span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">/mois</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  <li className="flex gap-x-3"><CheckCircleIcon className="h-6 w-5 flex-none text-brand-green"/> Jusqu'à 100 membres</li>
                  <li className="flex gap-x-3"><CheckCircleIcon className="h-6 w-5 flex-none text-brand-green"/> Gestion des cours</li>
                  <li className="flex gap-x-3"><CheckCircleIcon className="h-6 w-5 flex-none text-brand-green"/> Support email</li>
                </ul>
              </div>
              <Link to="/onboarding" className="mt-8 block rounded-md bg-brand-blue px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors">Commencer l'essai</Link>
            </div>

            {/* Plan 2 */}
            <div className="flex flex-col justify-between rounded-3xl bg-brand-dark p-8 shadow-sm ring-1 ring-gray-900 xl:p-10">
              <div>
                <h3 className="text-lg font-semibold leading-8 text-white">Pro</h3>
                <p className="mt-4 text-sm leading-6 text-gray-300">Pour les clubs structurés en plein développement.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-white">59€</span>
                  <span className="text-sm font-semibold leading-6 text-gray-300">/mois</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                  <li className="flex gap-x-3"><CheckCircleIcon className="h-6 w-5 flex-none text-brand-green"/> Membres illimités</li>
                  <li className="flex gap-x-3"><CheckCircleIcon className="h-6 w-5 flex-none text-brand-green"/> Module Boutique en ligne</li>
                  <li className="flex gap-x-3"><CheckCircleIcon className="h-6 w-5 flex-none text-brand-green"/> Support prioritaire 7j/7</li>
                </ul>
              </div>
              <Link to="/onboarding" className="mt-8 block rounded-md bg-brand-green px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors">Commencer l'essai</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
