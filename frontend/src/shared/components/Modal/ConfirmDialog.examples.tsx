/**
 * ConfirmDialog Examples - ClubManager V3
 *
 * Exemples d'utilisation du composant ConfirmDialog.
 * Remplace window.confirm() avec une meilleure UX.
 *
 * @see ConfirmDialog.tsx pour l'implémentation
 * @see ConfirmDialog.md pour la documentation complète
 */

import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "../Button";
import { Card } from "../Card";

// ─── EXAMPLE 1: Basic Confirm ────────────────────────────────────────────────

/**
 * Exemple de base avec un toggle simple.
 * Démontre l'utilisation minimale du composant.
 */
export function BasicConfirm() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    console.log("Action confirmée !");
    alert("Action confirmée ! (voir console)");
  };

  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">
          Exemple 1 : Confirmation simple
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Utilisation de base avec variant danger
        </p>
      </Card.Header>
      <Card.Body>
        <Button variant="danger" onClick={() => setShowConfirm(true)}>
          Supprimer l'élément
        </Button>

        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
          title="Supprimer l'élément"
          message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
          variant="danger"
        />
      </Card.Body>
    </Card>
  );
}

// ─── EXAMPLE 2: Delete Member ────────────────────────────────────────────────

/**
 * Exemple réaliste de suppression d'un membre.
 * Inclut loading state et simulation d'appel API.
 */
export function DeleteMemberExample() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const memberName = "Jean Dupont";
  const memberId = "U-2025-0042";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Simulation d'appel API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(`Membre ${memberId} supprimé`);
      alert(`${memberName} a été supprimé avec succès !`);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression");
      throw error; // Empêche la fermeture de la modal
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">
          Exemple 2 : Suppression de membre
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Action async avec loading state (variant danger)
        </p>
      </Card.Header>
      <Card.Body>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-900">{memberName}</p>
            <p className="text-xs text-gray-500">ID: {memberId}</p>
          </div>

          <Button variant="danger" onClick={() => setShowConfirm(true)}>
            Supprimer ce membre
          </Button>
        </div>

        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDelete}
          title="Supprimer le membre"
          message={`Êtes-vous sûr de vouloir supprimer ${memberName} ? Toutes ses données (profil, historique de paiements, commandes) seront définitivement perdues.`}
          variant="danger"
          confirmLabel="Supprimer définitivement"
          isLoading={isDeleting}
        />
      </Card.Body>
    </Card>
  );
}

// ─── EXAMPLE 3: Warning Variant ──────────────────────────────────────────────

/**
 * Exemple avec variant warning.
 * Pour les actions importantes nécessitant attention (non destructives).
 */
export function WarningExample() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangeRole = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Rôle changé en ADMIN");
    alert("L'utilisateur a été promu administrateur");
  };

  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">
          Exemple 3 : Variant Warning
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Pour actions importantes nécessitant attention
        </p>
      </Card.Header>
      <Card.Body>
        <Button variant="primary" onClick={() => setShowConfirm(true)}>
          Promouvoir en administrateur
        </Button>

        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleChangeRole}
          title="Promouvoir en administrateur"
          message="Cette personne aura accès à toutes les fonctionnalités d'administration, y compris la gestion des utilisateurs, des paiements et des paramètres du club."
          variant="warning"
          confirmLabel="Promouvoir"
        />
      </Card.Body>
    </Card>
  );
}

// ─── EXAMPLE 4: Info Variant ─────────────────────────────────────────────────

/**
 * Exemple avec variant info.
 * Pour les confirmations informatives (actions non destructives).
 */
