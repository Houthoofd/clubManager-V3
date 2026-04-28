# 📊 Synthèse - Valeurs Hardcodées à Migrer vers DB

> **Date**: Décembre 2024  
> **Audit complet**: Voir [hardcoded-values-audit.md](./hardcoded-values-audit.md)

---

## 🎯 Vue d'ensemble

**14 catégories** identifiées | **~25 fichiers** impactés | **~44 valeurs** hardcodées

### État actuel

| Catégorie | Statut | Priorité | Fichiers |
|-----------|--------|----------|----------|
| 🟢 Catégories articles | ✅ En DB | - | 1 |
| 🟢 Tailles articles | ✅ En DB | - | 1 |
| 🟢 Catégories templates | ✅ En DB | - | 2 |
| 🔴 Types de cours | ❌ Hardcodé | HAUTE | 4 |
| 🔴 Statuts de commande | ❌ Hardcodé | HAUTE | 5 |
| 🔴 Méthodes de paiement | ❌ Hardcodé | HAUTE | 3 |
| 🟠 Statuts de paiement | ❌ Hardcodé | MOYENNE | 3 |
| 🟠 Rôles utilisateurs | ❌ Hardcodé | MOYENNE | 2 |
| 🟠 Statuts d'échéance | ❌ Hardcodé | MOYENNE | 2 |
| 🟠 Statuts utilisateurs | ❌ Hardcodé | MOYENNE | 2 |
| 🟠 Statuts de présence | ❌ Hardcodé | MOYENNE | 1 |
| 🟡 Rôles familiaux | ❌ Hardcodé | BASSE | 2 |
| 🟡 Genres | ❌ Hardcodé | BASSE | 1 |
| 🟢 Jours semaine | ❌ Hardcodé | OPTIONNEL | 1 |

---

## 🔴 URGENT - À traiter en priorité

### 1. Types de Cours 🥋
**Problème**: Texte libre → incohérences, typos, statistiques impossibles  
**Impact**: 4 fichiers | Créer table `types_cours`  
**Action**: Migration des données existantes requise

```sql
CREATE TABLE types_cours (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  nom VARCHAR(100) NOT NULL,
  couleur VARCHAR(20),
  actif BOOLEAN DEFAULT true
);
```

### 2. Statuts de Commande 📦
**Valeurs**: `en_attente`, `en_cours`, `payee`, `expediee`, `prete`, `livree`, `annulee`  
**Impact**: 5 fichiers | Workflow complexe  
**Action**: Table + transitions de statuts

### 3. Méthodes de Paiement 💳
**Valeurs**: `especes`, `virement`, `stripe`, `autre`  
**Impact**: 3 fichiers | Filtres + badges  
**Action**: Migration simple

---

## 📋 Liste complète des valeurs

### Méthodes de paiement
```
especes, virement, autre, stripe
```

### Statuts de commande
```
en_attente, en_cours, payee, expediee, prete, livree, annulee
```

### Statuts de paiement
```
en_attente, valide, paye, partiel, echoue, rembourse, annule
```

### Statuts d'échéance
```
en_attente, paye, en_retard, annule
```

### Rôles utilisateurs
```
admin, professor, member, parent
```

### Statuts utilisateurs (ID)
```
1=actif, 2=inactif, 3=suspendu, 4=en_attente, 5=archive
```

### Rôles familiaux
```
enfant, conjoint, autre, parent, tuteur
```

### Genres (ID)
```
1=Homme, 2=Femme, 3=Autre
```

### Statuts de présence (ID)
```
1=present, null=absent
```

---

## 🗺️ Plan d'action (8 semaines)

### Semaine 1-2 🔴 CRITIQUE
- [ ] Types de cours (+ migration données)
- [ ] Statuts de commande (+ workflow)
- [ ] Méthodes de paiement

