# Audit Sprint 2

**Date** : 22 juillet 2026  
**Sprint audité** : Sprint 2 — Pages publiques et données dynamiques  
**Auditeur** : Agent AQA (Audit & Quality Assurance) — Forge AI v2  

## Résumé exécutif

Le Sprint 2 a livré 15 fichiers (4 services, 4 composants UI, 5 pages, 1 type, 1 update App.tsx). Les 4 services Supabase sont correctement structurés, les composants UI sont réutilisables, et le lazy loading est maintenu. **Une anomalie** est détectée : la pagination annoncée dans le rapport pour les matchs n'est pas implémentée — `MatchsPage` charge tous les matchs d'un coup via `getMatches()` (sans limite) tandis que `getPastMatches` (serveur paginé) n'est jamais appelé, ni même importé. Par ailleurs, aucune migration SQL ni ADR n'accompagne ce sprint. Verdict : **GO avec réserves**.

## Conformité des objectifs

| Objectif prévu | Livrable | Statut |
|----------------|----------|--------|
| Types Player, Match, NewsItem, Staff | `src/types/index.ts` | ✅ Réalisé |
| Service players | `src/lib/players.ts` | ✅ Réalisé |
| Service matches | `src/lib/matches.ts` | ⚠ Partiel (getPastMatches jamais consommé) |
| Service news | `src/lib/news.ts` | ✅ Réalisé |
| Service staff | `src/lib/staff.ts` | ✅ Réalisé |
| Squelettes de chargement | `src/components/ui/Skeleton.tsx` | ✅ Réalisé |
| Cartes joueur, match, news, staff | 4 composants UI | ✅ Réalisé |
| HomePage dynamique | Hero + prochain match + dernières news | ✅ Réalisé |
| SquadPage groupée par poste | Joueurs + staff technique | ✅ Réalisé |
| MatchsPage avec filtre | `src/pages/MatchsPage.tsx` | ⚠ Partiel (filtre client-side, sans pagination) |
| NewsPage paginée | 9/page + pagination | ✅ Réalisé |
| NewsArticlePage | Article par slug | ✅ Réalisé |
| Lazy loading images | `loading="lazy"` sur tous les composants | ✅ Réalisé |
| Build | `npm run build` → OK (14 chunks) | ✅ Réalisé |
| Push GitHub | `8b80a88` | ✅ Réalisé |

## Architecture

**Verdict : WARNING**

Points vérifiés :
- MVC respecté : Model (`src/lib/*.ts`), View (`components/ui/`, `pages/`), Types centralisés (`src/types/index.ts`) — **conforme**
- Services Supabase isolés et réutilisables — **conforme**
- Composants UI atomiques et découplés (PlayerCard, MatchCard, NewsCard, StaffCard, Skeleton) — **conforme**
- Route `/news/:slug` ajoutée dans `App.tsx` — **conforme**
- Lazy loading maintenu pour toutes les pages — **conforme**

Non-conformités :
- **NC-201** — `getMatches()` dans `matches.ts` (lignes 4-12) n'a **ni pagination ni limite**. L'ensemble des matchs est chargé en mémoire. `MatchsPage.tsx` ligne 15 appelle `getMatches()` puis filtre côté client (ligne 26). Le rapport de sprint mentionne "Pagination sur news et matches" mais la pagination match n'existe que dans la fonction inutilisée `getPastMatches` (lignes 26-38).
- **NC-202** — `getPlayerBySlug` (`players.ts` lignes 15-23) et `getPastMatches` (`matches.ts` lignes 26-38) sont exportées mais **aucun appelant** ne les importe. Preuve : `Select-String` sur tous les `.ts`/`.tsx` → seul `matches.ts` et `players.ts` contiennent ces symboles.
- **NC-203** — Aucun script de migration SQL pour les tables Supabase (`players`, `matches`, `news`, `staff`) n'est présent dans le dépôt. Le projet n'est pas reproductible sans création manuelle des tables.
- **NC-204** — Les composants `PlayerCard` (ligne 10-15), `StaffCard` (ligne 22-28), `NewsCard` (ligne 17-23), `NewsArticlePage` (ligne 56-62) n'ont pas de gestionnaire `onError` sur les `<img>`. Si une URL est invalide, l'image brisée s'affiche sans fallback.

## Qualité du code

**Verdict : WARNING**

Points vérifiés :
- Types exhaustifs avec champs bien nommés — **conforme**
- Fonctions pures pour le formatage (`formatDate`, `roleLabel`, `positionLabel`, `groupByPosition`) — **conforme**
- Gestion des états vides (loading, empty, error) dans toutes les pages — **conforme**
- Conventions de nommage respectées (PascalCase fichiers composants, camelCase fonctions) — **conforme**
- `positionLabel` et `roleLabel` avec fallback `labels[role] ?? role` — **conforme**
- Couleurs `primary`/`cta` correctement résolues (vérifié Sprint 1 corrigé) — **conforme**

