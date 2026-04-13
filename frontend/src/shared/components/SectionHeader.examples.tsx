/**
 * SectionHeader - Exemples d'utilisation
 *
 * Collection d'exemples montrant les différentes configurations
 * du composant SectionHeader pour les en-têtes de section.
 */

import { SectionHeader } from './SectionHeader';
import { Button } from './Button';
import { Card } from './Card';

// ─── EXEMPLE 1 : BASIQUE ─────────────────────────────────────────────────────

/**
 * SectionHeader basique (h2 et h3)
 *
 * Utilisation minimale avec juste un titre.
 * Démontre la différence de taille entre h2 (défaut) et h3.
 */
export function BasicSectionHeader() {
  return (
    <div className="space-y-8">
      {/* Niveau h2 (défaut) */}
      <div>
        <SectionHeader title="Section principale" />
        <p className="mt-4 text-sm text-gray-600">
          Par défaut, SectionHeader utilise h2 avec text-xl
        </p>
      </div>

      {/* Niveau h3 */}
      <div>
        <SectionHeader
          title="Sous-section"
          level={3}
        />
        <p className="mt-4 text-sm text-gray-600">
          Avec level={3}, utilise h3 avec text-lg
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 2 : AVEC BADGE ──────────────────────────────────────────────────

/**
 * SectionHeader avec badge
 *
 * Le badge affiche généralement un compteur d'éléments.
 * Peut être un nombre ou une chaîne de caractères.
 */
export function WithBadge() {
  return (
    <div className="space-y-6">
      {/* Badge numérique */}
      <SectionHeader
        title="Membres actifs"
        badge={24}
      />

      {/* Badge textuel */}
      <SectionHeader
        title="Professeurs"
        badge="5 actifs"
      />

      {/* Badge avec 0 (affiche quand même) */}
      <SectionHeader
        title="Cours annulés"
        badge={0}
      />
    </div>
  );
}

// ─── EXEMPLE 3 : AVEC DESCRIPTION ────────────────────────────────────────────

/**
 * SectionHeader avec description
 *
 * La description ajoute du contexte ou une explication.
 * Affichée en texte plus petit et grisé sous le titre.
 */
export function WithDescription() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Articles disponibles"
        description="Liste des produits actuellement en stock"
      />

      <SectionHeader
        title="Historique des paiements"
        description="Consultez tous les paiements effectués au cours des 12 derniers mois"
        badge={48}
      />
    </div>
  );
}

// ─── EXEMPLE 4 : AVEC ACTIONS ────────────────────────────────────────────────

/**
 * SectionHeader avec actions
 *
 * Les actions sont généralement des boutons placés à droite.
 * Permet d'ajouter, modifier ou filtrer le contenu de la section.
 */
export function WithActions() {
  return (
    <div className="space-y-6">
      {/* Action simple */}
      <SectionHeader
        title="Équipements"
        badge={12}
        actions={
          <Button size="sm" variant="primary">
            Ajouter
          </Button>
        }
      />

      {/* Plusieurs actions */}
      <SectionHeader
        title="Documents"
        badge={8}
        description="Fichiers partagés avec la famille"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Filtrer
            </Button>
            <Button size="sm" variant="primary">
              Importer
            </Button>
          </div>
        }
      />
    </div>
  );
}

// ─── EXEMPLE 5 : AVEC DIVIDER ────────────────────────────────────────────────

/**
 * SectionHeader avec divider
 *
 * Le divider ajoute une ligne horizontale sous l'en-tête
 * pour séparer visuellement les sections.
 */
export function WithDivider() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Informations personnelles"
        description="Données du profil utilisateur"
        divider
      />
      <p className="text-sm text-gray-600">
        Le contenu de la section apparaît ici, après le divider.
      </p>

      <SectionHeader
        title="Paramètres de sécurité"
        divider
      />
      <p className="text-sm text-gray-600">
        Configurez vos options de sécurité.
      </p>
    </div>
  );
}

// ─── EXEMPLE 6 : EXEMPLE COMPLET ─────────────────────────────────────────────

/**
 * SectionHeader complet
 *
 * Utilise tous les props disponibles ensemble.
 */
export function FullExample() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Cours disponibles"
        description="Planning des séances à venir pour les 30 prochains jours"
        badge={18}
        level={2}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Filtrer
            </Button>
            <Button size="sm" variant="primary">
              Nouveau cours
            </Button>
          </div>
        }
        divider
      />

      {/* Simulation du contenu */}
      <Card>
        <div className="p-4 text-sm text-gray-600">
          Contenu de la section (liste des cours, tableau, etc.)
        </div>
      </Card>
    </div>
  );
}

// ─── EXEMPLE 7 : DANS LES ONGLETS ────────────────────────────────────────────

/**
 * SectionHeader dans les onglets
 *
 * Utilisation typique pour structurer le contenu de chaque onglet.
 */
