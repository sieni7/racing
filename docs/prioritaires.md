# 🧹 Actions prioritaires — Racing Club de Bingerville (version allégée)

> Club naissant (1 an) — Site vitrine + admin léger. Pas de billetterie, pas de boutique, pas de paiement.

---

## 🔵 Niveau 1 — Réglages & ménage (1 journée)

| # | Tâche | Effort | Détail |
|---|-------|--------|--------|
| 1 | Tester le déploiement Netlify | 15 min | Vérifier que le dernier push est bien déployé et les erreurs 400/404 ont disparu |
| 2 | Changer le JWT secret Supabase | 5 min | Dashboard → Settings → API → JWT Secret (générer un nouveau) |
| 3 | Supprimer le code mort | 30 min | `AdminTable.tsx`, `AdminForm.tsx` (~494 lignes inutilisées) |
| 4 | Configurer la couverture de tests | 30 min | Ajouter thresholds dans `vitest.config.ts` |
| 5 | Bouton retour en haut dans l'admin | 30 min | Ajouter `ScrollToTop` dans `AdminLayout.tsx` (déjà présent en public) |
| 6 | Mettre à jour `admin-guide.md` | 30 min | Ajouter la doc des nouveaux composants DataTable/FormBuilder |

**Total Niveau 1** : ~2,5h

---

## 🟢 Niveau 2 — Accessibilité & UX (1,5 jour)

| # | Tâche | Effort | Détail |
|---|-------|--------|--------|
| 7 | Respect `prefers-reduced-motion` | 30 min | `useReducedMotion()` de framer-motion dans `ModalWrapper.tsx` |
| 8 | Indicateurs de raccourcis clavier | 30 min | Afficher "(Esc)" et "(Entrée)" dans les modales |
| 9 | Spinner sur bouton ConfirmModal | 30 min | Ajouter `animate-spin` à côté du texte "Suppression..." |
| 10 | Accessibilité `aria-live` sur les modales | 1h | Annoncer l'ouverture/fermeture des dialogues |
| 11 | Tests UI (Button, PlayerCard, MatchCard, Skeleton) | 3h | 4 fichiers test avec mocks des contextes |
| 12 | Scroll position restoration | 1h | Sauvegarder/restaurer `window.scrollY` quand les modales bloquent le scroll |

**Total Niveau 2** : ~6,5h

---

## 🟡 Niveau 3 — Refactoring & architecture (2,5 jours)

| # | Tâche | Effort | Détail |
|---|-------|--------|--------|
| 13 | Wrapper API centralisé (A-002) | 4h | Créer `api-client.ts` avec toasts d'erreur automatiques |
| 14 | Extraire DataTable (A-005) | 4h | Découper les 323 lignes en sous-composants (Header, Row, Pagination, Search) |
| 15 | Validation client FormBuilder (A-020) | 4h | Validation champs sans librairie externe |
| 16 | Lightbox galerie → ModalWrapper | 3h | Remplacer le lightbox inline par `<ModalWrapper>` |
| 17 | Gestion de pile pour modales imbriquées | 2h | Compteur global `modalStack` pour éviter les doubles backdrops |
| 18 | Undo toast après suppression | 3h | Soft-delete (`is_active=false`) + toast avec bouton "Annuler" + hard-delete après 5s |
| 19 | Error boundaries par page | 3h | Un ErrorBoundary par page publique et admin |
| 20 | Paths alias TypeScript | 1h | Configurer `@/` dans `tsconfig.json` → `@/components/`, `@/lib/`, etc. |
| 21 | Top scorers dynamiques | 3h | Lier les meilleurs buteurs de la page d'accueil à Supabase (via `player_stats`) |

**Total Niveau 3** : ~27h (3,5 jours)

---

## 🟠 Niveau 4 — Optimisations & outils (2 jours)

| # | Tâche | Effort | Détail |
|---|-------|--------|--------|
| 22 | Analyse du bundle (visualizer) | 2h | `rollup-plugin-visualizer` — identifier les gros chunks |
| 23 | Sitemap dynamique | 3h | `vite-plugin-sitemap` — générer automatiquement avec les URLs publiques |
| 24 | Images optimisées (WebP/AVIF) | 4h | Configurer Supabase Image Transformations : `?width=400&format=webp` |
| 25 | Auto-refresh des données après fermeture | 2h | Callback `onAfterClose` dans ModalWrapper → rafraîchir les listes |
| 26 | Analytics (Plausible/Umami) | 2h | Installation légère, pas de cookie wall |
| 27 | GitHub Actions CI | 3h | Pipeline lint + test + build sur chaque PR/push |
| 28 | Recherche globale (Fuse.js) | 4h | Barre de recherche dans le header — joueurs, articles, matchs |

**Total Niveau 4** : ~20h (2,5 jours)

---

## ❌ Supprimé (hors scope club naissant)

| Fonctionnalité | Raison |
|----------------|--------|
| Billetterie en ligne | Le club n'a pas de billetterie à gérer (stade amateur) |
| Boutique en ligne | Pas de produits dérivés à vendre dans l'immédiat |
| Stripe / PayDunya | Pas de paiement en ligne |
| Newsletter (SendGrid) | Pas de base de données abonnés, pas de besoin marketing |
| i18n (anglais/français) | Le club est ivoirien, uniquement français |
| Suivi live des matchs | Trop avancé pour un club de 1 an (se contenter des résultats après match) |
| Pages individuelles des joueurs (SEO) | Pas prioritaire — les joueurs changent souvent |
| Rate limiting formulaire | Le formulaire de contact n'existe pas encore (on le crée quand il sera utilisé) |
| Sentry monitoring | Peut être ajouté plus tard, pas essentiel pour le lancement |
| Drag vertical pour fermer la galerie | Bonus, pas critique |

---

## 📅 Planning réaliste (3 semaines)

| Semaine | Focus | Tâches |
|---------|-------|--------|
| **Semaine 1** | Niveau 1 + Niveau 2 | Tâches 1 à 12 (sauf doc) |
| **Semaine 2** | Niveau 3 (refactoring) | Tâches 13 à 21 |
| **Semaine 3** | Niveau 4 (optimisations) | Tâches 22 à 28 |
| **Post‑lancement** | — | Mise à jour `admin-guide.md` et documentation si nécessaire |

---

## 📋 Synthèse des livrables

| Livrable | Statut |
|----------|--------|
| Build passe | ✅ |
| Tests unitaires passent | ⏳ (à compléter avec A-011) |
| Tests e2e configurés | ⏳ (A-012 + A-013) |
| Code mort supprimé | ⏳ |
| Wrapper API + toasts | ⏳ |
| DataTable refactorée | ⏳ |
| Validation client FormBuilder | ⏳ |
| Images optimisées | ⏳ |
| Sitemap dynamique | ⏳ |
| GitHub Actions CI | ⏳ |
| Recherche globale | ⏳ (bonus) |

---

## 🧠 Recommandation finale

- **Priorité absolue** : Niveau 1 (ménage) + Niveau 2 (accessibilité/UX) → ce sont des corrections à faible risque qui améliorent immédiatement la perception du site.
- **Refactoring Niveau 3** : à faire en 2e semaine, mais avec des **tests manuels sur chaque page admin** après chaque modification.
- **Optimisations Niveau 4** : à faire en 3e semaine, en parallèle de la rédaction de la documentation finale.
- **Documentation** : à rédiger en continu, pas en fin de projet.

**Le site sera prêt pour une vitrine professionnelle en 3 semaines, sans fonctionnalités inutiles.**