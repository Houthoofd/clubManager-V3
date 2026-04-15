/**
 * IconButton Component - Examples
 *
 * Exemples d'utilisation du composant IconButton dans différents contextes.
 * Ce fichier sert de documentation vivante et peut être utilisé pour tester
 * visuellement les différents variants, tailles et formes.
 */

import { useState } from "react";
import {
  IconButton,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  InfoIcon,
  PlusIcon,
} from "./IconButton";

// ─── ICÔNES ADDITIONNELLES ──────────────────────────────────────────────────

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function DownloadIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function RefreshIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function SettingsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function HeartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function ShareIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

// ─── EXEMPLE 1: VARIANTS ─────────────────────────────────────────────────────

export function IconButtonVariants() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">
        Variants de IconButton
      </h2>

      <div className="flex flex-wrap items-center gap-3">
        <IconButton
          icon={<PencilIcon />}
          ariaLabel="Éditer (Primary)"
          variant="primary"
        />
        <IconButton
          icon={<PencilIcon />}
          ariaLabel="Éditer (Secondary)"
          variant="secondary"
        />
        <IconButton
          icon={<PencilIcon />}
          ariaLabel="Éditer (Outline)"
          variant="outline"
        />
        <IconButton
          icon={<TrashIcon />}
          ariaLabel="Supprimer (Danger)"
          variant="danger"
        />
        <IconButton
          icon={<CheckIcon />}
          ariaLabel="Valider (Success)"
          variant="success"
        />
        <IconButton
          icon={<InfoIcon />}
          ariaLabel="Informations (Ghost)"
          variant="ghost"
        />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Cas d'usage
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <strong>Primary:</strong> Action principale (Enregistrer, Confirmer)
          </li>
          <li>
            <strong>Secondary:</strong> Action secondaire (Réinitialiser)
          </li>
          <li>
            <strong>Outline:</strong> Action tertiaire (Voir détails)
          </li>
          <li>
            <strong>Danger:</strong> Action destructive (Supprimer, Rejeter)
          </li>
          <li>
            <strong>Success:</strong> Action positive (Valider, Approuver)
          </li>
          <li>
            <strong>Ghost:</strong> Action discrète (Éditer, Menu) - Par défaut
          </li>
        </ul>
      </div>
    </div>
  );
}

// ─── EXEMPLE 2: TAILLES ──────────────────────────────────────────────────────

export function IconButtonSizes() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">
        Tailles de IconButton
      </h2>

      <div className="flex flex-wrap items-end gap-4">
        <div className="text-center">
          <IconButton
            icon={<PencilIcon className="h-3 w-3" />}
            ariaLabel="Éditer (XS)"
            size="xs"
            variant="primary"
          />
          <p className="text-xs text-gray-500 mt-2">XS (p-1)</p>
        </div>

        <div className="text-center">
          <IconButton
            icon={<PencilIcon className="h-4 w-4" />}
            ariaLabel="Éditer (SM)"
            size="sm"
            variant="primary"
          />
          <p className="text-xs text-gray-500 mt-2">SM (p-1.5)</p>
        </div>

        <div className="text-center">
          <IconButton
            icon={<PencilIcon className="h-5 w-5" />}
            ariaLabel="Éditer (MD)"
            size="md"
            variant="primary"
          />
          <p className="text-xs text-gray-500 mt-2">MD (p-2) - Défaut</p>
        </div>

        <div className="text-center">
          <IconButton
            icon={<PencilIcon className="h-6 w-6" />}
            ariaLabel="Éditer (LG)"
            size="lg"
            variant="primary"
          />
          <p className="text-xs text-gray-500 mt-2">LG (p-2.5)</p>
        </div>

        <div className="text-center">
          <IconButton
            icon={<PencilIcon className="h-7 w-7" />}
            ariaLabel="Éditer (XL)"
            size="xl"
            variant="primary"
          />
          <p className="text-xs text-gray-500 mt-2">XL (p-3)</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          💡 Recommandations
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <strong>XS/SM:</strong> Tableaux denses, badges, tags
          </li>
          <li>
            <strong>MD:</strong> Usage standard (toolbars, cards) - Défaut
          </li>
          <li>
            <strong>LG/XL:</strong> Pages de landing, actions importantes
          </li>
        </ul>
      </div>
    </div>
  );
}

