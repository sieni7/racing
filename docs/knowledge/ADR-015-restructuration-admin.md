# ADR-015 : Restructuration de l'interface d'administration — Sprint 7

**Statut** : Accepté  
**Date** : 23 juillet 2026  
**Approbation** : Équipe

## Contexte

Le Sprint 3 avait introduit une première version de l'administration avec des composants monolithiques (`AdminTable`, `AdminForm`). Après 6 entités (Players, Matches, News, Staff, Gallery, Standings), des limitations sont apparues :
- `AdminTable` ne supportait ni bulk actions, ni colonnes masquables, ni états skeleton
- `AdminForm` n'avait pas de focus mode ni de champs conditionnels
- Les pages admin étaient des fichiers plats dans `src/pages/admin/` sans organisation

## Décisions

### Architecture en 3 couches (`core/data/forms`)

| Couche | Répertoire | Responsabilité | Exemples |
|--------|------------|----------------|----------|
| **Core** | `src/components/admin/core/` | Structure de la page admin | AdminLayout, AdminSidebar, AdminHeader, AdminBreadcrumb |
| **Data** | `src/components/admin/data/` | Composants de données | DataTable (remplace AdminTable) |
| **Forms** | `src/components/admin/forms/` | Composants de formulaire | FormBuilder (remplace AdminForm) |

### DataTable — Remplacement d'AdminTable

- **Générique** : `DataTable<T extends { id: string }>` avec interface `Column<T>` typée
- **Fonctionnalités** : Colonnes masquables (`hideable`), tri (`sortable`), recherche persistante (`storageKey` → localStorage), bulk delete, 8 états skeleton, pagination, barre d'extra actions
- **Pattern** : Props-only, pas de state global

### FormBuilder — Remplacement d'AdminForm

- **Formulaire générique** : `FormBuilder` avec interface `Field` typée
- **Focus mode** : Plein écran pour les formulaires longs
- **Champs conditionnels** : `dependsOn: { field, value }` — champ masqué jusqu'à ce qu'une autre valeur soit sélectionnée
- **Debounce validation** : Validation différée pour éviter les erreurs précoces
- **Suggestions datalist** : Autocomplétion native (`<datalist>`) via `suggestions` dans `Field`

### Pages organisées par entité

- **Nouveau pattern** : `src/pages/admin/Entities/{EntityName}/{EntityName}.tsx`
- Chaque page utilise `DataTable` + `FormBuilder` + composants auxiliaires (`ImportModal`, `ExportButton`, `AuditHistory`, `ConfirmModal`)
- Imports vers `../../../../components/admin/` (correspond à la profondeur `src/pages/admin/Entities/X/X.tsx`)
- Service et types importés depuis `../../../../lib/` et `../../../../types/`

### Composants auxiliaires promus

Les composants suivants sont promus du statut "utilitaire" à "composant pérenne" :
- `AuditHistory` — Affiche l'historique des modifications avec diff visuel
- `ExportButton` — Export CSV/JSON
- `ImportModal` — Import batch CSV
- `ReadOnlyBanner` — Bannière mode lecture seule
- `Widget` — Conteneur générique pour widgets dashboard

### Dashboard avec react-grid-layout v5

- 6 widgets redimensionnables/déplaçables
- Layout persistant dans `localStorage` (clé `rcb_dashboard_layout_v2`)
- Utilisation de `verticalCompactor` et `useContainerWidth` de react-grid-layout v5

## Conséquences

- ✅ Architecture en couches claire — séparation Core/Data/Forms
- ✅ Composants DRY — DataTable et FormBuilder réutilisés sur 6 entités + futures
- ✅ Migration en douceur — les anciennes pages (`src/pages/admin/{Entity}.tsx`) ont coexisté pendant la transition, puis supprimées
- ✅ Routes inchangées — les chemins d'import dans `App.tsx` pointent vers `Entities/`
- ⚠️ `DataTable` reste monolithique (243 lignes) — pourra être extrait en sous-composants dans un futur sprint
- ⚠️ `AdminTable` et `AdminForm` (anciens) conservés dans `src/components/admin/` — à supprimer après vérification

## Fichiers impactés

- **Créés** : `src/components/admin/core/`, `src/components/admin/data/DataTable.tsx`, `src/components/admin/forms/FormBuilder.tsx`, `src/pages/admin/Entities/*`, `src/pages/admin/Activity/`, `src/pages/admin/Dashboard/`
- **Supprimés** : `src/pages/admin/Dashboard.tsx`, `src/pages/admin/Players.tsx`, `src/pages/admin/Matches.tsx`, `src/pages/admin/News.tsx`, `src/pages/admin/Staff.tsx`, `src/pages/admin/Gallery.tsx`, `src/pages/admin/Standings.tsx`
- **Modifiés** : `src/App.tsx` (routes → Entities/), `src/pages/SquadPage.tsx`, `src/pages/MatchsPage.tsx`, `src/pages/NewsPage.tsx`
