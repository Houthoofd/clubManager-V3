# 📚 Shared Utils - Documentation

Bibliothèque d'utilitaires partagés pour ClubManager V3.

Ces utilitaires éliminent la duplication de code et garantissent la cohérence dans toute l'application.

---

## 📦 Installation

Les utilitaires sont déjà disponibles dans le projet. Il suffit de les importer :

```typescript
import { formatDate, formatCurrency, getErrorMessage } from '@/shared/utils';
```

---

## 🎨 Formatters

### Dates & Heures

```typescript
import { formatDate, formatDateTime, formatTime, formatDuration } from '@/shared/utils';

// Dates
formatDate("2024-03-15")           // "15/03/2024"
formatDate(new Date())             // "15/03/2024"
formatDate(null)                   // "-"

// Date + Heure
formatDateTime("2024-03-15T14:30") // "15/03/2024 14:30"

// Heures
formatTime("14:30:00")             // "14:30"
formatTime("09:05")                // "09:05"

// Durées
formatDuration(90)                 // "1h 30min"
formatDuration(45)                 // "45min"
formatDuration(120)                // "2h"

// Dates relatives
formatRelativeDate(new Date())     // "Aujourd'hui"
formatRelativeDate(yesterday)      // "Hier"
formatRelativeDate("2024-01-01")   // "01/01/2024"
```

### Nombres & Monnaie

```typescript
import { formatCurrency, formatNumber, formatPercentage } from '@/shared/utils';

// Monnaie
formatCurrency(1234.56)            // "1 234,56 €"
formatCurrency(1000)               // "1 000,00 €"
formatCurrency(1234.567, 3)        // "1 234,567 €"

// Nombres
formatNumber(1234567)              // "1 234 567"
formatNumber(1234.56, 2)           // "1 234,56"

// Pourcentages
formatPercentage(0.75)             // "75%"
formatPercentage(0.3333, 1)        // "33,3%"

// Nombres compacts
formatCompactNumber(1234)          // "1,2K"
formatCompactNumber(1234567)       // "1,2M"
formatCompactNumber(1234567890)    // "1,2B"
```

### Texte & Identité

```typescript
import { formatFullName, formatInitials, truncate, capitalize } from '@/shared/utils';

// Noms
formatFullName("Jean", "Dupont")   // "Jean Dupont"
formatFullName("Marie", null)      // "Marie"

// Initiales
formatInitials("Jean", "Dupont")   // "J.D."

// Troncature
truncate("Lorem ipsum dolor sit", 10)  // "Lorem ipsu..."

// Capitalisation
capitalize("bonjour")              // "Bonjour"
capitalize("BONJOUR")              // "Bonjour"
```

### Contact

```typescript
import { formatPhone, formatEmail } from '@/shared/utils';

// Téléphone
formatPhone("0612345678")          // "06 12 34 56 78"
formatPhone("+33612345678")        // "+33 6 12 34 56 78"

// Email
formatEmail("Jean.DUPONT@Example.COM")  // "jean.dupont@example.com"
```

### Autres

```typescript
import { formatFileSize, formatGender, formatRole, formatAge } from '@/shared/utils';

// Taille fichier
formatFileSize(1024)               // "1.00 KB"
formatFileSize(1048576)            // "1.00 MB"

// Genre
formatGender(1)                    // "Homme"
formatGender(2)                    // "Femme"

// Rôle
formatRole("admin")                // "Administrateur"
formatRole("member")               // "Membre"

// Âge
formatAge("2000-01-01")            // "24 ans"
calculateAge("2000-01-01")         // 24
```

---

## 🚨 Errors

### Extraction de messages

```typescript
import { getErrorMessage, getErrorCode, getErrorStatus } from '@/shared/utils';

try {
  await api.createUser(data);
} catch (error) {
  const message = getErrorMessage(error);
  // "Email déjà utilisé" ou "Une erreur inattendue s'est produite."
  
  const code = getErrorCode(error);      // "DUPLICATE_EMAIL" ou null
  const status = getErrorStatus(error);  // 400 ou null
}
```

### Détection type d'erreur

```typescript
import { 
  getErrorType, 
  isNetworkError, 
  isAuthenticationError,
  isValidationError 
} from '@/shared/utils';

try {
  await api.getData();
} catch (error) {
  if (isNetworkError(error)) {
    toast.error("Problème de connexion");
  } else if (isAuthenticationError(error)) {
    navigate('/login');
  } else if (isValidationError(error)) {
    // Afficher erreurs de validation
  }
}
```

### Formatage messages

```typescript
import { formatErrorMessage, formatContextualError } from '@/shared/utils';

// Message formaté pour l'utilisateur
const userMessage = formatErrorMessage(error);
// Au lieu de "ERR_NETWORK" → "Impossible de se connecter au serveur."

// Message avec contexte
const contextMessage = formatContextualError(error, "la création de l'utilisateur");
// "Erreur lors de la création de l'utilisateur : Session expirée."
```

### Erreurs de validation

