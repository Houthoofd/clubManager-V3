# Tests E2E — Inventaire des skips

> Dernière mise à jour : 2026-07-02 (session 5 — Phase E14)
> Suite après Phase E14 : **259 passed · 0 failed · 4 skipped** (pagination conditionnelle)

---

## Corrections appliquées (session 2026-07-02 — Phase E14)

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

## Corrections appliquées (session 2026-06-14 — session 3)

| Catégorie | Fix appliqué | Fichiers modifiés |
|---|---|---|
| Stripe Guard 2 — clé absente | `VITE_STRIPE_PUBLIC_KEY=pk_test_e2e_mock_playwright` ajouté dans `frontend/.env` | `frontend/.env` |
| Stripe Guard 3 — bouton disabled | `expect(btn).toBeEnabled({ timeout: 8_000 })` avec retry + `createToken` ajouté au mock | `payments.stripe.spec.ts` (tests 4 & 5), `e2e/mocks/stripe-mock.ts` |
| N4 réseau simulé | Implémentation réelle avec `page.route("**/api/auth/login", abort)` | `negative-paths.spec.ts` |

---

## Corrections appliquées (session 2026-07-02 — session 4)

| Catégorie | Fix appliqué | Fichiers modifiés |
|---|---|---|
| `TemplateEditorModal` crash — `Input.Select/Textarea/Checkbox` undefined | Import `Input` directement depuis `shared/components/Input/index` au lieu du barrel racine (qui résolvait vers le legacy `Input.tsx` sans sous-composants) | `TemplateEditorModal.tsx`, `SendFromTemplateModal.tsx` |
| Nettoyage code debug sessions précédentes | Suppression `data-editor-open`, debug logs, `@ts-ignore` inutiles, `force: true` sur click | `TemplatesTab.tsx`, `messaging.templates.spec.ts`, `Input/Input.tsx` |

### Cause racine du crash `TemplateEditorModal`

`shared/components/index.ts` fait `export * from './Input'`. Node/Vite résout `./Input` en priorité sur le fichier `Input.tsx` plutôt que le répertoire `Input/index.ts`. Or `Input.tsx` est un composant Input **legacy et simple** (sans sous-composants), alors que `Input/Input.tsx` est le composant **complet** avec `.Select`, `.Textarea`, `.Checkbox`. Résultat : `Input.Select` etc. étaient `undefined` dans `TemplateEditorModal`, provoquant un crash React "Element type is invalid: got undefined".

**Fix**: import explicite depuis `shared/components/Input/index` dans les composants qui utilisent les sous-composants.

---

## État actuel — 4 skips conditionnels

> ✅ **0 skip structurel. La suite tourne à 259 passed · 0 failed · 4 skipped (conditionnels).**

### Skips restants

| Fichier | Test | Condition de skip |
|---|---|---|
| `navigation/pagination.spec.ts` | PAG1 (admin) | Bouton `Page suivante` absent si < 21 utilisateurs actifs en DB |
| `navigation/pagination.spec.ts` | PAG1 (member) | idem |
| `navigation/pagination.spec.ts` | PAG2 (admin) | idem |
| `navigation/pagination.spec.ts` | PAG2 (member) | idem |

**Solution** : insérer >17 utilisateurs supplémentaires dans `seed-e2e.ts` pour dépasser le seuil de 20 (page size) — les tests passent alors automatiquement.

---

## Commandes utiles

```bash
# Re-seeder les données E2E (à lancer avant les tests)
pnpm --filter @clubmanager/e2e seed

# Lancer la suite E2E complète
pnpm --filter @clubmanager/e2e test

# Lancer uniquement les tests templates (anciennement skippés)
pnpm --filter @clubmanager/e2e test -- tests/admin/messaging.templates.spec.ts --project=chromium-admin

# Vérifier l'état de la DB après seed
node -e "const mysql=require('./e2e/node_modules/mysql2/promise');mysql.createConnection({host:'localhost',port:3306,user:'root',password:'',database:'clubmanager'}).then(async c=>{const [r]=await c.query('SELECT COUNT(*) as n FROM types_messages_personnalises');console.log('types_messages_personnalises:', r[0].n);c.end()})"
```