// ─── EXEMPLE 3: FORMES ───────────────────────────────────────────────────────

export function IconButtonShapes() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Formes de IconButton</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Square (rounded-lg) - Défaut
          </h3>
          <div className="flex flex-wrap gap-3">
            <IconButton
              icon={<PencilIcon />}
              ariaLabel="Éditer"
              variant="primary"
              shape="square"
            />
            <IconButton
              icon={<TrashIcon />}
              ariaLabel="Supprimer"
              variant="danger"
              shape="square"
            />
            <IconButton
              icon={<EyeIcon />}
              ariaLabel="Voir"
              variant="ghost"
              shape="square"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Circle (rounded-full)
          </h3>
          <div className="flex flex-wrap gap-3">
            <IconButton
              icon={<PencilIcon />}
              ariaLabel="Éditer"
              variant="primary"
              shape="circle"
            />
            <IconButton
              icon={<TrashIcon />}
              ariaLabel="Supprimer"
              variant="danger"
              shape="circle"
            />
            <IconButton
              icon={<EyeIcon />}
              ariaLabel="Voir"
              variant="ghost"
              shape="circle"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Quand utiliser ?
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <strong>Square:</strong> Usage standard, s'intègre bien aux
            interfaces modernes
          </li>
          <li>
            <strong>Circle:</strong> Actions flottantes, boutons d'actions
            rapides, design épuré
          </li>
        </ul>
      </div>
    </div>
  );
}

// ─── EXEMPLE 4: LOADING STATE ───────────────────────────────────────────────

export function IconButtonLoading() {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  };

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => setDeleting(false), 2000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">
        IconButton avec Loading State
      </h2>

      <div className="flex flex-wrap items-center gap-4">
        <div className="space-y-2">
          <IconButton
            icon={<CheckIcon />}
            ariaLabel="Enregistrer"
            variant="primary"
            loading={saving}
            onClick={handleSave}
          />
          <p className="text-xs text-gray-500 text-center">Enregistrer</p>
        </div>

        <div className="space-y-2">
          <IconButton
            icon={<TrashIcon />}
            ariaLabel="Supprimer"
            variant="danger"
            loading={deleting}
            onClick={handleDelete}
          />
          <p className="text-xs text-gray-500 text-center">Supprimer</p>
        </div>

        <div className="space-y-2">
          <IconButton
            icon={<RefreshIcon />}
            ariaLabel="Actualiser"
            variant="ghost"
            loading={refreshing}
            onClick={handleRefresh}
          />
          <p className="text-xs text-gray-500 text-center">Actualiser</p>
        </div>

        <div className="space-y-2">
          <IconButton
            icon={<DownloadIcon />}
            ariaLabel="Télécharger"
            variant="outline"
            loading={true}
            shape="circle"
          />
          <p className="text-xs text-gray-500 text-center">Télécharger</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">💡 Note</h3>
        <p className="text-sm text-gray-600">
          Pendant le chargement, l'icône est remplacée par un spinner et le
          bouton est automatiquement désactivé. Cliquez sur les boutons
          ci-dessus pour voir l'effet.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 5: DISABLED STATE ──────────────────────────────────────────────

export function IconButtonDisabled() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">
        IconButton Désactivés
      </h2>

      <div className="flex flex-wrap items-center gap-3">
        <IconButton
          icon={<PencilIcon />}
          ariaLabel="Éditer (désactivé)"
          variant="primary"
          disabled
        />
        <IconButton
          icon={<TrashIcon />}
          ariaLabel="Supprimer (désactivé)"
          variant="danger"
          disabled
        />
        <IconButton
          icon={<EyeIcon />}
          ariaLabel="Voir (désactivé)"
          variant="ghost"
          disabled
        />
        <IconButton
          icon={<CheckIcon />}
          ariaLabel="Valider (désactivé)"
          variant="success"
          disabled
          shape="circle"
        />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Comportement
        </h3>
        <p className="text-sm text-gray-600">
          Les boutons désactivés ont une opacité réduite (40%) et le curseur
          change pour indiquer qu'ils ne sont pas cliquables.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 6: AVEC TOOLTIPS ───────────────────────────────────────────────