export function InTabContent() {
  return (
    <div className="space-y-6">
      {/* Simulation d'un tab panel */}
      <div className="border rounded-lg p-6">
        <SectionHeader
          title="Informations générales"
          description="Détails de la famille"
          divider
        />
        <div className="mt-4 text-sm text-gray-600">
          Contenu de l'onglet "Informations"...
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <SectionHeader
          title="Membres"
          badge={5}
          actions={<Button size="sm">Ajouter un membre</Button>}
          divider
        />
        <div className="mt-4 text-sm text-gray-600">
          Contenu de l'onglet "Membres"...
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <SectionHeader
          title="Documents partagés"
          badge={12}
          description="Fichiers et attestations"
          actions={
            <Button size="sm" variant="outline">
              Tout télécharger
            </Button>
          }
          divider
        />
        <div className="mt-4 text-sm text-gray-600">
          Contenu de l'onglet "Documents"...
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 8 : SECTIONS IMBRIQUÉES ─────────────────────────────────────────

/**
 * Hiérarchie correcte h2 → h3
 *
 * Démontre l'utilisation correcte de la hiérarchie sémantique.
 * Important pour l'accessibilité et le SEO.
 */
export function NestedSections() {
  return (
    <div className="space-y-6">
      {/* Note : En production, PageHeader (h1) serait au-dessus */}

      {/* Section principale (h2) */}
      <SectionHeader
        title="Membres de la famille"
        badge={4}
        description="Liste complète des membres enregistrés"
        divider
      />

      <div className="pl-4 space-y-6">
        {/* Sous-section (h3) */}
        <div>
          <SectionHeader
            title="Parents"
            level={3}
            badge={2}
          />
          <div className="mt-3 text-sm text-gray-600">
            • Jean Dupont (père)<br />
            • Marie Dupont (mère)
          </div>
        </div>

        {/* Sous-section (h3) */}
        <div>
          <SectionHeader
            title="Enfants"
            level={3}
            badge={2}
            actions={<Button size="sm" variant="outline">Ajouter</Button>}
          />
          <div className="mt-3 text-sm text-gray-600">
            • Sophie Dupont (12 ans)<br />
            • Lucas Dupont (9 ans)
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 9 : PLUSIEURS SECTIONS SUCCESSIVES ──────────────────────────────

/**
 * Liste de sections successives
 *
 * Exemple typique d'une page avec plusieurs sections thématiques.
 * Montre comment organiser différents types de contenu.
 */
export function ListSections() {
  return (
    <div className="space-y-8">
      {/* Section 1 : Membres */}
      <div>
        <SectionHeader
          title="Membres"
          badge={15}
          description="Familles et adhérents actifs"
          actions={<Button size="sm">Ajouter un membre</Button>}
          divider
        />
        <Card className="mt-4">
          <div className="p-4 text-sm text-gray-600">
            Liste des membres...
          </div>
        </Card>
      </div>

      {/* Section 2 : Professeurs */}
      <div>
        <SectionHeader
          title="Professeurs"
          badge={5}
          description="Enseignants et intervenants"
          actions={<Button size="sm">Inviter un professeur</Button>}
          divider
        />
        <Card className="mt-4">
          <div className="p-4 text-sm text-gray-600">
            Liste des professeurs...
          </div>
        </Card>
      </div>

      {/* Section 3 : Matériel */}
      <div>
        <SectionHeader
          title="Matériel"
          badge={32}
          description="Équipements et ressources disponibles"
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Exporter
              </Button>
              <Button size="sm">
                Ajouter du matériel
              </Button>
            </div>
          }
          divider
        />
        <Card className="mt-4">
          <div className="p-4 text-sm text-gray-600">
            Inventaire du matériel...
          </div>
        </Card>
      </div>

      {/* Section 4 : Statistiques */}
      <div>
        <SectionHeader
          title="Statistiques"
          description="Aperçu de l'activité du club"
          actions={
            <Button size="sm" variant="ghost">
              Voir le rapport complet
            </Button>
          }
          divider
        />
        <Card className="mt-4">
          <div className="p-4 text-sm text-gray-600">
            Graphiques et données...
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── EXEMPLE 10 : FORMULAIRE MULTI-SECTIONS ──────────────────────────────────

/**
 * Formulaire organisé en sections
 *
 * Montre comment structurer un formulaire complexe avec plusieurs sections.
 */
export function FormSections() {
  return (
    <div className="space-y-8 max-w-2xl">
      {/* Section 1 */}
      <div>
        <SectionHeader
          title="Informations personnelles"
          description="Nom, prénom et date de naissance"
          divider
        />
        <div className="mt-4 space-y-3">
          <div className="text-sm text-gray-600">
            [Champs du formulaire : nom, prénom, date de naissance...]
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div>
        <SectionHeader
          title="Coordonnées"
          description="Adresse postale et contact"
          divider
        />
        <div className="mt-4 space-y-3">
          <div className="text-sm text-gray-600">
            [Champs du formulaire : adresse, ville, téléphone, email...]
          </div>
        </div>
      </div>

      {/* Section 3 */}
      <div>
        <SectionHeader
          title="Préférences"
          description="Configuration de votre compte"
          divider
        />
        <div className="mt-4 space-y-3">
          <div className="text-sm text-gray-600">
            [Options : notifications, langue, thème...]
          </div>
        </div>
      </div>

      {/* Actions du formulaire */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline">Annuler</Button>
        <Button variant="primary">Enregistrer</Button>
      </div>
    </div>
  );
}

// ─── EXEMPLE 11 : AVEC CLASSES PERSONNALISÉES ────────────────────────────────

/**
 * SectionHeader avec styles personnalisés
 *
 * Montre comment étendre le style avec className.
 */
export function WithCustomClasses() {
  return (
    <div className="space-y-6">
      {/* Fond coloré */}
      <SectionHeader
        title="Section en vedette"
        description="Contenu important mis en avant"
        badge="Nouveau"
        className="bg-blue-50 p-4 rounded-lg"
      />

      {/* Espacement personnalisé */}
      <SectionHeader
        title="Section avec espacement"
        badge={3}
        className="mb-8"
        divider
      />

      {/* Bordure personnalisée */}
      <SectionHeader
        title="Section avec bordure"
        description="Style personnalisé pour se démarquer"
        className="border-l-4 border-blue-500 pl-4"
      />
    </div>
  );
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export default {
  BasicSectionHeader,
  WithBadge,
  WithDescription,
  WithActions,
  WithDivider,
  FullExample,
  InTabContent,
  NestedSections,
  ListSections,
  FormSections,
  WithCustomClasses,
};
