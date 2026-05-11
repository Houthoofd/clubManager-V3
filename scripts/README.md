# @clubmanager/test-generator

Générateur de stubs de tests unitaires pour projets Clean Architecture (TypeScript / Jest / Vitest).

> **Statut actuel :** intégré directement dans ClubManager V3 (`scripts/`).
> **Roadmap :** extraction en package npm autonome.

---

## Architecture

```
scripts/
├── generate-tests.mjs           ← CLI entry point (reste dans le projet)
├── generate-tests.config.mjs    ← Config projet-specific (reste dans le projet)
├── package.json
│
└── core/                        ← Futur package npm
    ├── index.mjs                ← API publique : export { generateTests }
    ├── engine.mjs               ← Orchestrateur
    ├── types.mjs                ← Contrats JSDoc
    ├── cli.mjs                  ← Parse process.argv
    ├── logger.mjs               ← Output coloré ANSI
    ├── fs-utils.mjs             ← ensureDir / writeFileSafe / fileExists
    ├── parsers/
    │   ├── use-case-parser.mjs  ← AST → UseCaseInfo
    │   ├── interface-parser.mjs ← AST → InterfaceInfo
    │   ├── component-parser.mjs ← AST → ComponentInfo
    │   └── hook-parser.mjs      ← AST → HookInfo
    ├── scanners/
    │   ├── backend-scanner.mjs  ← Walk modules/**/use-cases/
    │   └── frontend-scanner.mjs ← Walk features/**/components/ + hooks/
    ├── generators/
    │   ├── backend-generator.mjs
    │   └── frontend-generator.mjs
    └── templates/
        ├── backend-use-case.mjs    ← fn(ctx) → string (Jest)
        ├── frontend-component.mjs  ← fn(ctx) → string (Vitest + RTL)
        └── frontend-hook.mjs       ← fn(ctx) → string (Vitest + renderHook)
```

---

## Usage

### Commandes npm (depuis la racine du projet)

```bash
# Générer tous les stubs (backend + frontend)
pnpm generate:tests

# Prévisualiser sans écrire
pnpm generate:tests:dry

# Backend uniquement (Sprint 1 — use-cases)
pnpm generate:tests:backend

# Frontend uniquement (Sprint 2 — composants + hooks)
pnpm generate:tests:frontend
```

### Commande directe avec options

```bash
node scripts/generate-tests.mjs [options]
```

### Options disponibles

| Option | Valeurs | Défaut | Description |
|---|---|---|---|
| `--workspace` | `backend` \| `frontend` \| `all` | `all` | Workspace cible |
| `--module` | nom du module | — | Filtre sur un seul module (ex: `alerts`) |
| `--sprint` | `1` \| `2` \| `all` | `all` | Sprint de tests (1=use-cases, 2=composants) |
| `--dry-run` | — | `false` | Simule sans écrire les fichiers |
| `--force` | — | `false` | Écrase les fichiers existants |
| `--verbose` | — | `false` | Logs détaillés (parsing AST) |
| `--help` | — | — | Affiche l'aide |

### Exemples

```bash
# Générer uniquement les tests du module alerts
node scripts/generate-tests.mjs --module=alerts

# Tester ce que le générateur produirait sans rien écrire
node scripts/generate-tests.mjs --dry-run --verbose

# Régénérer en forçant l'écrasement (utile après refactoring)
node scripts/generate-tests.mjs --module=notifications --force

# Sprint 1 uniquement (use-cases backend)
node scripts/generate-tests.mjs --workspace=backend --sprint=1
```

---

## Ce que le générateur produit

### Backend — Use-Cases (Sprint 1)

Pour chaque fichier `*UseCase.ts` dans `modules/*/application/use-cases/` :

- Crée `__tests__/<UseCaseName>.test.ts` co-localisé
- Mock typé `jest.Mocked<IXxxRepository>` avec toutes les méthodes
- 2 tests stubs (cas nominal + cas d'erreur) avec commentaires `// TODO:`
- Les `expect(true).toBe(true)` garantissent que les tests passent immédiatement

**Exemple de fichier généré :**
```typescript
// modules/alerts/application/use-cases/__tests__/CreateAlertTypeUseCase.test.ts
import { CreateAlertTypeUseCase } from '../CreateAlertTypeUseCase';
import type { IAlertRepository } from '../../../domain/repositories/IAlertRepository';

const mockRepo: jest.Mocked<IAlertRepository> = {
  findAllAlertTypes:   jest.fn(),
  createAlertType:     jest.fn(),
  // ...toutes les méthodes
} as jest.Mocked<IAlertRepository>;

let useCase: CreateAlertTypeUseCase;
beforeEach(() => { useCase = new CreateAlertTypeUseCase(mockRepo); });

describe('CreateAlertTypeUseCase', () => {
  describe('execute', () => {
    it('devrait retourner le résultat quand les données sont valides', async () => {
      // TODO: configurer mock + appeler useCase.execute(...)
      expect(true).toBe(true);
    });
    it('devrait lancer une erreur si le repository échoue', async () => {
      // TODO: mockRepo.xxx.mockRejectedValue(new Error('DB error'))
      expect(true).toBe(true);
    });
  });
});
```

### Frontend — Composants & Hooks (Sprint 2)

Pour chaque composant `.tsx` dans `features/*/components/` et `shared/components/*/` :
- Crée `__tests__/<ComponentName>.test.tsx` avec Vitest + Testing Library

Pour chaque hook `.ts` dans `features/*/hooks/` :
- Crée `__tests__/<hookName>.test.ts` avec Vitest + renderHook + MSW stub

---

## Résumé de sortie

```
─────────────────────────────────────────────
  BACKEND — USE-CASES (SPRINT 1)
─────────────────────────────────────────────
ℹ   142 use-case(s) trouvé(s)
  ✅ CRÉÉ    .../alerts/use-cases/__tests__/CreateAlertTypeUseCase.test.ts
  ✅ CRÉÉ    .../alerts/use-cases/__tests__/DeleteAlertTypeUseCase.test.ts
  ⏭  IGNORÉ  .../auth/use-cases/__tests__/LoginUseCase.test.ts  (already exists)
  ...

─────────────────────────────────────────────
📊 Résumé de génération
─────────────────────────────────────────────
  ✅ Créés    : 138
  ⏭  Ignorés  : 4
  🔍 Dry-run  : 0
  ❌ Erreurs  : 0
  ─────────────
  📁 Total    : 142
─────────────────────────────────────────────
```

---

## Dépendances

| Package | Version | Rôle |
|---|---|---|
| `@typescript-eslint/typescript-estree` | `^8.0.0` | Parsing AST des fichiers TypeScript/TSX |

Aucune autre dépendance externe.

---

## Roadmap — Extraction en package npm

Pour transformer ce générateur en package npm autonome (`@clubmanager/test-generator`) :

1. Copier `scripts/core/` dans un nouveau dépôt
2. Publier sur npm avec le `package.json` existant
3. Dans ClubManager V3, remplacer le `core/` local par :
   ```bash
   pnpm add -D @clubmanager/test-generator
   ```
4. Mettre à jour `generate-tests.mjs` :
   ```javascript
   import { generateTests } from '@clubmanager/test-generator'; // au lieu de './core/engine.mjs'
   ```
5. `generate-tests.config.mjs` reste dans le projet — c'est la config spécifique.

Les templates sont également overridables si nécessaire.