```typescript
import { getValidationErrors, formatValidationErrors } from '@/shared/utils';

try {
  await api.createUser(data);
} catch (error) {
  const validationErrors = getValidationErrors(error);
  // { email: ["L'email est invalide"], password: ["Trop court"] }
  
  const formatted = formatValidationErrors(validationErrors);
  // "• Email : L'email est invalide\n• Password : Trop court"
}
```

### Logging

```typescript
import { logError } from '@/shared/utils';

try {
  await api.createUser(data);
} catch (error) {
  logError(error, "Création utilisateur");
  // Log détaillé en développement uniquement
}
```

---

## ✅ Validators

### Email & Contact

```typescript
import { isValidEmail, isValidPhone, isValidUrl } from '@/shared/utils';

isValidEmail("user@example.com")   // true
isValidEmail("invalid")            // false

isValidPhone("0612345678")         // true
isValidPhone("+33612345678")       // true

isValidUrl("https://example.com")  // true
```

### Mot de passe

```typescript
import { 
  isStrongPassword, 
  hasMinLength, 
  hasLowerCase,
  hasUpperCase,
  hasNumber,
  hasSpecialChar 
} from '@/shared/utils';

isStrongPassword("Test123!")       // true
isStrongPassword("weak")           // false

// Validations individuelles
hasMinLength("password", 8)        // true
hasLowerCase("Password")           // true
hasUpperCase("Password")           // true
hasNumber("Password123")           // true
hasSpecialChar("Password!")        // true
```

### Dates

```typescript
import { 
  isValidDate, 
  isFutureDate, 
  isPastDate,
  isAdult,
  isMinor 
} from '@/shared/utils';

isValidDate("2024-03-15")          // true
isValidDate("invalid")             // false

isFutureDate("2025-01-01")         // true
isPastDate("2020-01-01")           // true

isAdult("2000-01-01")              // true
isMinor("2010-01-01")              // true
```

### Nombres

```typescript
import { 
  isValidNumber, 
  isPositive, 
  isInRange,
  isInteger 
} from '@/shared/utils';

isValidNumber(123)                 // true
isValidNumber("abc")               // false

isPositive(5)                      // true
isPositive(-5)                     // false

isInRange(15, 10, 20)              // true
isInRange(25, 10, 20)              // false

isInteger(5)                       // true
isInteger(5.5)                     // false
```

### Texte

```typescript
import { 
  isNotEmpty, 
  hasMinTextLength,
  isAlphabetic,
  isAlphanumeric 
} from '@/shared/utils';

isNotEmpty("  test  ")             // true
isNotEmpty("   ")                  // false

hasMinTextLength("hello", 3)       // true
hasMinTextLength("hi", 3)          // false

isAlphabetic("Jean-Marie")         // true
isAlphabetic("Jean123")            // false

isAlphanumeric("User123")          // true
```

### Identifiants français

```typescript
import { 
  isValidPostalCode, 
  isValidSiret,
  isValidIban 
} from '@/shared/utils';

isValidPostalCode("75001")         // true
isValidSiret("12345678901234")     // true (si Luhn OK)
isValidIban("FR76...")             // true (si valide)
```

### Fichiers

```typescript
import { 
  isValidFileExtension, 
  isValidFileSize,
  isImageFile,
  isPdfFile 
} from '@/shared/utils';

isValidFileExtension("photo.jpg", [".jpg", ".png"])  // true
isValidFileSize(2048000, 5)                          // true (2 Mo < 5 Mo)

isImageFile("photo.jpg")           // true
isPdfFile("document.pdf")          // true
```

---

## 🛠️ Helpers

### Manipulation de tableaux

```typescript
import { 
  removeDuplicates, 
  chunk, 
  shuffle,
  groupBy,
  sortBy 
} from '@/shared/utils';

// Supprimer doublons
removeDuplicates([1, 2, 2, 3, 4, 4, 5])
// [1, 2, 3, 4, 5]

removeDuplicatesByKey([{id: 1}, {id: 2}, {id: 1}], 'id')
// [{id: 1}, {id: 2}]

// Découper en chunks
chunk([1, 2, 3, 4, 5], 2)
// [[1, 2], [3, 4], [5]]

// Mélanger
shuffle([1, 2, 3, 4, 5])
// [3, 1, 5, 2, 4]

// Grouper
groupBy([{type: 'a', val: 1}, {type: 'b', val: 2}], 'type')
// { a: [{type: 'a', val: 1}], b: [{type: 'b', val: 2}] }

// Trier
sortBy([{age: 30}, {age: 20}, {age: 25}], 'age', 'asc')
// [{age: 20}, {age: 25}, {age: 30}]
```

### Manipulation d'objets

```typescript
import { removeEmpty, pick, omit, isEmpty, deepClone } from '@/shared/utils';

// Supprimer valeurs null/undefined
removeEmpty({a: 1, b: null, c: undefined, d: 2})
// {a: 1, d: 2}

// Sélectionner propriétés
pick({a: 1, b: 2, c: 3}, ['a', 'c'])
// {a: 1, c: 3}

// Exclure propriétés
omit({a: 1, b: 2, c: 3}, ['b'])
// {a: 1, c: 3}

// Vérifier si vide
isEmpty({})                        // true
isEmpty({a: 1})                    // false

// Clone profond
const clone = deepClone({a: {b: 1}})
```

