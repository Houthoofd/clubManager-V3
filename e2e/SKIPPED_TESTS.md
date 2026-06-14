# Tests E2E — Inventaire des skips

> Dernière mise à jour : 2026-06-14  
> Suite : **244 passed · 0 failed · 10 skipped** (run complet)

---

## Résumé par catégorie

| Catégorie | Fichier(s) | Nbre de points de skip | Cause principale |
|---|---|---|---|
| Courses — types_cours vides | `courses.admin.spec.ts`, `enrollment-flow.spec.ts` | 11 + 2 | `types_cours` absents en DB (schéma non appliqué) |
| Templates — bug UI modal | `messaging.templates.spec.ts` | 3 | `TemplateEditorModal` ne s'ouvre pas (composant se démonte) |
| Auth — réseau simulé | `negative-paths.spec.ts` | 1 | Skip intentionnel (feature non implémentée) |
| Auth — bouton de soumission | `negative-paths.spec.ts` | 1 | Bouton absent si page non chargée |
| Notifications — pagination | `notifications.spec.ts` | 1 | Notification insérée absente de la page 1 |
| Notifications — bouton tout-supprimer | `notifications.filters.spec.ts` | 1 | `delete-all-btn` absent si aucune notification visible |
| Messagerie — onglet Archivés | `messaging.spec.ts` | 1 | Onglet `#tab-archived` absent du DOM |
| Paiements — Stripe headless | `payments.stripe.spec.ts` | 6 | Clé Stripe absente OU bouton `disabled` en headless |
| Profil — révocation session | `security.spec.ts` | 1 | Moins de 2 sessions actives pour le membre E2E |
| Store — pagination article | `store.member.spec.ts` | 1 | Article inséré hors page 1 |
| Store — bouton transition commande | `store.admin.spec.ts` | 1 | Aucun bouton de transition dans la modal de commande |

---

## Détail par fichier

---

### `e2e/tests/admin/courses.admin.spec.ts`

**Condition commune à tous les skips :**
```sql
SELECT id, code FROM types_cours LIMIT 1
```
Si la table `types_cours` est vide → skip.

| Ligne | Test | Type |
|---|---|---|
| 135 | `créer un cours récurrent via modal → visible dans le planning` | Conditionnel DB |
| 220 | `modifier un cours récurrent → modifications persistées` | Conditionnel DB |
| 289 | `supprimer un cours récurrent → absent du planning` | Conditionnel DB |
| 501 | `générer des sessions → sessions visibles dans l'onglet Séances` | Conditionnel DB |
| 600 | `ouvrir l'AttendanceModal → liste membres visible` (guard 1) | Conditionnel DB |
| 652 | `ouvrir l'AttendanceModal → liste membres visible` (guard 2) | Conditionnel UI — bouton session absent (pagination) |
| 743 | `AttendanceModal → sauvegarder les présences` (guard 1) | Conditionnel DB |
| 789 | `AttendanceModal → sauvegarder les présences` (guard 2) | Conditionnel UI — bouton attendance absent (pagination) |
| 850 | `créer une réservation (admin) → visible dans la liste` | Conditionnel DB |
| 946 | `annuler une réservation → statut annulée` (guard 1) | Conditionnel DB |
| 994 | `annuler une réservation → statut annulée` (guard 2) | Conditionnel UI — bouton annuler absent (pagination) |

**Correction :** Les données `types_cours` sont déjà insérées par `00_SCHEMA_COMPLET.sql`. Si le schéma est bien appliqué, ces tests ne skippent pas. Vérifier avec :
```sql
SELECT COUNT(*) FROM types_cours;  -- doit être > 0
```

---

### `e2e/tests/admin/messaging.templates.spec.ts`

| Ligne | Test | Type | Cause |
|---|---|---|---|
| ~75 | `créer un template → template visible` | Conditionnel UI | `TemplateEditorModal` ne s'ouvre pas après clic `btn-new-template` — le composant `TemplatesTab` se démonte (bug UI connu) |
| ~150 | `modifier un template → modifications persistées` | Conditionnel UI | Même bug — modal d'édition non visible |
| ~232 | `supprimer un template → absent de la liste` | Conditionnel UI | Pas de réponse DELETE reçue (modal de confirmation possible) |

**Correction à faire :**  
Investiguer pourquoi `activeTab` repasse à `"inbox"` après un clic sur `btn-new-template` dans `TemplatesTab`. Piste : composant `MessagesPage` ou interaction entre `useTemplateStore` et `useMessagingStore`. Voir note dans le fichier de test.

---

### `e2e/tests/admin/users.actions.spec.ts`

