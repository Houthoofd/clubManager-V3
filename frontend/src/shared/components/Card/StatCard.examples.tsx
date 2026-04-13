/**
 * StatCard Component - Examples
 *
 * Exemples d'utilisation du composant StatCard dans différents contextes.
 * Ce fichier sert de documentation vivante et peut être utilisé pour tester
 * visuellement les différentes configurations.
 */

import { StatCard } from './StatCard';
import { Users, DollarSign, Calendar, TrendingUp, Award, UserCheck, CreditCard, Activity } from 'lucide-react';

// ─── EXEMPLE 1: STAT CARD BASIQUE ────────────────────────────────────────────

export function BasicStatCard() {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Exemple Basique</h2>
      <p className="text-sm text-gray-600 mb-4">
        StatCard minimal avec seulement un label et une valeur.
      </p>

      <div className="max-w-xs">
        <StatCard
          label="Total Membres"
          value="254"
        />
      </div>
    </div>
  );
}

// ─── EXEMPLE 2: AVEC VARIATION POSITIVE ───────────────────────────────────────

export function StatCardWithPositiveChange() {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Avec Variation Positive</h2>
      <p className="text-sm text-gray-600 mb-4">
        StatCard avec indicateur de changement positif (vert).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
        <StatCard
          label="Nouveaux Membres"
          value="42"
          change="+12%"
          trend="up"
        />
        <StatCard
          label="Revenus Mensuels"
          value="15,750 €"
          change="+8.5%"
          trend="up"
        />
        <StatCard
          label="Taux de Satisfaction"
          value="94%"
          change="+3%"
          trend="up"
        />
      </div>
    </div>
  );
}

// ─── EXEMPLE 3: AVEC VARIATION NÉGATIVE ───────────────────────────────────────

export function StatCardWithNegativeChange() {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Avec Variation Négative</h2>
      <p className="text-sm text-gray-600 mb-4">
        StatCard avec indicateur de changement négatif (rouge).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
        <StatCard
          label="Absences"
          value="8"
          change="-25%"
          trend="down"
        />
        <StatCard
          label="Annulations"
          value="3"
          change="-40%"
          trend="down"
        />
        <StatCard
          label="Retards de Paiement"
          value="12,450 €"
          change="-5%"
          trend="down"
        />
      </div>
    </div>
  );
}

// ─── EXEMPLE 4: AVEC ICÔNES ───────────────────────────────────────────────────

export function StatCardWithIcon() {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Avec Icônes</h2>
      <p className="text-sm text-gray-600 mb-4">
        StatCard avec icônes personnalisées pour une meilleure identification visuelle.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Membres"
          value="254"
          change="+12%"
          trend="up"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Revenus du Mois"
          value="12,450 €"
          change="+15%"
          trend="up"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Cours Programmés"
          value="48"
          change="+6"
          trend="up"
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          label="Taux de Présence"
          value="87%"
          change="+2%"
          trend="up"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}

// ─── EXEMPLE 5: GRILLE DE STATISTIQUES COMPLÈTE ───────────────────────────────

export function StatsGrid() {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Grille de Statistiques</h2>
      <p className="text-sm text-gray-600 mb-4">
        Exemple de dashboard avec 4 statistiques principales côte à côte.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Membres"
          value="254"
          change="+12%"
          trend="up"
        />
        <StatCard
          label="Cours Actifs"
          value="18"
          change="+3"
          trend="up"
        />
        <StatCard
          label="Revenus du Mois"
          value="12,450 €"
          change="-5%"
          trend="down"
        />
        <StatCard
          label="Taux de Présence"
          value="87%"
          change="+2%"
          trend="up"
        />
      </div>
    </div>
  );
}

// ─── EXEMPLE 6: VARIATIONS MULTIPLES ──────────────────────────────────────────