Anomalies :
- `NewsArticlePage` lignes 40-47 : le bloc `catch` (ligne 16-18) traite **toute erreur** (réseau, Supabase, article inexistant) de la même manière, affichant "Article non trouvé". Une erreur 500 ou un timeout réseau est confondu avec une 404.
- `MatchCard` ligne 42 : `opponent_score ?? -1` est un _workaround_ fonctionnel mais fragile. Si `racing_score` aussi est `null`, `null > -1` → `false` étonnamment (car `Number(null) = 0`). Acceptable pour le périmètre.
- Aucun commentaire de typage ou JSDoc — les fonctions exportées (`getPastMatches`, `getPlayerBySlug`) sans appelant sont difficilement maintenables.

## Dette technique

| Dette | Preuve | Impact | Criticité |
|-------|--------|--------|-----------|
| Pagination match non implémentée malgré l'annonce | `MatchsPage` ligne 15 ≠ `getPastMatches` (inutilisée) | Dégradation perf avec +100 matchs ; dette documentation | **Haute** |
| Dead code : `getPlayerBySlug`, `getPastMatches` | Définies dans `lib/` mais sans import | Confusion, code mort non testé | **Moyenne** |
| Absence de script de migration SQL | Aucun fichier `.sql` dans le dépôt | Projet non reproductible sans intervention manuelle | **Moyenne** |
| Pas de `onError` sur `<img>` | 4 composants sans handler | Image brisée visible si URL invalide | **Faible** |
| Erreurs réseau confondues avec 404 | `NewsArticlePage` catch générique | UX trompeuse en cas de panne réseau | **Faible** |

## Sécurité

**Verdict : PASS** (périmètre Sprint 2 uniquement)

Points vérifiés :
- Services Supabase utilisent `supabase` client déjà sécurisé (validé Sprint 1) — **conforme**
- Aucun secret exposé dans les appels API — **conforme**
- Données filtrées en lecture côté Supabase via `.eq('is_active', true)` et `.eq('status', 'published')` — **conforme**

Non vérifiable : RLS policies sur les tables `players`, `matches`, `news`, `staff` (pas de migration SQL fournie).

## Performance

**Verdict : WARNING**

Points vérifiés :
- `loading="lazy"` sur tous les `<img>` — **conforme**
- Pagination fonctionnelle sur les news (9/page) — **conforme**
- Code splitting maintenu (14 chunks) — **conforme**
- Squelettes de chargement sur toutes les pages — **conforme**

Non-conformité :
- **MatchsPage** charge la totalité des matchs sans pagination. `getMatches()` n'a pas de `.limit()`. Risque avéré avec des données réelles.

## Documentation

**Verdict : WARNING**

Points vérifiés :
- Rapport de sprint présent — **conforme**
- Corrections NC Sprint 1 (NC-101 à NC-104 + ADR-011) préservées — **conforme**

Absences :
- ADR-012 à ADR-xxx : aucune décision du Sprint 2 documentée (choix du pattern service, structure des types, stratégie de pagination, gestion d'images).
- Aucun schéma ou fichier SQL pour les 4 tables Supabase.

## Risques

| Risque | Cause | Conséquence | Criticité |
|--------|-------|-------------|-----------|
| Lenteur page Matchs avec données réelles | `getMatches()` sans limite | Chargement intégral en mémoire ; freeze navigateur au-delà de ~500 matchs | **Haute** |
| Non-reproductibilité du projet | Absence de migration SQL | Impossible de recréer les tables sans documentation externe | **Moyenne** |
| Images brisées en production | Pas de handler `onError` | Trou dans l'UI : icône broken image | **Faible** |

## Non-conformités

1. **NC-201** — `MatchsPage` sans pagination ; `getPastMatches` (serveur paginé) jamais utilisé.
2. **NC-202** — Code mort : `getPlayerBySlug`, `getPastMatches`.
3. **NC-203** — Aucune migration SQL pour les 4 tables Supabase.
4. **NC-204** — Pas de gestionnaire `onError` sur les `<img>` dans 4 composants.

## Recommandations

1. **Haute priorité** — Remplacer `getMatches()` dans `MatchsPage` par `getPastMatches()` paginé pour les matchs terminés, et `getUpcomingMatches()` pour les matchs à venir.
2. Supprimer le code mort (`getPlayerBySlug`, `getPastMatches`) ou l'intégrer dans les pages.
3. Créer un dossier `supabase/` avec les migrations SQL pour les 4 tables.
4. Ajouter un `onError` sur chaque `<img>` pour afficher le fallback (SVG/placeholder).
5. Créer un ADR-012 documentant les décisions du Sprint 2 (pattern service, types, pagination).

## Score détaillé

| Domaine | Score |
|----------|------:|
| Architecture | 6/10 |
| Qualité | 6/10 |
| Sécurité | 7/10 |
| Documentation | 5/10 |
| Maintenabilité | 6/10 |
| Dette technique | 5/10 |
| **Score global** | **58/100** |

## Verdict

**GO avec réserves**

## Conclusion

Le Sprint 2 ajoute 4 services Supabase fonctionnels, 4 composants UI réutilisables et 4 pages dynamiques. La qualité du code est bonne et l'architecture MVC est respectée. L'anomalie principale est l'absence de pagination sur la page Matchs (`getMatches()` sans limite) contrairement à ce qu'annonce le rapport, couplée à du code mort (`getPastMatches`, `getPlayerBySlug`). L'absence de migration SQL compromet la reproductibilité. Les 5 recommandations ci-dessus doivent être traitées avant le Sprint 3.
