# Rapport Sprint 2 — Pages publiques et données dynamiques

**Date** : 22 juillet 2026  
**Lead** : ARCHITECTE  
**Contributors** : DATABASE DESIGNER, PERFORMANCE ENGINEER  
**Validators** : ARCHITECTE, ORCHESTRATEUR

## Statut général
✅ **COMPLETED**

## Livrables

| Fichier | Description | Statut |
|---------|-------------|--------|
| `src/types/index.ts` | Types Player, Match, NewsItem, Staff | ✅ |
| `src/lib/players.ts` | Service Supabase players (list, bySlug) | ✅ |
| `src/lib/matches.ts` | Service Supabase matches (list, upcoming, past paginée) | ✅ |
| `src/lib/news.ts` | Service Supabase news (list paginée, recent, bySlug) | ✅ |
| `src/lib/staff.ts` | Service Supabase staff (list actif) | ✅ |
| `src/components/ui/Skeleton.tsx` | Skeleton, CardSkeleton, ListSkeleton | ✅ |
| `src/components/ui/PlayerCard.tsx` | Carte joueur avec photo, numéro, position, nationalité | ✅ |
| `src/components/ui/MatchCard.tsx` | Carte match avec score, statut, date, lieu | ✅ |
| `src/components/ui/NewsCard.tsx` | Carte article avec image, titre, extrait, lien | ✅ |
| `src/components/ui/StaffCard.tsx` | Carte staff avec photo, rôle, bio | ✅ |
| `src/pages/HomePage.tsx` | Hero section + prochain match + dernières news | ✅ |
| `src/pages/SquadPage.tsx` | Joueurs groupés par poste + staff technique | ✅ |
| `src/pages/MatchsPage.tsx` | Liste matchs avec filtre (tous/à venir/terminés) | ✅ |
| `src/pages/NewsPage.tsx` | Articles paginés (9/page) | ✅ |
| `src/pages/NewsArticlePage.tsx` | Article complet avec slug | ✅ |

## Performance
- Lazy loading images (`loading="lazy"`) sur tous les composants
- Pagination serveur sur matchs (12/page) et news (9/page)
- Code splitting : chaque page et chaque composant UI sont des chunks séparés
- Squelettes de chargement (Skeleton) sur toutes les pages
- MatchsPage : filtres serveur (upcoming/finished/all paginé)

## Corrections post-audit
| NC | Correction | Commit |
|----|-----------|--------|
| NC-201 | MatchsPage : pagination serveur via `getAllMatches` / `getPastMatches` / `getUpcomingMatches` | `ea0c0ab` |
| NC-202 | Code mort supprimé : `getPlayerBySlug` retiré de `players.ts` | `ea0c0ab` |
| NC-203 | `supabase/migrations/001-004.sql` créé (4 tables + RLS + index) | `ea0c0ab` |
| NC-204 | `onError` fallback ajouté sur toutes les `<img>` (PlayerCard, StaffCard, NewsCard, NewsArticlePage) | `ea0c0ab` |
| ADR-012 | Décisions Sprint 2 documentées (pattern service, types, pagination, erreurs) | `ea0c0ab` |

## Validation
- ✅ Build : `npm run build` → OK (14 chunks, 1.58s)
- ✅ Données dynamiques depuis Supabase (players, matches, news, staff)
- ✅ Push GitHub : `ea0c0ab`

## Verdict
**GO** — Prêt pour le Sprint 3 (Administration CRUD + Tests).