export function ComprehensiveStatsExample() {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Exemple Complet</h2>
      <p className="text-sm text-gray-600 mb-4">
        Dashboard complet avec différents types de statistiques et tendances.
      </p>

      <div className="space-y-6">
        {/* Section Membres */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Membres</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Membres"
              value="1,248"
              change="+12%"
              trend="up"
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              label="Nouveaux ce Mois"
              value="42"
              change="+8"
              trend="up"
              icon={<UserCheck className="h-5 w-5" />}
            />
            <StatCard
              label="Membres Actifs"
              value="987"
              change="+5%"
              trend="up"
              icon={<Activity className="h-5 w-5" />}
            />
            <StatCard
              label="Taux de Rétention"
              value="94%"
              change="+2%"
              trend="up"
              icon={<Award className="h-5 w-5" />}
            />
          </div>
        </div>

        {/* Section Financière */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💰 Finances</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Revenus du Mois"
              value="45,780 €"
              change="+15%"
              trend="up"
              icon={<DollarSign className="h-5 w-5" />}
            />
            <StatCard
              label="Revenus Annuels"
              value="487,200 €"
              change="+8%"
              trend="up"
              icon={<CreditCard className="h-5 w-5" />}
            />
            <StatCard
              label="Paiements en Attente"
              value="3,450 €"
              change="-12%"
              trend="down"
              icon={<DollarSign className="h-5 w-5" />}
            />
            <StatCard
              label="Taux de Paiement"
              value="96%"
              change="+1%"
              trend="up"
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </div>
        </div>

        {/* Section Activités */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📅 Activités</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Cours Programmés"
              value="156"
              change="+8"
              trend="up"
              icon={<Calendar className="h-5 w-5" />}
            />
            <StatCard
              label="Taux de Présence"
              value="87%"
              change="+2%"
              trend="up"
            />
            <StatCard
              label="Annulations"
              value="8"
              change="-25%"
              trend="down"
            />
            <StatCard
              label="Places Disponibles"
              value="42"
              change="+6"
              trend="up"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 7: TENDANCES NEUTRES ─────────────────────────────────────────────

export function NeutralTrendStats() {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tendances Neutres</h2>
      <p className="text-sm text-gray-600 mb-4">
        Statistiques avec tendance neutre (gris) pour des métriques stables.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
        <StatCard
          label="Capacité Moyenne"
          value="75%"
          change="0%"
          trend="neutral"
        />
        <StatCard
          label="Durée Moyenne Cours"
          value="60 min"
          change="±0"
          trend="neutral"
        />
        <StatCard
          label="Ratio Prof/Élève"
          value="1:8"
          trend="neutral"
        />
      </div>
    </div>
  );
}

// ─── EXEMPLE 8: DIFFÉRENTS FORMATS DE VALEURS ─────────────────────────────────

export function ValueFormatsExample() {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Formats de Valeurs</h2>
      <p className="text-sm text-gray-600 mb-4">
        Démonstration des différents formats de valeurs supportés.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Nombre Entier"
          value={254}
          change="+12"
          trend="up"
        />
        <StatCard
          label="Pourcentage"
          value="87.5%"
          change="+2.3%"
          trend="up"
        />
        <StatCard
          label="Devise"
          value="12,450 €"
          change="+1,200 €"
          trend="up"
        />
        <StatCard
          label="Ratio"
          value="4.2/5"
          change="+0.3"
          trend="up"
        />
      </div>
    </div>
  );
}

// ─── EXEMPLE 9: CLASSES PERSONNALISÉES ────────────────────────────────────────

export function CustomClassesExample() {
  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Classes Personnalisées</h2>
      <p className="text-sm text-gray-600 mb-4">
        Utilisation de la prop `className` pour personnaliser l'apparence.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
        <StatCard
          label="Mise en Avant"
          value="VIP"
          change="+100%"
          trend="up"
          className="ring-2 ring-blue-500 ring-offset-2"
        />
        <StatCard
          label="Alerte"
          value="Critique"
          change="-50%"
          trend="down"
          className="ring-2 ring-red-500 ring-offset-2"
        />
        <StatCard
          label="Succès"
          value="Objectif Atteint"
          trend="up"
          className="ring-2 ring-green-500 ring-offset-2"
        />
      </div>
    </div>
  );
}

// ─── COMPOSANT DÉMO GLOBAL ────────────────────────────────────────────────────

export default function StatCardExamples() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 space-y-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">StatCard - Exemples</h1>
          <p className="text-lg text-gray-600">
            Composant réutilisable pour afficher des statistiques de manière élégante
          </p>
        </div>

        <BasicStatCard />
        <StatCardWithPositiveChange />
        <StatCardWithNegativeChange />
        <StatCardWithIcon />
        <StatsGrid />
        <ComprehensiveStatsExample />
        <NeutralTrendStats />
        <ValueFormatsExample />
        <CustomClassesExample />
      </div>
    </div>
  );
}