### Classes CSS

```typescript
import { cn, classNames } from '@/shared/utils';

// Combiner classes
cn('btn', 'btn-primary')
// "btn btn-primary"

// Conditionnel
cn('btn', { active: true, disabled: false })
// "btn active"

// Combiné
cn('btn', 'btn-primary', { active: isActive }, isDisabled && 'opacity-50')
```

### Debounce & Throttle

```typescript
import { debounce, throttle } from '@/shared/utils';

// Debounce
const search = debounce((query) => api.search(query), 300);
search('test'); // Exécuté 300ms après le dernier appel

// Throttle
const onScroll = throttle(() => console.log('scroll'), 100);
window.addEventListener('scroll', onScroll);
```

### Génération

```typescript
import { generateId, generateColor, getInitials } from '@/shared/utils';

generateId()                       // "abc123def456"
generateColor()                    // "#3A7BD5"
getInitials("Jean Dupont")         // "JD"
```

### Attente & Retry

```typescript
import { sleep, retry } from '@/shared/utils';

// Attendre
await sleep(1000);  // Attend 1 seconde

// Réessayer
const data = await retry(() => api.fetchData(), 3, 1000);
// Réessaye 3 fois avec 1s de délai
```

### Divers

```typescript
import { 
  copyToClipboard, 
  downloadFile,
  scrollToElement,
  average,
  clamp 
} from '@/shared/utils';

// Copier texte
await copyToClipboard("Hello World");

// Télécharger fichier
downloadFile("Hello World", "hello.txt", "text/plain");

// Scroll vers élément
scrollToElement("section-1", 'smooth');

// Calculs
average([1, 2, 3, 4, 5])           // 3
clamp(15, 0, 10)                   // 10 (limité à max)
```

---

## 📖 Exemples d'Utilisation

### Exemple 1 : Formulaire de connexion

```typescript
import { 
  isValidEmail, 
  getErrorMessage, 
  formatErrorMessage 
} from '@/shared/utils';

function LoginForm() {
  const onSubmit = async (data) => {
    // Validation
    if (!isValidEmail(data.email)) {
      setError("Email invalide");
      return;
    }

    try {
      await login(data);
    } catch (error) {
      // Gestion d'erreur
      const message = formatErrorMessage(error);
      toast.error(message);
    }
  };
}
```

### Exemple 2 : Affichage de données

```typescript
import { 
  formatDate, 
  formatCurrency, 
  formatFullName 
} from '@/shared/utils';

function UserCard({ user }) {
  return (
    <div>
      <h3>{formatFullName(user.firstName, user.lastName)}</h3>
      <p>Membre depuis: {formatDate(user.createdAt)}</p>
      <p>Solde: {formatCurrency(user.balance)}</p>
    </div>
  );
}
```

### Exemple 3 : Recherche avec debounce

```typescript
import { debounce } from '@/shared/utils';

function SearchInput() {
  const debouncedSearch = useMemo(
    () => debounce((query) => api.search(query), 300),
    []
  );

  return (
    <input 
      onChange={(e) => debouncedSearch(e.target.value)} 
    />
  );
}
```

---

## 🚀 Migration depuis Code Existant

### Avant (code dupliqué)

```typescript
// Dans chaque page...
function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR"
  });
}

function getErrorMessage(error: unknown): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return "Une erreur s'est produite";
}
```

### Après (utils partagés)

```typescript
import { formatCurrency, getErrorMessage } from '@/shared/utils';

// C'est tout ! Pas de duplication.
```

---

## 📝 Conventions

### Nommage

- **`format*`** : Formate une donnée pour l'affichage
- **`is*`** : Validation booléenne
- **`has*`** : Vérification de présence
- **`get*`** : Extraction de donnée
- **`calculate*`** : Calcul de valeur

### Retours

- **Formatters** : Retournent toujours une string (jamais null)
- **Validators** : Retournent toujours un boolean
- **Helpers** : Peuvent retourner n'importe quel type

### Gestion des valeurs nulles

Toutes les fonctions gèrent `null` et `undefined` gracieusement :

```typescript
formatDate(null)        // "-"
isValidEmail(null)      // false
getErrorMessage(null)   // "Une erreur inattendue s'est produite."
```

---

## 🎯 Avantages

✅ **DRY** : Pas de duplication de code  
✅ **Cohérence** : Même formatage partout  
✅ **Testabilité** : Fonctions pures, faciles à tester  
✅ **Maintenabilité** : Un seul endroit à modifier  
✅ **Type-safe** : TypeScript avec types complets  
✅ **Documentation** : JSDoc sur toutes les fonctions  

---

## 📚 Ressources

- **Code source** : `src/shared/utils/`
- **Tests** : `src/shared/utils/__tests__/` (à venir)
- **Exemples** : Ce README

---

**Dernière mise à jour** : 2024