export function InfoExample() {
  const [showConfirm, setShowConfirm] = useState(false);

  const recipientCount = 127;

  const handleSendBroadcast = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(`Message envoyé à ${recipientCount} membres`);
    alert(`Message envoyé avec succès à ${recipientCount} membres !`);
  };

  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">
          Exemple 4 : Variant Info
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Pour confirmations informatives
        </p>
      </Card.Header>
      <Card.Body>
        <Button variant="primary" onClick={() => setShowConfirm(true)}>
          Envoyer à tous les membres
        </Button>

        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleSendBroadcast}
          title="Envoyer le message"
          message={`Le message sera envoyé à ${recipientCount} membres actifs. Ils recevront une notification immédiatement et pourront consulter le message dans leur messagerie.`}
          variant="info"
          confirmLabel="Envoyer maintenant"
          cancelLabel="Annuler l'envoi"
        />
      </Card.Body>
    </Card>
  );
}

// ─── EXAMPLE 5: Async Action with Error ──────────────────────────────────────

/**
 * Exemple d'action async avec gestion d'erreur.
 * La modal ne se ferme pas en cas d'erreur.
 */
export function AsyncActionWithError() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulateError, setSimulateError] = useState(false);

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      await new Promise((resolve, reject) =>
        setTimeout(() => {
          if (simulateError) {
            reject(new Error("Erreur réseau simulée"));
          } else {
            resolve(null);
          }
        }, 2000),
      );
      console.log("Action réussie");
      alert("Action terminée avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      alert("❌ Erreur lors de l'action ! La modal reste ouverte.");
      throw error; // Important : empêche la fermeture de la modal
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">
          Exemple 5 : Action async avec erreur
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          La modal ne se ferme pas en cas d'erreur
        </p>
      </Card.Header>
      <Card.Body>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={simulateError}
              onChange={(e) => setSimulateError(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span>Simuler une erreur</span>
          </label>

          <Button variant="primary" onClick={() => setShowConfirm(true)}>
            Lancer l'action
          </Button>
        </div>

        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleProcess}
          title="Confirmer l'action"
          message={
            simulateError
              ? "⚠️ Une erreur sera simulée. La modal restera ouverte."
              : "L'action sera exécutée avec succès."
          }
          variant="info"
          isLoading={isProcessing}
        />
      </Card.Body>
    </Card>
  );
}

// ─── EXAMPLE 6: Custom Labels ────────────────────────────────────────────────

/**
 * Exemple avec labels personnalisés.
 * Les labels par défaut peuvent être overridés.
 */
export function CustomLabelsExample() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleArchive = () => {
    console.log("Commande archivée");
    alert("La commande a été archivée");
  };

  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">
          Exemple 6 : Labels personnalisés
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Boutons avec textes spécifiques au contexte
        </p>
      </Card.Header>
      <Card.Body>
        <Button variant="secondary" onClick={() => setShowConfirm(true)}>
          Archiver la commande
        </Button>

        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleArchive}
          title="Archiver la commande #2025-042"
          message="La commande sera déplacée vers les archives et ne sera plus visible dans la liste principale. Vous pourrez la restaurer à tout moment."
          variant="warning"
          confirmLabel="Archiver maintenant"
          cancelLabel="Non, garder visible"
        />
      </Card.Body>
    </Card>
  );
}

// ─── EXAMPLE 7: Migration from window.confirm ────────────────────────────────

/**
 * Exemple montrant la migration depuis window.confirm().
 * Démontre les avantages de ConfirmDialog.
 */
