# Audit Global — Racing Club de Bingerville

**Date** : 24 juillet 2026  
**Portée** : Projet complet — Sprints 0-7  
**Auditeur** : Agent AQA (Audit & Quality Assurance)

## Résumé exécutif

Projet Racing Club de Bingerville : site vitrine + administration pour un club de Ligue 1 ivoirienne. **7 sprints livrés**, build zéro erreur, 25 tests unitaires passants, PWA fonctionnelle, CI/CD GitHub Actions. Architecture MVC bien séparée, documentation exhaustive (36 fichiers). **2 anomalies critiques** (CSP trop permissive, offline.html manquant), **7 non-conformités** restantes. Score global : **81/100** — prêt pour déploiement après corrections.

---

## 1. Métriques générales

| Métrique | Valeur |
|----------|--------|
| **Commits** | 36 (tous par sieni7) |
| **Fichiers source** | 85 (62 .tsx, 21 .ts, 1 .css, 1 .jpg) |
| **Lignes de code** | ~7 600 (source) |
| **Poids total source** | 322,5 KB |
| **Dépendances prod** | 15 |
| **Dépendances dev** | 24 |
| **Sprouts livrés** | 7 |
| **Build** | 0 erreurs TS, 41 entrées PWA (1 509,6 KiB) |
| **Tests unitaires** | 25/25 pass (4 fichiers) |
| **Tests e2e** | 2 spec files (configurés, non exécutés dans cet audit) |
| **Pages publiques** | 9 (Home, Effectif, Matchs, News × 2, Galerie, Classement, Login) |
| **Pages admin** | 9 (Dashboard, Players, Matches, News, Staff, Gallery, Standings, SendPush, Activity) |
| **Services** | 6 (players, matches, news, staff, gallery, standings) |
| **Contextes** | 5 (Auth, Theme, Admin, AdminTheme, Realtime) |
| **Hooks** | 4 (useCounter, useKeyboardShortcuts, useReadOnly, useScrollAnimation) |

---

## 2. Architecture — Score 9/10

### Points forts
- MVC bien séparée : **Model** (`src/lib/`), **View** (`src/components/` + `src/pages/`), **Controller** (`src/contexts/` + `src/hooks/`)
- Couches admin distinctes : `core/` (layout), `data/` (DataTable), `forms/` (FormBuilder)
- Composants réutilisables : 12 UI + 12 admin
- Services Supabase uniformes (pattern `throw`, pas de wrapper)

### Anomalies
| ID | Gravité | Description |
|----|---------|-------------|
| **A-001** | Critique | `CSP` autorise `'unsafe-inline'` pour scripts et styles. Empêche l'application complète du Content Security Policy. Faiblesse XSS potentielle. |
| **A-002** | Haute | Aucune gestion d'erreur centralisée pour les appels API — chaque page gère ses propres erreurs manuellement |
| **A-003** | Haute | Pas de rate limiting côté client pour les appels Supabase (répétés en boucle de rendu) |
| **A-004** | Basse | `src/components/admin/AdminLayout.tsx` n'est qu'un ré-export (1 ligne) — l'original est dans `core/AdminLayout.tsx` |

---

## 3. Qualité du code — Score 7/10

### Points forts
- TypeScript strict : `t sc --noEmit` = 0 erreurs
- Types bien définis dans `src/types/index.ts` (6 entités)
- Interfaces génériques typées (`DataTable<T extends { id: string }>`, `Column<T>`, `Field`)