### Semaine 3-4 🟠 IMPORTANT
- [ ] Statuts de paiement
- [ ] Rôles utilisateurs
- [ ] Statuts d'échéance
- [ ] Statuts de présence

### Semaine 5-6 🟡 SOUHAITABLE
- [ ] Statuts utilisateurs
- [ ] Rôles familiaux
- [ ] Genres

### Semaine 7-8 🟢 OPTIONNEL
- [ ] Jours de la semaine
- [ ] Documentation finale
- [ ] Formation équipe

---

## 🏗️ Pattern de migration

### 1. Backend
```sql
CREATE TABLE reference_table (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  couleur VARCHAR(20),
  ordre INTEGER,
  actif BOOLEAN DEFAULT true
);
```

### 2. API Endpoint
```typescript
GET /api/references/:type
GET /api/references (bulk)
```

### 3. Frontend Hook
```typescript
const { data: refs } = useReferences();

<select>
  {refs?.methodes_paiement?.map(m => (
    <option key={m.code} value={m.code}>{m.nom}</option>
  ))}
</select>
```

---

## 📈 Bénéfices

### ✅ Flexibilité
- Ajout/modification sans redéploiement
- Configuration par environnement

### ✅ Cohérence
- Source unique de vérité
- Pas de duplication

### ✅ Maintenance
- Code plus propre
- Tests plus faciles

### ✅ i18n
- Support multilingue facilité
- Labels personnalisables

---

## 🎓 Fichiers clés à modifier

### Payments (3 fichiers)
- `RecordPaymentModal.tsx` - Méthodes de paiement
- `PaymentsTab.tsx` - Filtres statuts + méthodes
- `SchedulesTab.tsx` - Statuts d'échéance

### Store (5 fichiers)
- `OrderStatusBadge.tsx` - Statuts commande
- `OrderDetailModal.tsx` - Workflow statuts
- `MyOrdersTab.tsx` - Filtres statuts
- `ConfigurationTab.tsx` - ✅ Déjà dynamique
- `StoreStatsPage.tsx` - Stats commandes

### Users (2 fichiers)
- `UserRoleBadge.tsx` - Rôles
- `UserStatusBadge.tsx` - Statuts

### Courses (4 fichiers)
- `CreateEditCourseRecurrentModal.tsx` - Types cours (INPUT)
- `CreateSessionModal.tsx` - Types cours (INPUT)
- `AttendanceModal.tsx` - Présence
- `CoursesPage.tsx` - Types cours (FILTER)

### Families (2 fichiers)
- `AddFamilyMemberModal.tsx` - Rôles + Genres
- `FamilyMemberCard.tsx` - Rôles (affichage)

### Shared (1 fichier)
- `Badge.tsx` - Design system (tous les badges)

---

## ⚠️ Points d'attention

### Migration des données
- Types de cours : Migration depuis texte libre
- Backups obligatoires avant migration
- Tests en staging d'abord

### Compatibilité
- Garder temporairement les deux systèmes
- Feature flags pour bascule progressive
- Monitoring des erreurs

### Performance
- Cache côté frontend (1h)
- Index sur colonnes `code` et `actif`
- Bulk endpoint pour charger toutes les refs

---

## 📚 Documentation

- **Audit complet**: [hardcoded-values-audit.md](./hardcoded-values-audit.md)
- **Design System**: `frontend/src/shared/components/Badge/Badge.tsx`
- **Scripts migration**: `db/migrations/` (à créer)

---

## ✅ Checklist par migration

- [ ] Table DB créée + index
- [ ] Données par défaut insérées
- [ ] Endpoint API testé
- [ ] Types TypeScript définis
- [ ] Hook React Query configuré
- [ ] Composants mis à jour
- [ ] Tests passent
- [ ] Doc mise à jour
- [ ] Déployé en staging
- [ ] Validé par équipe
- [ ] Déployé en prod
- [ ] Code hardcodé supprimé

---

**Prochaine étape**: Commencer par les types de cours (impact le plus élevé)