export function IconButtonWithTooltips() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">
        IconButton avec Tooltips
      </h2>

      <div className="flex flex-wrap items-center gap-3">
        <IconButton
          icon={<PencilIcon />}
          ariaLabel="Modifier l'élément"
          tooltip="Modifier l'élément"
          variant="ghost"
        />
        <IconButton
          icon={<TrashIcon />}
          ariaLabel="Supprimer définitivement"
          tooltip="Supprimer définitivement"
          variant="danger"
          shape="circle"
        />
        <IconButton
          icon={<EyeIcon />}
          ariaLabel="Prévisualiser le contenu"
          tooltip="Prévisualiser le contenu"
          variant="ghost"
        />
        <IconButton
          icon={<DownloadIcon />}
          ariaLabel="Télécharger le fichier"
          tooltip="Télécharger le fichier (PDF, 2.3 MB)"
          variant="outline"
        />
        <IconButton
          icon={<InfoIcon />}
          ariaLabel="Plus d'informations"
          tooltip="Cliquez pour afficher les détails"
          variant="ghost"
          size="sm"
        />
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          💡 Accessibilité
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          <strong>aria-label</strong> est obligatoire pour les lecteurs d'écran.
          <br />
          <strong>tooltip</strong> (attribut HTML{" "}
          <code className="bg-gray-100 px-1 py-0.5 rounded">title</code>) est
          optionnel et apparaît au survol.
        </p>
        <p className="text-xs text-gray-500">
          Survolez les boutons ci-dessus pour voir les tooltips natifs du
          navigateur.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 7: GROUPES D'ACTIONS ────────────────────────────────────────────

