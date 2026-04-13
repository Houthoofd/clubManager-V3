# ErrorBanner Component

Composant réutilisable pour afficher des messages d'erreur, d'alerte, d'information ou de succès. Conçu pour donner un feedback visuel clair et accessible aux utilisateurs.

## Description

Le composant `ErrorBanner` offre un moyen cohérent d'afficher des messages de feedback dans l'application. Il supporte 4 variants différents (error, warning, info, success) et peut être utilisé pour :

- Afficher des erreurs de validation de formulaire
- Communiquer des messages système
- Donner un feedback sur des actions utilisateur
- Afficher des avertissements ou informations importantes

## Quand l'utiliser

### ✅ Utilisez ErrorBanner pour :

- **Erreurs de formulaire** : Afficher des erreurs de validation au niveau du formulaire
- **Messages système** : Communiquer des problèmes de connexion, d'API, etc.
- **Feedback d'actions** : Confirmer ou rejeter des actions utilisateur
- **Avertissements** : Prévenir l'utilisateur d'actions importantes ou irréversibles
- **Informations contextuelles** : Donner des informations utiles dans un contexte spécifique

### ❌ N'utilisez pas ErrorBanner pour :

- **Erreurs de champs individuels** : Utilisez plutôt `FormInput` avec son message d'erreur
- **Notifications toast** : Utilisez la bibliothèque `sonner` pour les notifications temporaires
- **Dialogues de confirmation** : Utilisez le composant `Modal` pour les actions critiques
- **Messages permanents dans la page** : Utilisez plutôt `EmptyState` ou un message inline