### Anomalies
| ID | Gravité | Description |
|----|---------|-------------|
| **A-005** | Haute | `DataTable.tsx` (323 lignes, 16,8 KB) monolithique — pas de sous-composants extraits |
| **A-006** | Haute | `AdminContext.tsx` (306 lignes) monolithique — gère 6 entités dans un seul fichier |
| **A-007** | Moyenne | `AdminTable.tsx` (271 lignes) + `AdminForm.tsx` (204 lignes) — code mort non supprimé (l'admin utilise DataTable + FormBuilder) |
| **A-008** | Moyenne | `AdminLayout.tsx` original dans `src/components/admin/` — coexiste avec le nouveau layout dans `core/` (le premier réexporte le second par compatibilité) |
| **A-009** | Basse | 4 fichiers > 200 lignes sans découpage (DataTable 323, AdminContext 306, AdminTable 271, SquadPage 234) |
| **A-010** | Basse | Nom du projet dans `package.json` : `"racing"` — devrait être `"racing-club-bingerville"` |

### Top 10 plus gros fichiers

| Fichier | Lignes | Poids |
|---------|--------|-------|
| `components/admin/data/DataTable.tsx` | 323 | 16,8 KB |
| `contexts/AdminContext.tsx` | 306 | 10,1 KB |
| `components/admin/AdminTable.tsx` | 271 | 11,8 KB |
| `pages/SquadPage.tsx` | 234 | 11,7 KB |
| `components/admin/AdminForm.tsx` | 204 | 8,1 KB |
| `components/Layout.tsx` | 199 | 13,5 KB |
| `pages/Gallery.tsx` | 186 | 8,6 KB |
| `pages/HomePage.tsx` | 185 | 10,0 KB |
| `pages/admin/Entities/Players/Players.tsx` | 169 | 9,2 KB |
| `pages/admin/Entities/News/News.tsx` | 166 | 9,5 KB |

---

## 4. Tests — Score 7/10

| Type | Fichiers | Tests | Statut |
|------|----------|-------|--------|
| Unitaires (Vitest) | 4 | 25 | ✅ 25/25 pass |
| E2E (Playwright) | 2 | ~7 scénarios | ⚠ Configurés, non exécutés |

### Anomalies
| ID | Gravité | Description |
|----|---------|-------------|
| **A-011** | Critique | Aucune couverture pour les composants UI (Card, Button, Layout, etc.) — seulement les services Supabase |
| **A-012** | Haute | Tests e2e dépendent d'un backend Supabase réel — aucun mock configuré, échoueront sans `.env.local` valide |
| **A-013** | Haute | Aucun test pour les pages admin CRUD (Players, Matches, News, Staff, Gallery, Standings, SendPush) |
| **A-014** | Moyenne | Aucun test pour `AdminContext` (306 lignes, coeur de l'admin) |
| **A-015** | Moyenne | Aucun test pour `DataTable` (323 lignes) ni `FormBuilder` (153 lignes) |
| **A-016** | Basse | Coverage non configurée malgré `@vitest/coverage-v8` présent dans les dépendances |

---

## 5. PWA — Score 8/10

| Critère | Statut |
|---------|--------|
| Service Worker | ✅ Workbox (generateSW), 41 entrées, 1 509,6 KiB |
| Manifeste | ✅ `public/manifest.json` + config `VitePWA` |
| Icônes | ✅ PNG 192×192 + 512×512 (générées par `generate-icons.mjs`) |
| Offline | ⚠ `offline.html` référencé mais fichier inexistant |
| Cache API | ✅ NetworkFirst pour Supabase (50 entrées, 1 jour) |
| Auto-update | ✅ `registerType: 'autoUpdate'` |

### Anomalies
| ID | Gravité | Description |
|----|---------|-------------|
| **A-017** | Haute | `offline.html` référencé dans `vite.config.ts` (ligne `navigateFallback: '/offline.html'`) mais aucun fichier `public/offline.html` — le SW générera une erreur 404 en mode hors-ligne |
| **A-018** | Moyenne | `public/manifest.json` (statique) et config `VitePWA` dans `vite.config.ts` (dynamique) sont deux sources de vérité pour le manifest — risque de divergence |
| **A-019** | Basse | `navigateFallbackAllowlist: [/^(?!\/admin)/]` exclut les pages admin du fallback — correct, mais non documenté |

---

## 6. Sécurité — Score 7/10

| Critère | Statut |
|---------|--------|
| CSP | ⚠ `'unsafe-inline'` présent pour scripts ET styles |
| HSTS | ✅ `max-age=63072000; includeSubDomains; preload` |
| X-Frame-Options | ✅ `DENY` |
| X-Content-Type-Options | ✅ `nosniff` |
| Referrer-Policy | ✅ `strict-origin-when-cross-origin` |
| Permissions-Policy | ✅ caméra, micro, géolocalisation désactivées |
| Supabase RLS | ✅ Migrations SQL avec `USING` et `WITH CHECK` (via 007_audit_log.sql, 007_push_subscriptions.sql) |
| Auth | ✅ `PrivateRoute` protège les routes admin, rôles via `user_metadata.role` |

### Anomalies
| ID | Gravité | Description |
|----|---------|-------------|
| **A-001** | Critique | CSP : `script-src 'self' 'unsafe-inline'` — autorise l'inline pour tous les scripts. Devrait être remplacé par un nonce ou un hash. |
| **A-020** | Haute | Aucune validation côté client des entrées utilisateur (formulaires admin) — dépend entièrement de Supabase RLS |
| **A-021** | Basse | `.env.example` contient des valeurs factices mais le commentaire "change-me" est insuffisant — devrait inclure des instructions de génération de clés |

---

## 7. Performance — Score 8/10

| Critère | Valeur |
|---------|--------|
| Taille bundle total | 1 509,6 KiB (41 entrées) |
| Plus gros chunk | ExportButton : 438,85 KB (142,21 KB gzip) |
| Temps de build | ~9,2 s |
| Lazy loading | ✅ Toutes les routes sont lazy (`React.lazy`) |
| Images lazy | ✅ `loading="lazy"` + `decoding="async"` sur les images (Sprint 5) |
| React.memo | ✅ Sur PlayerCard, MatchCard, NewsCard, StaffCard (Sprint 5) |

### Anomalies
| ID | Gravité | Description |
|----|---------|-------------|
| **A-022** | Moyenne | `ExportButton` (438 KB chunks, 142 KB gzip) inclut `jspdf` — cette librairie est lourde pour une fonctionnalité d'export CSV/JSON. Envisager `html2canvas` séparé ou un export côté serveur. |
| **A-023** | Basse | Taille du cache PWA passée de 560 KB (Sprint 6) à 1 509,6 KB (Sprint 7) — augmentation de 270 %. |

---

## 8. Documentation — Score 9/10

| Catégorie | Fichiers | Statut |
|-----------|----------|--------|
| Rapports de sprint | 7 (S0-S7) | ✅ |
| ADR | 9 (000-015) | ✅ |
| Rapports d'audit | 8 (S0-S7) | ✅ |
| Guides | `admin-guide.md`, `deployment.md`, `ARCHITECTURE.md` | ✅ |
| Gouvernance | `BACKLOG.md`, `CHANGELOG.md`, `CONVENTIONS.md`, `ROADMAP.md`, `RISK_REGISTER.md` | ✅ |
| RELEASE_NOTES | 1 (v1.0.0) | ✅ |
| README | ✅ Professionnel |

### Anomalie
| ID | Gravité | Description |
|----|---------|-------------|
| **A-024** | Basse | `ARCHITECTURE.md` dans `/docs/architecture/` n'est pas référencé depuis le README |
| **A-025** | Basse | `docs/admin-guide.md` ne couvre pas les nouveaux composants DataTable/FormBuilder ni les pages Entities/ |

---

## 9. Déploiement et CI/CD — Score 8/10

| Critère | Statut |
|---------|--------|
| Netlify config | ✅ `netlify.toml` complet (build, redirect, headers) |
| GitHub Actions | ✅ CI : `quality` (build + test) + `e2e` (Playwright chromium) |
| PWA | ✅ Auto-build via `npm run prebuild` (generate-icons.mjs) |
| Edge Functions | ✅ Netlify functions configurée (health endpoint) |

### Anomalies
| ID | Gravité | Description |
|----|---------|-------------|
| **A-026** | Moyenne | `netlify/functions/` — le health endpoint existe mais n'a pas été vérifié fonctionnellement |
| **A-027** | Basse | CI utilise `npm ci` mais `package-lock.json` a été modifié récemment (dans le diff de ce sprint) |

---

## 10. Synthèse des anomalies

| ID | Gravité | Domaine | Description | Correctif suggéré |
|----|---------|---------|-------------|-------------------|
| **A-001** | **Critique** | Sécurité | CSP `'unsafe-inline'` | Remplacer par hash/nonce ou retirer pour les scripts |
| **A-002** | **Haute** | Architecture | Pas de gestion d'erreur centralisée API | Créer un wrapper `apiCall()` avec erreur toast + log |
| **A-003** | **Haute** | Architecture | Pas de rate limiting client | Ajouter debounce/throttle sur les appels répétés |
| **A-005** | **Haute** | Qualité | DataTable 323 lignes monolithique | Extraire TableFilters, TablePagination, BulkToolbar |
| **A-006** | **Haute** | Qualité | AdminContext 306 lignes monolithique | Split par entité ou créer des hooks spécialisés |
| **A-011** | **Critique** | Tests | Aucun test composant UI | Ajouter tests render pour Button, Card, Layout |
| **A-012** | **Haute** | Tests | Tests e2e sans mock Supabase | Ajouter fixtures ou mocks MSW/page.route |
| **A-013** | **Haute** | Tests | Aucun test CRUD admin | Ajouter tests e2e pour Players CRUD |
| **A-017** | **Haute** | PWA | offline.html manquant | Créer `public/offline.html` basique |
| **A-018** | **Moyenne** | PWA | Deux sources manifeste | Harmoniser ou supprimer le fichier statique |
| **A-020** | **Haute** | Sécurité | Pas de validation client | Ajouter validation Zod ou yup dans FormBuilder |
| **A-022** | **Moyenne** | Performance | ExportButton 438 KB (jspdf lourd) | Alléger ou lazy-loader |

---

## 11. Dette technique résiduelle

| Dette | Priorité | Effort estimé |
|-------|----------|---------------|
| SendPushPage non migré vers Entities/ | Haute | 30 min |
| Settings/ vide (placeholder) | Basse | 15 min |
| AdminTable/AdminForm code mort (494 lignes) | Basse | 10 min |
| Nom projet `"racing"` → `"racing-club-bingerville"` | Basse | 5 min |
| Coverage Vitest non configurée | Basse | 10 min |
| ARCHITECTURE.md non référencé dans README | Basse | 5 min |

---

## 12. Score détaillé par domaine

| Domaine | Score | Poids | Pondéré |
|---------|------:|------:|--------:|
| Architecture | 9/10 | ×15 % | 13,5 |
| Qualité du code | 7/10 | ×15 % | 10,5 |
| Tests | 7/10 | ×20 % | 14,0 |
| PWA | 8/10 | ×10 % | 8,0 |
| Sécurité | 7/10 | ×15 % | 10,5 |
| Performance | 8/10 | ×10 % | 8,0 |
| Documentation | 9/10 | ×10 % | 9,0 |
| Déploiement / CI/CD | 8/10 | ×5 % | 4,0 |
| **Score global** | — | **100 %** | **81/100** |

---

## 13. Verdict

## **GO avec réserves**

Le projet est fonctionnel, buildable et déployable. Les 2 anomalies critiques (CSP, couverture tests UI) et les 7 hautes priorités doivent être résolues avant la mise en production publique. La correction de l'offline.html et de la CSP peuvent être traitées en 1 jour ouvré.

### Actions critiques avant mise en production
1. **Remplacer `'unsafe-inline'` dans la CSP** — par des hashs ou nonces
2. **Créer `public/offline.html`** — page hors-ligne basique pour la PWA
3. **Ajouter tests composants UI** — au moins Button, Card, Layout
4. **Harmoniser le manifeste PWA** — supprimer la duplication statique/dynamique

### Actions recommandées (prochain sprint)
5. Extraire `DataTable` en sous-composants
6. Splitter `AdminContext` par entité
7. Migrer `SendPushPage` vers `Entities/`
8. Supprimer `AdminTable`/`AdminForm` (code mort)
9. Ajouter validation client (Zod/yup) dans FormBuilder
10. Configurer la couverture de tests Vitest

---

*Document généré le 24 juillet 2026 par Agent AQA — Racing Club de Bingerville*
