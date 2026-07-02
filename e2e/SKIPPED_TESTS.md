# Tests E2E — Inventaire des skips

> Dernière mise à jour : 2026-07-02 (session 6 — Phase E14 finalisée)
> **Suite finale : 263 passed · 0 failed · 0 skipped ✅**

---

## 🏆 Objectif atteint — Pyramide 100% verte

Toutes les phases E1 → E14 sont vertes. Aucun test n'est skippé, aucun n'est en échec.

---

## Corrections appliquées (session 2026-07-02 — Phase E14 finalisation)

| Catégorie | Fix appliqué | Fichiers modifiés |
|---|---|---|
| PAG1/PAG2 — 4 skips conditionnels | Seed de 20 utilisateurs `U-9998-0001..0020` (`ON DUPLICATE KEY UPDATE deleted_at = NULL`) → seuil de 20 dépassé, bouton Page suivante disponible | `e2e/setup/seed-e2e.ts` |

---

## Corrections appliquées (session 2026-07-02 — session 5 — Phase E14)

| Catégorie | Fix appliqué | Fichiers modifiés |
|---|---|---|
| N5 — Force MDP faible | Test `register-password-input` + blur + `getByText("Faible")` | `negative-paths.spec.ts` |
| N6 — Email invalide | `emailInput.press("Tab")` + `p[role="alert"]` (FormField) | `negative-paths.spec.ts` |
| N7 — API 500 | Utilisation `browser.newContext()` ; assertion : pas de redirect `/login` | `negative-paths.spec.ts` |
| SE1 — Session expiry | `page.evaluate` pour effacer `auth-storage` localStorage ; ProtectedRoute redirige | `session-expiry.spec.ts` (nouveau) |
| SE2 — Contrôle session valide | Auth présente → page /users chargée | `session-expiry.spec.ts` (nouveau) |
| PAG1/PAG2 — Pagination | Navigation page 2 → contenu différent ; retour page 1 → contenu identique | `pagination.spec.ts` (nouveau) |
| Notifications flakiness | `DELETE FROM notifications` + `waitForResponse(DELETE)` pour stabiliser | `notifications.spec.ts` |

---

## Corrections appliquées (session 2026-06-14 — session 4)

| Catégorie | Fix appliqué | Fichiers modifiés |
|---|---|---|
| `TemplateEditorModal` crash — `Input.Select/Textarea/Checkbox` undefined | Import `Input` directement depuis `shared/components/Input/index` au lieu du barrel racine (qui résolvait vers le legacy `Input.tsx` sans sous-composants) | `TemplateEditorModal.tsx`, `SendFromTemplateModal.tsx` |
| Nettoyage code debug sessions précédentes | Suppression `data-editor-open`, debug logs, `@ts-ignore` inutiles, `force: true` sur click | `TemplatesTab.tsx`, `messaging.templates.spec.ts`, `Input/Input.tsx` |

### Cause racine du crash `TemplateEditorModal`

`shared/components/index.ts` fait `export * from './Input'`. Node/Vite résout `./Input` en priorité sur le fichier `Input.tsx` plutôt que le répertoire `Input/index.ts`. Or `Input.tsx` est un composant Input **legacy et simple** (sans sous-composants), alors que `Input/Input.tsx` est le composant **complet** avec `.Select`, `.Textarea`, `.Checkbox`. Résultat : `Input.Select` etc. étaient `undefined` dans `TemplateEditorModal`, provoquant un crash React "Element type is invalid: got undefined".

**Fix** : import explicite depuis `shared/components/Input/index` dans les composants qui utilisent les sous-composants.

---

## Corrections appliquées (session 2026-06-14 — session 3)

| Catégorie | Fix appliqué | Fichiers modifiés |
|---|---|---|
| Stripe Guard 2 — clé absente | `VITE_STRIPE_PUBLIC_KEY=pk_test_e2e_mock_playwright` ajouté dans `frontend/.env` | `frontend/.env` |
| Stripe Guard 3 — bouton disabled | `expect(btn).toBeEnabled({ timeout: 8_000 })` avec retry + `createToken` ajouté au mock | `payments.stripe.spec.ts` (tests 4 & 5), `e2e/mocks/stripe-mock.ts` |
| N4 réseau simulé | Implémentation réelle avec `page.route("**/api/auth/login", abort)` | `negative-paths.spec.ts` |

---

## Corrections appliquées (session 2026-06-14 — session 2)

| Catégorie | Fix appliqué | Fichiers modifiés |
|---|---|---|
| `types_cours` vides | `INSERT IGNORE INTO types_cours` ajouté dans `seed-e2e.ts` | `seed-e2e.ts` |
| Commandes statut terminal | `ON DUPLICATE KEY UPDATE statut = 'en_attente'` | `seed-e2e.ts` |
| Session révocation | Insertion d'un 2e refresh token dans `seed-e2e.ts` (section 5) | `seed-e2e.ts` |
| Notifications pagination | `DELETE FROM notifications` avant insertion dans les tests | `notifications.spec.ts`, `notifications.filters.spec.ts` |
| `delete-all-btn` | Nettoyage + `waitForResponse` + `waitFor` au lieu de `isVisible` | `notifications.filters.spec.ts` |
| Store pagination | `DELETE FROM articles WHERE nom LIKE 'Article Panier%'` avant insert | `store.member.spec.ts` |
| `btn-notify-bulk` timing | Attendre `user-menu-trigger` + `waitFor` au lieu de `isVisible` | `users.actions.spec.ts` |
| Onglet Archivés | `waitFor` + `[data-testid="tab-archived"]` au lieu de `#tab-archived` | `messaging.spec.ts` |
| Templates modal | `waitFor({ state: "visible" })` au lieu de `isVisible` | `messaging.templates.spec.ts` |
| Register submit btn | `waitFor({ state: "visible" })` au lieu de `isVisible` | `negative-paths.spec.ts` |

---

## État actuel — Aucun skip ✅

> **263 passed · 0 failed · 0 skipped** — pyramide 100% verte.

Tous les scénarios fonctionnels sont couverts. Les seuls tests hors scope restants (jamais dans la cible) sont :

| Catégorie | Raison |
|---|---|
| Accessibilité (WCAG / axe-core) | Outils dédiés requis (axe-playwright, pa11y) |
| Performance (LCP, TTFB) | k6, Lighthouse requis |
| Multi-navigateurs (Firefox, Safari) | Playwright multi-projet possible mais non planifié |
| Webhooks Stripe réels | Nécessite `stripe listen` CLI en CI |
| Tests de charge / sécurité | Outils spécialisés (OWASP ZAP, k6, etc.) |

---

## Commandes utiles

```bash
# Re-seeder les données E2E (obligatoire après reset DB)
pnpm --filter @clubmanager/e2e seed

# Lancer la suite E2E complète (résultat attendu : 263 passed, 0 failed, 0 skipped)
pnpm --filter @clubmanager/e2e test

# Lancer un fichier spécifique
pnpm --filter @clubmanager/e2e test -- tests/auth/session-expiry.spec.ts
pnpm --filter @clubmanager/e2e test -- tests/navigation/pagination.spec.ts --project=chromium-admin

# Mode UI interactif
pnpm --filter @clubmanager/e2e exec playwright test --ui
```