## API du composant

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `variant` | `'error' \| 'warning' \| 'info' \| 'success'` | `'error'` | Type de message à afficher |
| `title` | `string` | - | Titre optionnel du message |
| `message` | `string` | **Requis** | Message principal à afficher |
| `icon` | `ReactNode` | - | Icône personnalisée (remplace l'icône par défaut) |
| `dismissible` | `boolean` | `false` | Afficher un bouton de fermeture |
| `onDismiss` | `() => void` | - | Callback appelé lors du clic sur le bouton fermer |
| `className` | `string` | - | Classes CSS additionnelles |

## Variants

### Error (Rouge)
- **Utilisation** : Erreurs, échecs d'opération, validation échouée
- **Style** : Bordure rouge, fond rouge clair
- **Icône** : Cercle avec point d'exclamation
- **Accessibilité** : `role="alert"` pour lecture immédiate

### Warning (Jaune)
- **Utilisation** : Avertissements, actions nécessitant attention, maintenance
- **Style** : Bordure jaune, fond jaune clair
- **Icône** : Triangle avec point d'exclamation
- **Accessibilité** : `aria-live="polite"`

### Info (Bleu)
- **Utilisation** : Informations générales, nouvelles fonctionnalités, aide
- **Style** : Bordure bleue, fond bleu clair
- **Icône** : Cercle avec "i"
- **Accessibilité** : `aria-live="polite"`

### Success (Vert)
- **Utilisation** : Confirmation d'action, opération réussie
- **Style** : Bordure verte, fond vert clair
- **Icône** : Cercle avec check
- **Accessibilité** : `aria-live="polite"`

## Exemples

### 1. Message d'erreur simple

```tsx
<ErrorBanner
  variant="error"
  message="Impossible de se connecter au serveur. Veuillez réessayer."
/>
```

### 2. Message avec titre

```tsx
<ErrorBanner
  variant="error"
  title="Erreur de validation"
  message="Veuillez corriger les erreurs ci-dessous avant de continuer."
/>
```

### 3. Message de succès avec bouton fermer

```tsx
const [showSuccess, setShowSuccess] = useState(true);

{showSuccess && (
  <ErrorBanner
    variant="success"
    title="Opération réussie"
    message="Vos modifications ont été enregistrées avec succès."
    dismissible
    onDismiss={() => setShowSuccess(false)}
  />
)}
```

### 4. Avertissement de maintenance

```tsx
<ErrorBanner
  variant="warning"
  title="Maintenance programmée"
  message="Une maintenance est prévue le 15 janvier de 2h à 4h. Certaines fonctionnalités seront indisponibles."
  dismissible
  onDismiss={handleDismiss}
/>
```

### 5. Information contextuelle

```tsx
<ErrorBanner
  variant="info"
  message="Nouvelle fonctionnalité disponible ! Vous pouvez maintenant exporter vos données en PDF."
/>
```

### 6. Erreur de formulaire

```tsx
function MyForm() {
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (data: FormData) => {
    try {
      await submitForm(data);
      setFormError(null);
    } catch (error) {
      setFormError("Une erreur est survenue lors de la soumission du formulaire.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {formError && (
        <ErrorBanner
          variant="error"
          message={formError}
          dismissible
          onDismiss={() => setFormError(null)}
          className="mb-4"
        />
      )}
      {/* Champs du formulaire */}
    </form>
  );
}
```

### 7. Icône personnalisée

```tsx
import { ShieldExclamationIcon } from '@patternfly/react-icons';

<ErrorBanner
  variant="warning"
  title="Action sensible"
  message="Cette action nécessite des privilèges administrateur."
  icon={<ShieldExclamationIcon className="h-5 w-5" />}
/>
```

### 8. Message de stock faible

```tsx
<ErrorBanner
  variant="warning"
  title="Stock bas"
  message="Il ne reste que 3 unités en stock. Pensez à réapprovisionner."
/>
```

## Bonnes pratiques

### Messages clairs et concis

✅ **À faire** :
```tsx
<ErrorBanner
  variant="error"
  message="Email ou mot de passe incorrect."
/>
```

❌ **À éviter** :
```tsx
<ErrorBanner
  variant="error"
  message="Une erreur s'est produite. Code d'erreur : ERR_AUTH_FAILED_401"
/>
```

### Utilisation du titre

Le titre est optionnel mais recommandé pour :
- Les messages longs qui nécessitent un contexte
- Les messages qui contiennent plusieurs informations
- Les alertes importantes qui nécessitent une hiérarchie visuelle

```tsx
// Avec titre pour un message structuré
<ErrorBanner
  variant="error"
  title="Échec de la connexion"
  message="Votre session a expiré. Veuillez vous reconnecter pour continuer."
/>

// Sans titre pour un message simple
<ErrorBanner
  variant="info"
  message="Aucun résultat trouvé pour votre recherche."
/>
```

### Gestion de la fermeture

Lorsque `dismissible` est activé, assurez-vous de gérer correctement l'état :

```tsx
const [alerts, setAlerts] = useState([
  { id: 1, message: "Première alerte" },
  { id: 2, message: "Deuxième alerte" }
]);

const removeAlert = (id: number) => {
  setAlerts(alerts.filter(alert => alert.id !== id));
};

return (
  <>
    {alerts.map(alert => (
      <ErrorBanner
        key={alert.id}
        variant="warning"
        message={alert.message}
        dismissible
        onDismiss={() => removeAlert(alert.id)}
        className="mb-3"
      />
    ))}
  </>
);
```

### Positionnement

- **En haut de formulaire** : Pour les erreurs de validation globales
- **En haut de page** : Pour les messages système
- **Contextuellement** : Près de la section concernée par le message

```tsx
// En haut de page
<PageHeader title="Tableau de bord" />
{systemError && (
  <ErrorBanner variant="error" message={systemError} className="mb-6" />
)}

// En haut de formulaire
<form>
  {formError && (
    <ErrorBanner variant="error" message={formError} className="mb-4" />
  )}
  {/* Champs... */}
</form>
```

## Accessibilité

Le composant `ErrorBanner` est conçu avec l'accessibilité en tête :

### ARIA Attributes

- **Error variant** : Utilise `role="alert"` pour annoncer immédiatement le message aux lecteurs d'écran
- **Autres variants** : Utilisent `aria-live="polite"` pour annoncer le message sans interrompre l'utilisateur

### Bouton de fermeture

Le bouton de fermeture inclut :
- `aria-label="Fermer le message"` pour les lecteurs d'écran
- Focus ring visible pour la navigation au clavier
- Zone de clic suffisamment grande (44x44px minimum)

### Couleurs et contraste

Tous les variants respectent les ratios de contraste WCAG AA :
- Texte sur fond : Ratio minimum 4.5:1
- Icônes : Utilisation de couleurs contrastées

### Bonnes pratiques accessibilité

```tsx
// ✅ Message d'erreur critique
<ErrorBanner
  variant="error"  // role="alert" automatique
  message="Votre paiement a échoué."
/>

// ✅ Information non critique
<ErrorBanner
  variant="info"  // aria-live="polite" automatique
  message="Vous avez reçu un nouveau message."
/>

// ✅ Bouton fermer accessible
<ErrorBanner
  variant="warning"
  message="Session expirée dans 5 minutes."
  dismissible  // Bouton avec aria-label
  onDismiss={handleDismiss}
/>
```

## Styling

Le composant utilise les Design Tokens pour garantir la cohérence :

- **Bordures** : `border-l-4` avec couleurs variant-specific
- **Padding** : `p-4` pour un espacement confortable
- **Espacement interne** : `gap-3` entre icône, contenu et bouton
- **Border radius** : `rounded-lg` pour des coins arrondis

Pour personnaliser l'apparence, utilisez la prop `className` :

```tsx
<ErrorBanner
  variant="error"
  message="Erreur critique"
  className="mb-6 shadow-lg"  // Personnalisation
/>
```

## Notes techniques

- Les icônes SVG sont inline pour éviter les dépendances externes
- Le composant est fully typed avec TypeScript
- Compatible avec les Design Tokens du projet
- Supporte le dark mode (à implémenter si nécessaire)

## Voir aussi

- [FormInput](./FormInput.md) - Pour les erreurs de champs individuels
- [Modal](./Modal.md) - Pour les dialogues de confirmation
- [EmptyState](./EmptyState.md) - Pour les états vides avec messages
- [Badge](./Badge.md) - Pour les indicateurs de statut inline