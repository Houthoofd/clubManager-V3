# 🔄 Migration des Valeurs Hardcodées vers Base de Données

> **Projet** : ClubManager V3 - Refactoring Architecture  
> **Date de début** : Décembre 2024  
> **Durée estimée** : 8 semaines  
> **Priorité** : HAUTE

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Pourquoi cette migration ?](#-pourquoi-cette-migration-)
- [Avant de commencer](#-avant-de-commencer)
- [Guide étape par étape](#-guide-étape-par-étape)
- [Structure des fichiers](#-structure-des-fichiers)
- [Exemples de code](#-exemples-de-code)
- [Testing](#-testing)
- [Déploiement](#-déploiement)
- [FAQ](#-faq)
- [Support](#-support)

---

## 🎯 Vue d'ensemble

Ce projet vise à **migrer toutes les valeurs hardcodées** du frontend (méthodes de paiement, statuts, rôles, types de cours, etc.) vers **des tables de référence en base de données**.

### Statistiques

- **14 catégories** de valeurs à migrer
- **~25 fichiers** frontend impactés
- **~44 valeurs** hardcodées identifiées
- **3 catégories** déjà en DB (✅)

### Impact attendu

| Avant | Après |
|-------|-------|
| ❌ Code redéployé pour chaque changement | ✅ Modification via interface admin |
| ❌ Risque d'incohérence (typos) | ✅ Source unique de vérité |
| ❌ i18n compliqué | ✅ Support multilingue facilité |
| ❌ Tests difficiles | ✅ Tests simplifiés |

---

## 🤔 Pourquoi cette migration ?

### Problèmes actuels

1. **Inflexibilité** : Ajouter une méthode de paiement = modifier le code + redéployer
2. **Incohérence** : Types de cours en texte libre → typos, doublons
3. **Maintenance** : Code dupliqué dans plusieurs fichiers
4. **i18n** : Labels hardcodés en français uniquement
5. **Analytics** : Statistiques imprécises à cause des incohérences

### Bénéfices

✅ **Flexibilité** : Configuration sans redéploiement  
✅ **Cohérence** : Source de vérité unique  
✅ **Performance** : Cache optimisé (1h)  
✅ **Évolutivité** : Ajout facile de nouvelles valeurs  
✅ **i18n** : Support multilingue prêt  

---

## 🚀 Avant de commencer

### Prérequis

- [ ] Accès à la base de données
- [ ] Backup de la DB effectué
- [ ] Environnement de dev configuré
- [ ] Node.js 18+ et pnpm installés
- [ ] Familiarité avec React Query

### Documentation à lire

1. **Audit complet** : [`hardcoded-values-audit.md`](./hardcoded-values-audit.md)
2. **Synthèse rapide** : [`hardcoded-values-summary.md`](./hardcoded-values-summary.md)
3. **Script SQL** : [`db/migrations/reference-tables-migration.sql`](../db/migrations/reference-tables-migration.sql)
4. **Hook useReferences** : [`frontend/src/shared/hooks/useReferences.ts`](../frontend/src/shared/hooks/useReferences.ts)
5. **Exemples d'usage** : [`frontend/src/shared/hooks/useReferences.examples.tsx`](../frontend/src/shared/hooks/useReferences.examples.tsx)

---

## 📖 Guide étape par étape

### Phase 1 : Backend (Semaine 1)

#### 1.1 Exécuter la migration SQL

```bash
# Se connecter à la DB
psql -U postgres -d clubmanager_v3

# Exécuter le script
\i db/migrations/reference-tables-migration.sql

# Vérifier que tout s'est bien passé
SELECT * FROM methodes_paiement;
SELECT * FROM statuts_commande;
SELECT * FROM types_cours;
```

**✅ Validation** : Toutes les tables créées + données insérées

#### 1.2 Créer les endpoints API

Créer le fichier `backend/src/routes/references.js` :

```javascript
// GET /api/references - Retourne toutes les références
router.get('/references', async (req, res) => {
  try {
    const [methodesPaiement] = await pool.query(
      'SELECT * FROM methodes_paiement WHERE actif = true ORDER BY ordre'
    );
    const [statutsCommande] = await pool.query(
      'SELECT * FROM statuts_commande WHERE actif = true ORDER BY ordre'
    );
    // ... autres tables

    res.json({
      methodes_paiement: methodesPaiement,
      statuts_commande: statutsCommande,
      // ... autres
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/references/:type - Retourne un type spécifique
router.get('/references/:type', async (req, res) => {
  const { type } = req.params;
  const validTables = {
    methodes_paiement: 'methodes_paiement',
    statuts_commande: 'statuts_commande',
    // ... mapping
  };

  if (!validTables[type]) {
    return res.status(404).json({ error: 'Type de référence inconnu' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM ${validTables[type]} WHERE actif = true ORDER BY ordre`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**✅ Validation** : Tester avec Postman/Insomnia

```bash
curl http://localhost:5001/api/references/methodes_paiement
curl http://localhost:5001/api/references
```

### Phase 2 : Frontend Setup (Semaine 1)

#### 2.1 Vérifier le hook useReferences

Le hook est déjà créé dans `frontend/src/shared/hooks/useReferences.ts`.

Vérifier qu'il est bien configuré :

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

// ✅ Le hook doit utiliser votre client API existant
```

#### 2.2 Tester le hook

Créer un composant de test :

```tsx
// frontend/src/test/ReferencesTest.tsx
import { useReferences } from '@/shared/hooks/useReferences';

export function ReferencesTest() {
  const { data, isLoading, error } = useReferences();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  );
}
```

**✅ Validation** : Les données s'affichent correctement

### Phase 3 : Migration Progressive (Semaine 2-7)

Pour chaque catégorie, suivre ce processus :

#### 3.1 Identifier les fichiers concernés

Exemple pour **méthodes de paiement** :

- `RecordPaymentModal.tsx` (ligne 177-181)
- `PaymentsTab.tsx` (ligne 189-196)
- `Badge.tsx` (ligne 487-510)

#### 3.2 Remplacer le code hardcodé

**AVANT** :

```tsx
<select>
  <option value="especes">Espèces</option>
  <option value="virement">Virement</option>
  <option value="stripe">Carte bancaire</option>
</select>
```

**APRÈS** :

```tsx
import { useMethodesPaiement, getActivesSorted } from '@/shared/hooks/useReferences';

function MyComponent() {
  const { data: methodes, isLoading } = useMethodesPaiement();

  if (isLoading) return <div>Chargement...</div>;

  return (
    <select>
      {getActivesSorted(methodes).map(m => (
        <option key={m.code} value={m.code}>
          {m.nom}
        </option>
      ))}
    </select>
  );
}
```

#### 3.3 Tester le composant

```bash
npm run dev
# Ouvrir la page concernée
# Vérifier que le select fonctionne
```

#### 3.4 Supprimer le code hardcodé

Une fois validé, supprimer les anciennes constantes :

```typescript
// ❌ À SUPPRIMER
const METHODES_PAIEMENT = ['especes', 'virement', 'stripe'];
```

#### 3.5 Commit & PR

```bash
git checkout -b feat/migrate-methodes-paiement
git add .
git commit -m "feat: migrate méthodes de paiement to DB"
git push origin feat/migrate-methodes-paiement
# Créer une Pull Request
```

### Phase 4 : Validation & Déploiement (Semaine 8)

#### 4.1 Tests complets

- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Tests E2E passent
- [ ] Validation manuelle sur staging

#### 4.2 Performance

- [ ] Temps de chargement < 200ms
- [ ] Cache fonctionne (pas de requête à chaque render)
- [ ] Pas de N+1 queries

#### 4.3 Déploiement production

```bash
# 1. Backup DB
pg_dump clubmanager_v3 > backup_before_migration.sql

# 2. Exécuter migration sur prod
psql -U prod_user -d clubmanager_v3 -f reference-tables-migration.sql

# 3. Déployer backend
git push production main

# 4. Déployer frontend
npm run build
# Upload dist/ vers CDN/serveur

# 5. Vérifier
curl https://api.clubmanager.com/api/references
```

---

## 📁 Structure des fichiers

```
clubManager-V3/
├── docs/
│   ├── hardcoded-values-audit.md         # Audit complet
│   ├── hardcoded-values-summary.md       # Synthèse rapide
│   └── MIGRATION-HARDCODED-VALUES-README.md  # Ce fichier
│
├── db/
│   └── migrations/
│       └── reference-tables-migration.sql  # Script SQL
│
├── backend/
│   └── src/
│       └── routes/
│           └── references.js             # À créer
│
└── frontend/
    └── src/
        └── shared/
            └── hooks/
                ├── useReferences.ts           # Hook principal
                └── useReferences.examples.tsx # Exemples
```

---

## 💻 Exemples de code

### Exemple 1 : Select simple

```tsx
import { useMethodesPaiement, getActivesSorted } from '@/shared/hooks/useReferences';

export function PaymentMethodSelect() {
  const { data: methodes, isLoading } = useMethodesPaiement();

  return (
    <select>
      {!isLoading && getActivesSorted(methodes).map(m => (
        <option key={m.code} value={m.code}>{m.nom}</option>
      ))}
    </select>
  );
}
```

### Exemple 2 : Badge dynamique

```tsx
import { useStatutsCommande, findByCode } from '@/shared/hooks/useReferences';
import { Badge } from '@/shared/components';

export function OrderStatusBadge({ statusCode }: { statusCode: string }) {
  const { data: statuts } = useStatutsCommande();
  const statut = findByCode(statuts, statusCode);

  return (
    <Badge variant={statut?.couleur as any}>
      {statut?.nom || 'Inconnu'}
    </Badge>
  );
}
```

### Exemple 3 : Filtres

```tsx
import { useStatutsCommande, getActivesSorted } from '@/shared/hooks/useReferences';

export function OrderFilters() {
  const { data: statuts } = useStatutsCommande();
  const [selectedStatut, setSelectedStatut] = useState('');

  return (
    <div className="flex gap-2">
      {getActivesSorted(statuts).map(s => (
        <button
          key={s.code}
          onClick={() => setSelectedStatut(s.code)}
          className={selectedStatut === s.code ? 'active' : ''}
        >
          {s.nom}
        </button>
      ))}
    </div>
  );
}
```

Plus d'exemples dans [`useReferences.examples.tsx`](../frontend/src/shared/hooks/useReferences.examples.tsx)

---

## 🧪 Testing

### Tests unitaires

```typescript
// __tests__/useReferences.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useMethodesPaiement } from '@/shared/hooks/useReferences';

describe('useReferences', () => {
  it('should load methodes de paiement', async () => {
    const { result } = renderHook(() => useMethodesPaiement());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(4);
    expect(result.current.data?.[0]).toHaveProperty('code');
    expect(result.current.data?.[0]).toHaveProperty('nom');
  });
});
```

### Tests d'intégration

```typescript
// __tests__/PaymentMethodSelect.test.tsx
import { render, screen } from '@testing-library/react';
import { PaymentMethodSelect } from './PaymentMethodSelect';

test('renders payment methods from DB', async () => {
  render(<PaymentMethodSelect />);

  await waitFor(() => {
    expect(screen.getByText('Espèces')).toBeInTheDocument();
    expect(screen.getByText('Virement')).toBeInTheDocument();
  });
});
```

---

## 🚢 Déploiement

### Checklist pré-déploiement

- [ ] **Backup DB** effectué
- [ ] **Tests** : Tous verts
- [ ] **Staging** : Validé par l'équipe
- [ ] **Performance** : Temps de réponse < 200ms
- [ ] **Documentation** : À jour
- [ ] **Rollback plan** : Prêt

### Rollback en cas de problème

```sql
-- Voir section ROLLBACK dans reference-tables-migration.sql
BEGIN;
-- Supprimer les tables
DROP TABLE IF EXISTS transitions_statut_commande CASCADE;
DROP TABLE IF EXISTS methodes_paiement CASCADE;
-- ... etc
COMMIT;
```

### Monitoring post-déploiement

- Surveiller les logs d'erreur
- Vérifier les temps de réponse API
- Vérifier les requêtes SQL (pas de N+1)
- Collecter les retours utilisateurs

---

## ❓ FAQ

### Q1 : Dois-je migrer toutes les catégories en une fois ?

**Non !** Migrez progressivement, catégorie par catégorie. Commencez par les plus critiques :
1. Types de cours (haute priorité)
2. Statuts de commande (haute priorité)
3. Méthodes de paiement (haute priorité)

### Q2 : Comment gérer la compatibilité avec l'ancien code ?

Gardez temporairement les deux systèmes en parallèle :

```typescript
// Fallback sur hardcodé si la DB ne répond pas
const methodes = refs?.methodes_paiement || FALLBACK_METHODES;
```

### Q3 : Comment ajouter une nouvelle valeur après migration ?

Via l'interface admin (à créer) ou directement en DB :

```sql
INSERT INTO methodes_paiement (code, nom, icone, couleur, ordre)
VALUES ('cheque', 'Chèque', 'DocumentIcon', 'info', 5);
```

Le frontend se met à jour automatiquement grâce au cache React Query.

### Q4 : Puis-je modifier les valeurs existantes ?

Oui, via UPDATE SQL :

```sql
UPDATE methodes_paiement
SET nom = 'Espèces (liquide)', description = 'Paiement en argent liquide'
WHERE code = 'especes';
```

### Q5 : Comment gérer l'i18n ?

Deux options :
1. **Court terme** : Utiliser i18next avec les codes comme clés
2. **Long terme** : Ajouter des colonnes `nom_en`, `nom_fr`, etc.

### Q6 : Les performances seront-elles impactées ?

Non, grâce au cache React Query (1h). La requête est faite **une seule fois** puis mise en cache.

---

## 🔧 Troubleshooting

### Erreur : "Table does not exist"

```bash
# Vérifier que la migration SQL a été exécutée
psql -U postgres -d clubmanager_v3 -c "\dt"
```

### Erreur : "Cannot read property 'map' of undefined"

Vérifier que vous gérez le cas `isLoading` :

```tsx
if (isLoading) return <div>Chargement...</div>;
```

### Les données ne se mettent pas à jour

Invalider le cache manuellement :

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['references'] });
```

---

## 📞 Support

### Équipe technique

- **Lead Dev** : [Nom]
- **Backend** : [Nom]
- **Frontend** : [Nom]
- **DevOps** : [Nom]

### Ressources

- **Slack** : #clubmanager-migration
- **Jira** : [Lien vers le board]
- **Wiki** : [Lien vers la doc]
- **Code Review** : Tous les PRs doivent être reviewés

### Contacts

- Questions techniques : #tech-support
- Questions métier : #product
- Urgences : [Contact d'urgence]

---

## ✅ Checklist globale

### Backend
- [ ] Migration SQL exécutée
- [ ] Endpoints API créés
- [ ] Tests backend écrits
- [ ] Documentation API

### Frontend
- [ ] Hook useReferences configuré
- [ ] Types TypeScript définis
- [ ] Composants migrés
- [ ] Tests frontend écrits

### Déploiement
- [ ] Backup DB effectué
- [ ] Tests en staging
- [ ] Monitoring configuré
- [ ] Rollback plan prêt

### Documentation
- [ ] README à jour
- [ ] Exemples de code
- [ ] Guide de migration
- [ ] FAQ complétée

---

## 🎉 Conclusion

Cette migration est un **investissement** qui apportera **flexibilité** et **maintenabilité** au projet.

Prenez le temps de bien faire les choses, testez abondamment, et n'hésitez pas à demander de l'aide !

**Bonne migration ! 🚀**

---

*Dernière mise à jour : Décembre 2024*