export function IconButtonActionGroups() {
  const [liked, setLiked] = useState(false);

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">Groupes d'Actions</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Actions de ligne (Table)
          </h3>
          <div className="flex gap-1">
            <IconButton
              icon={<EyeIcon className="h-4 w-4" />}
              ariaLabel="Voir"
              variant="ghost"
              size="sm"
              tooltip="Voir les détails"
            />
            <IconButton
              icon={<PencilIcon className="h-4 w-4" />}
              ariaLabel="Modifier"
              variant="ghost"
              size="sm"
              tooltip="Modifier"
            />
            <IconButton
              icon={<TrashIcon className="h-4 w-4" />}
              ariaLabel="Supprimer"
              variant="danger"
              size="sm"
              tooltip="Supprimer"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Actions de Card
          </h3>
          <div className="flex gap-2">
            <IconButton
              icon={<PencilIcon />}
              ariaLabel="Modifier"
              variant="ghost"
            />
            <IconButton
              icon={<ShareIcon />}
              ariaLabel="Partager"
              variant="ghost"
            />
            <IconButton
              icon={<HeartIcon />}
              ariaLabel={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
              variant={liked ? "danger" : "ghost"}
              onClick={() => setLiked(!liked)}
            />
            <IconButton
              icon={<TrashIcon />}
              ariaLabel="Supprimer"
              variant="ghost"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Actions rapides (Circle)
          </h3>
          <div className="flex gap-2">
            <IconButton
              icon={<PlusIcon />}
              ariaLabel="Ajouter"
              variant="primary"
              shape="circle"
            />
            <IconButton
              icon={<RefreshIcon />}
              ariaLabel="Actualiser"
              variant="secondary"
              shape="circle"
            />
            <IconButton
              icon={<SettingsIcon />}
              ariaLabel="Paramètres"
              variant="ghost"
              shape="circle"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXEMPLE 8: TOOLBAR ──────────────────────────────────────────────────────

export function IconButtonToolbar() {
  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">
        Toolbar avec IconButtons
      </h2>

      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <IconButton
              icon={<PlusIcon className="h-5 w-5" />}
              ariaLabel="Nouveau"
              variant="primary"
              tooltip="Créer un nouvel élément"
            />
            <div className="h-6 w-px bg-gray-300 mx-2" />
            <IconButton
              icon={<RefreshIcon className="h-5 w-5" />}
              ariaLabel="Actualiser"
              variant="ghost"
              tooltip="Actualiser la liste"
            />
            <IconButton
              icon={<DownloadIcon className="h-5 w-5" />}
              ariaLabel="Exporter"
              variant="ghost"
              tooltip="Exporter en CSV"
            />
          </div>

          <div className="flex items-center gap-1">
            <IconButton
              icon={<SettingsIcon className="h-5 w-5" />}
              ariaLabel="Paramètres"
              variant="ghost"
              tooltip="Paramètres d'affichage"
            />
            <IconButton
              icon={<InfoIcon className="h-5 w-5" />}
              ariaLabel="Aide"
              variant="ghost"
              tooltip="Afficher l'aide"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Structure typique
        </h3>
        <p className="text-sm text-gray-600">
          Actions principales à gauche (avec Primary pour l'action la plus
          importante), actions secondaires au centre, et paramètres/aide à
          droite.
        </p>
      </div>
    </div>
  );
}

// ─── EXEMPLE 9: TABLE ACTIONS ────────────────────────────────────────────────

export function IconButtonInTable() {
  const users = [
    { id: 1, name: "Jean Dupont", email: "jean@example.com", role: "Admin" },
    { id: 2, name: "Marie Martin", email: "marie@example.com", role: "Membre" },
    {
      id: 3,
      name: "Pierre Durand",
      email: "pierre@example.com",
      role: "Membre",
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">
        IconButtons dans un Tableau
      </h2>

      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.role}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <IconButton
                      icon={<EyeIcon className="h-4 w-4" />}
                      ariaLabel={`Voir ${user.name}`}
                      variant="ghost"
                      size="sm"
                      tooltip="Voir le profil"
                    />
                    <IconButton
                      icon={<PencilIcon className="h-4 w-4" />}
                      ariaLabel={`Modifier ${user.name}`}
                      variant="ghost"
                      size="sm"
                      tooltip="Modifier"
                    />
                    <IconButton
                      icon={<TrashIcon className="h-4 w-4" />}
                      ariaLabel={`Supprimer ${user.name}`}
                      variant="danger"
                      size="sm"
                      tooltip="Supprimer"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          💡 Bonnes pratiques
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            • Utiliser <strong>size="sm"</strong> pour les tableaux denses
          </li>
          <li>
            • Variant <strong>ghost</strong> pour ne pas surcharger visuellement
          </li>
          <li>• Toujours inclure des tooltips descriptifs</li>
          <li>• aria-label doit identifier l'élément concerné</li>
        </ul>
      </div>
    </div>
  );
}

// ─── EXEMPLE 10: COMBINAISONS AVANCÉES ──────────────────────────────────────

export function IconButtonAdvanced() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900">
        Combinaisons Avancées
      </h2>

      <div className="space-y-6">
        {/* Toggle de vue */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Toggle de Vue
          </h3>
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <IconButton
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              }
              ariaLabel="Vue grille"
              variant={view === "grid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setView("grid")}
            />
            <IconButton
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              }
              ariaLabel="Vue liste"
              variant={view === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
            />
          </div>
        </div>

        {/* FAB (Floating Action Button) */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Floating Action Button (FAB)
          </h3>
          <div className="relative h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="absolute bottom-4 right-4">
              <IconButton
                icon={<PlusIcon className="h-6 w-6" />}
                ariaLabel="Créer un nouvel élément"
                variant="primary"
                shape="circle"
                size="lg"
                tooltip="Créer"
                className="shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Card avec actions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Card avec Actions
          </h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-semibold text-gray-900">
                  Titre de la Card
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Description courte du contenu de cette carte.
                </p>
              </div>
              <div className="flex gap-1 ml-4">
                <IconButton
                  icon={<PencilIcon className="h-4 w-4" />}
                  ariaLabel="Modifier"
                  variant="ghost"
                  size="sm"
                />
                <IconButton
                  icon={<TrashIcon className="h-4 w-4" />}
                  ariaLabel="Supprimer"
                  variant="ghost"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

export default function IconButtonExamples() {
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          IconButton - Exemples
        </h1>
        <p className="text-gray-600">
          Composant de bouton spécialisé pour les icônes uniquement. Optimisé
          pour les actions rapides avec un design épuré.
        </p>
      </div>

      <IconButtonVariants />
      <IconButtonSizes />
      <IconButtonShapes />
      <IconButtonLoading />
      <IconButtonDisabled />
      <IconButtonWithTooltips />
      <IconButtonActionGroups />
      <IconButtonToolbar />
      <IconButtonInTable />
      <IconButtonAdvanced />
    </div>
  );
}