| Ligne | Test | Type | Cause |
|---|---|---|---|
| 221 | `modal notification en masse → modal visible` | Conditionnel UI | Bouton `btn-notify-bulk` non visible (timing ou condition d'affichage) |
| 306 | `assigner un abonnement à un utilisateur` | Conditionnel DB | `plans_tarifaires WHERE actif = 1` vide — seedé par `seed-e2e.ts` |

**Note :** Le skip ligne 221 est étrange car `btn-notify-bulk` existe dans `UsersPage.tsx` avec condition `{isAdmin && ...}`. Peut-être un problème de timing au chargement de la page.

---

### `e2e/tests/auth/negative-paths.spec.ts`

| Ligne | Test | Type | Cause |
|---|---|---|---|
| 138 | `register avec email déjà utilisé → erreur API` | Conditionnel UI | Bouton submit formulaire d'inscription absent lors de la vérification |
| 217 | `erreur réseau simulée → skippé intentionnellement` | **Inconditionnel** | `test.skip(true, "Nécessite un contexte authentifié avec page.route()")` — feature non implémentée |

---

### `e2e/tests/flows/enrollment-flow.spec.ts`

| Ligne | Test | Type | Cause |
|---|---|---|---|
| 83 | `membre inscrit via DB → visible dans /my-courses` | Conditionnel DB | `types_cours` vide |
| 169 | `membre inscrit peut se désinscrire → place libérée` | Conditionnel DB | `types_cours` vide |

**Correction :** Même que `courses.admin.spec.ts` — appliquer le schéma complet.

---

### `e2e/tests/member/messaging.spec.ts`

| Ligne | Test | Type | Cause |
|---|---|---|---|
| 259 | `onglet Archivés → liste ou état vide visible` | Conditionnel UI | Onglet `#tab-archived` ou `#tab-archive` absent du DOM |

**Note :** L'onglet est bien défini dans `MessagesPage.tsx` avec `testId: "tab-archived"` et l'id HTML `id="tab-archived"`. Investiguer pourquoi il ne serait pas visible — peut-être un problème de permission pour les membres.

---

### `e2e/tests/member/notifications.filters.spec.ts`

| Ligne | Test | Type | Cause |
|---|---|---|---|
| 122 | `supprimer toutes les notifications → liste vide` | Conditionnel UI | Bouton `delete-all-btn` absent — aucune notification visible malgré l'insertion en DB |

**Correction :** Vérifier la condition d'affichage du bouton "Tout supprimer" dans le composant notifications. Il doit apparaître dès qu'il y a au moins 1 notification.

---

### `e2e/tests/member/notifications.spec.ts`

| Ligne | Test | Type | Cause |
|---|---|---|---|
| 133 | `supprimer une notification → absente de la liste` | Conditionnel UI | Notification insérée en DB non visible sur la page 1 (pagination — trop de notifications accumulées) |

**Correction :** Nettoyer les notifications E2E entre les runs (ajouter un `DELETE FROM notifications WHERE user_id = <memberId>` dans le teardown global ou avant ce test).

---

### `e2e/tests/payments/payments.stripe.spec.ts`

**Guard 1 (commun à tous les tests 1–6) :**
```sql
SELECT id FROM utilisateurs WHERE userId = 'U-9999-0002'
```
Ce guard ne devrait jamais skiper si `seed-e2e.ts` a été exécuté.

| Ligne | Test | Guard | Cause |
|---|---|---|---|
| 116 | `bouton Payer maintenant visible pour une échéance en attente` | Guard 1 (DB) | Membre E2E absent |
| 157 | `bouton Payer maintenant absent pour une échéance déjà payée` | Guard 1 (DB) | Membre E2E absent |
| 199 | `modal Stripe s'ouvre au clic sur Payer maintenant` | Guard 1 (DB) | Membre E2E absent |
| 256 | `paiement Stripe réussi → modal se ferme et toast succès` | Guard 1 (DB) | Membre E2E absent |
| 309 | `paiement Stripe réussi → modal se ferme et toast succès` | Guard 2 (UI) | `stripe-missing-key-modal` s'ouvre au lieu de `stripe-payment-modal` — clé Stripe non injectée |
| 321 | `paiement Stripe réussi → modal se ferme et toast succès` | Guard 3 (UI) | Bouton `stripe-submit-btn` reste `disabled` en headless (Stripe.js ne valide pas le formulaire) |
| 352 | `paiement Stripe refusé → message d'erreur visible dans la modal` | Guard 1 (DB) | Membre E2E absent |
| 407 | `paiement Stripe refusé → message d'erreur visible dans la modal` | Guard 2 (UI) | Clé Stripe absente |
| 418 | `paiement Stripe refusé → message d'erreur visible dans la modal` | Guard 3 (UI) | Bouton disabled en headless |
| 450 | `erreur backend créer intent → toast d'erreur visible` | Guard 1 (DB) | Membre E2E absent |

**Note guards 2 & 3 :** Ces skips sont structurels — Stripe.js ne fonctionne pas bien en headless sans configuration particulière. Solutions possibles :
- Configurer `VITE_STRIPE_PUBLIC_KEY` dans l'env de test avec une vraie clé test Stripe
- Ou mocker plus agressivement Stripe.js pour forcer le bouton `enabled`

---

### `e2e/tests/profile/security.spec.ts`

| Ligne | Test | Type | Cause |
|---|---|---|---|
| 157 | `révoquer une session → session disparaît` | Conditionnel UI | Moins de 2 sessions actives pour `e2e_member` |

**Note :** La table `refresh_tokens` contient généralement 5 tokens après le globalSetup (1 par login + renouvellements). Ce test devrait passer. Si il skippe, re-lancer `pnpm e2e:seed` et relancer les tests.

---

### `e2e/tests/store/store.admin.spec.ts`

| Ligne | Test | Type | Cause |
|---|---|---|---|
| 265 | `ajustement de stock → quantité mise à jour` | Conditionnel DB | `stocks` vide — seedé par `seed-e2e.ts` |
| 328 | `changer le statut d'une commande via modal` | Conditionnel DB | `commandes` sans statut actif — seedé par `seed-e2e.ts` |
| 366 | `changer le statut d'une commande via modal` | Conditionnel UI | Aucun bouton de transition disponible dans la modal (commande déjà en état terminal) |

**Note garde 266 & 329 :** Le seed insère 1 stock et 1 commande `en_attente`. Si la DB est reset sans relancer le seed, ces tests skippent à nouveau.

---

### `e2e/tests/store/store.member.spec.ts`

| Ligne | Test | Type | Cause |
|---|---|---|---|
| 68 | `ajouter un article au panier → bouton voir panier visible` | Conditionnel UI | Article inséré non visible sur la page 1 du catalogue (tri ou pagination) |

**Correction :** Vérifier l'ordre de tri des articles dans le catalogue membre. Si tri par `id DESC`, le dernier article inséré devrait être en premier. Si la boutique a beaucoup d'articles, nettoyer avant le test.

---

## Skips intentionnels / permanents

| Fichier | Test | Raison |
|---|---|---|
| `negative-paths.spec.ts:217` | `erreur réseau simulée` | `test.skip(true, "Nécessite un contexte authentifié avec page.route()")` — à implémenter |

---

## Actions recommandées pour éliminer les skips restants

### Priorité haute (corrections simples)

1. **`types_cours` vide** → S'assurer que `00_SCHEMA_COMPLET.sql` est appliqué avant les tests. Vérifier dans `globalSetup.ts` ou ajouter au `seed-e2e.ts`.

2. **Onglet Archivés (`messaging.spec.ts`)** → Vérifier si l'onglet est bien rendu pour les membres (vs admins). Possible condition de permission manquante.

3. **Notifications pagination** → Ajouter un `DELETE FROM notifications WHERE user_id = ?` au début du test pour repartir proprement.

4. **`delete-all-btn` notifications** → Vérifier la condition d'affichage du bouton dans le composant frontend.

### Priorité moyenne

5. **Bug modal TemplatesTab** → Investiguer pourquoi `activeTab` passe à `"inbox"` après clic sur `btn-new-template`. Probable interaction entre `useMessagingStore` et le re-render de `MessagesPage`.

6. **`btn-notify-bulk` timing** → Ajouter un `waitFor` explicite sur le chargement de la page avant de vérifier la visibilité du bouton.

### Priorité basse (structurel / environnement)

7. **Stripe headless guards 2 & 3** → Mock plus complet de Stripe.js ou configuration d'une vraie clé test. Difficile sans modifier l'architecture de test.

8. **Store member pagination** → Ajouter un `DELETE FROM articles WHERE nom LIKE 'Article Panier%'` au teardown pour éviter l'accumulation.

---

## Commandes utiles

```bash
# Vérifier l'état des tables qui causent des skips
mysql -u root clubmanager -e "
  SELECT 'types_cours' AS t, COUNT(*) AS n FROM types_cours
  UNION SELECT 'plans_tarifaires', COUNT(*) FROM plans_tarifaires WHERE actif=1
  UNION SELECT 'stocks', COUNT(*) FROM stocks
  UNION SELECT 'commandes', COUNT(*) FROM commandes WHERE statut NOT IN ('annulee','livree')
  UNION SELECT 'types_msg_perso', COUNT(*) FROM types_messages_personnalises;
"

# Re-seeder les données E2E
pnpm e2e:seed

# Lancer uniquement les tests qui skippaient
pnpm --filter @clubmanager/e2e test --grep "courses|templates|enrollment|notifications|store"
```