export function MigrationExample() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // ❌ AVANT : window.confirm() (bloquant, pas stylisé)
  const handleDeleteOldWay = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ?")) {
      alert("Supprimé !");
    }
  };

  // ✅ APRÈS : ConfirmDialog (non-bloquant, stylisé, accessible)
  const handleDeleteNewWay = () => {
    console.log("Supprimé avec ConfirmDialog");
    alert("✅ Supprimé avec ConfirmDialog !");
  };

  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">
          Exemple 7 : Migration depuis window.confirm()
        </h3>
        <p className="text-sm text-gray-500 mt-1">Comparaison avant/après</p>
      </Card.Header>
      <Card.Body>
        <div className="space-y-4">
          {/* Ancien style */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-900 mb-2 uppercase">
              ❌ Avant (window.confirm)
            </p>
            <Button variant="outline" size="sm" onClick={handleDeleteOldWay}>
              Supprimer (window.confirm)
            </Button>
            <p className="text-xs text-red-700 mt-2">
              Bloquant • Pas stylisé • Mauvaise UX • Accessibilité limitée
            </p>
          </div>

          {/* Nouveau style */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs font-semibold text-green-900 mb-2 uppercase">
              ✅ Après (ConfirmDialog)
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowConfirmDialog(true)}
            >
              Supprimer (ConfirmDialog)
            </Button>
            <p className="text-xs text-green-700 mt-2">
              Non-bloquant • Stylisé • Bonne UX • Accessible • Loading state
            </p>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleDeleteNewWay}
          title="Supprimer l'élément"
          message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
          variant="danger"
        />
      </Card.Body>
    </Card>
  );
}

// ─── EXAMPLE 8: In Table Actions ─────────────────────────────────────────────

/**
 * Exemple d'utilisation dans une table avec plusieurs actions.
 * Pattern commun : stocker l'ID de l'élément à supprimer.
 */
export function InTableActionsExample() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Données de démonstration
  const members = [
    { id: 1, name: "Jean Dupont", email: "jean.dupont@example.com" },
    { id: 2, name: "Marie Martin", email: "marie.martin@example.com" },
    { id: 3, name: "Pierre Leroy", email: "pierre.leroy@example.com" },
  ];

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log(`Membre ${deleteId} supprimé`);
      alert(`Membre supprimé avec succès !`);
    } catch (error) {
      alert("Erreur lors de la suppression");
      throw error;
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const selectedMember = members.find((m) => m.id === deleteId);

  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold text-gray-900">
          Exemple 8 : Actions dans une table
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Pattern avec ID stocké dans l'état
        </p>
      </Card.Header>
      <Card.Body>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {member.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {member.email}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteId(member.id)}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ConfirmDialog
          isOpen={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Supprimer le membre"
          message={
            selectedMember
              ? `Êtes-vous sûr de vouloir supprimer ${selectedMember.name} ? Toutes ses données seront définitivement perdues.`
              : "Êtes-vous sûr de vouloir supprimer ce membre ?"
          }
          variant="danger"
          confirmLabel="Supprimer"
          isLoading={isDeleting}
        />
      </Card.Body>
    </Card>
  );
}

// ─── EXAMPLE SHOWCASE ────────────────────────────────────────────────────────

/**
 * Showcase complet de tous les exemples.
 * Utilisé dans Storybook ou page de documentation.
 */
export function ConfirmDialogExamples() {
  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ConfirmDialog - Exemples
          </h1>
          <p className="text-gray-600">
            Composant de dialogue de confirmation pour remplacer
            window.confirm() avec une meilleure UX et accessibilité.
          </p>
        </div>

        <div className="space-y-6">
          <BasicConfirm />
          <DeleteMemberExample />
          <WarningExample />
          <InfoExample />
          <AsyncActionWithError />
          <CustomLabelsExample />
          <MigrationExample />
          <InTableActionsExample />
        </div>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            💡 Bonnes pratiques
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              Utilisez{" "}
              <code className="bg-blue-100 px-1 rounded">variant="danger"</code>{" "}
              pour les suppressions
            </li>
            <li>
              Utilisez{" "}
              <code className="bg-blue-100 px-1 rounded">
                variant="warning"
              </code>{" "}
              pour les actions importantes
            </li>
            <li>
              Utilisez{" "}
              <code className="bg-blue-100 px-1 rounded">variant="info"</code>{" "}
              pour les confirmations informatives
            </li>
            <li>Toujours gérer le loading state pour les actions async</li>
            <li>
              Throw l'erreur dans onConfirm pour empêcher la fermeture en cas
              d'erreur
            </li>
            <li>Écrire des messages clairs et explicites</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialogExamples;
