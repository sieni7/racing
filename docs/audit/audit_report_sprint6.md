# Audit Sprint 6

**Date** : 23 juillet 2026  
**Sprint audité** : Sprint 6 — Déploiement final, PWA et documentation utilisateur  
**Auditeur** : Agent AQA (Audit & Quality Assurance) — Forge AI v2  

## Résumé exécutif

Sprint 6 a livré 8 objectifs sur 8 : PWA (Service Worker Workbox + manifeste), tests e2e Playwright (3 projects, 9 tests), CI GitHub Actions (2 jobs), et 4 documents (README, admin-guide, deployment, RELEASE_NOTES). **3 non-conformités** sont détectées : icônes PNG du manifeste manquantes, credentials e2e hardcodés vulnérables à des fuites, et un test d'erreur auth qui ne peut jamais échouer (`.catch(() => {})` vide). Le projet est fonctionnel et complet, mais ces points doivent être corrigés avant la mise en production. Verdict : **GO avec réserves** — score **74/100**.

## Conformité des objectifs

| Objectif prévu | Livrable | Statut |
|----------------|----------|--------|
| PWA — Service Worker | `vite-plugin-pwa`, `dist/sw.js`, 32 entrées, 560 kB | ✅ Vérifié (`vite.config.ts`) |
| PWA — Manifeste | `manifest.json`, icône SVG, meta tags | ⚠ Partiel (icônes PNG manquantes) |
| Clés VAPID | `.env.example` + `.env.local` | ✅ Vérifié |
| Tests e2e Playwright | `navigation.spec.ts` (5) + `auth.spec.ts` (4), CI | ⚠ Partiel (credentials hardcodés, test catch vide) |
| Documentation | `README.md`, `admin-guide.md`, `deployment.md`, `RELEASE_NOTES.md` | ✅ Vérifié |
| CI/CD | Workflow GitHub Actions (build + test + e2e) | ✅ Vérifié |
| Build | `npm run build` OK | ✅ Déclaré |
| Tests unitaires | 25/25 pass | ✅ Déclaré |

## Architecture

**Verdict : WARNING**

Points vérifiés :
- `vite-plugin-pwa` intégré dans `vite.config.ts` avec Workbox — **conforme**
  - CacheFirst pour les assets statiques (globPatterns: `**/*.{js,css,html,ico,png,svg,...}`)
  - NetworkFirst pour les appels API Supabase (runtimeCaching)
  - Auto-update (registerType: 'autoUpdate')
- `playwright.config.ts` avec 3 projects (chromium, firefox, mobile) — **conforme**
- CI avec 2 jobs : `quality` (build + test) et `e2e` (Playwright chromium) — **conforme**

Non-conformités :
- **NC-601** — `public/manifest.json` référence `/icons/icon-192.png` et `/icons/icon-512.png` (lignes 14, 20) mais ces fichiers **n'existent pas** dans `public/icons/` (seul `icon.svg` est présent, confirmé par `Get-ChildItem`). Le manifeste PWA sera invalide pour les appareils qui ne supportent pas SVG dans les icônes.

- **NC-602** — Le fichier `public/manifest.json` (statique) est potentiellement en conflit avec le manifeste généré par la config `VitePWA` dans `vite.config.ts` (lignes 11-25), qui ne spécifie que `icon.svg`. Deux sources de vérité pour le manifeste.

## Qualité du code

**Verdict : WARNING**

Points vérifiés :
- `playwright.config.ts` : bonne configuration multi-navigateur, timeouts définis, artifacts sur échec — **conforme**
- `.github/workflows/ci.yml` : `actions/upload-artifact@v4` en cas d'échec e2e, retention 7 jours — **conforme**
- `docs/admin-guide.md` : couvre toutes les sections CRUD + push — **conforme**
- `docs/deployment.md` : instructions Supabase, Netlify, VAPID complètes — **conforme**
- `RELEASE_NOTES.md` : v1.0.0 complète — **conforme**

Non-conformités :
- **NC-603** — `e2e/auth.spec.ts` lignes 28-29 : credentials hardcodés (`admin2@racing-bingerville.ci` / `Admin2026!`). Risque de fuite dans un dépôt public (même si le compte est test). Devrait utiliser des variables d'environnement.

- **NC-604** — `e2e/auth.spec.ts` ligne 21 : `.catch(() => {})` vide. Si l'assertion `toBeVisible` échoue, l'erreur est silencieusement ignorée. Le test "connexion avec identifiants invalides affiche une erreur" **ne peut jamais échouer**, ce qui le rend inutile.

- **NC-605** — `e2e/auth.spec.ts` lignes 28-31 : les tests de connexion/déconnexion nécessitent un backend Supabase fonctionnel. Aucun mock ou fixture n'est configuré pour les e2e. Le job CI `e2e` échouera inévitablement sur ces tests.

## Dette technique

| Dette | Preuve | Impact | Criticité |
|-------|--------|--------|-----------|
| Icônes PNG manquantes dans manifest | `public/manifest.json` vs `public/icons/` | Installation PWA incomplète sur certains navigateurs | **Moyenne** |
| Credentials hardcodés dans tests e2e | `e2e/auth.spec.ts` lignes 28-29 | Fuite potentielle si dépôt public ; inutilisable sans backend | **Haute** |
| Test catch vide | `e2e/auth.spec.ts` ligne 21 | Faux positif permanent, donne une fausse confiance | **Haute** |
| Aucun test e2e pour admin CRUD | Seulement navigation + auth, pas de CRUD Gallery, Standings, Push | Couverture e2e insuffisante pour les fonctionnalités clés | **Moyenne** |

## Sécurité

**Verdict : PASS**

Points vérifiés :
- VAPID keys ajoutées dans `.env.example` (lignes 3-4) — **conforme**
- `.env.local` non versionné (gitignoré depuis Sprint 0) — **conforme**
- CSP et en-têtes sécurité déjà validés (Sprint 5) — **conforme**

Non vérifiable :
- Les clés VAPID réelles (`.env.local` est gitignoré).

## Performance

**Verdict : PASS**

Points vérifiés :
- Service Worker avec Workbox : CacheFirst pour les assets statiques — **conforme**
- NetworkFirst pour les appels API Supabase avec expiration (50 entrées, 1 jour) — **conforme**
- 32 entrées précachées (560 kB) — **conforme**

## Documentation

**Verdict : PASS**

Points vérifiés :
- `docs/admin-guide.md` : 54 lignes, couvre login, CRUD joueurs/matchs/news/staff, galerie, classement, push — **conforme**
- `docs/deployment.md` : 66 lignes, couvre Supabase, Netlify, VAPID, déploiement, vérification — **conforme**
- `RELEASE_NOTES.md` : 38 lignes, v1.0.0 complète — **conforme**
- `README.md` : mis à jour — **conforme**
- `docs/sprint-reports/sprint-6-report.md` : présent — **conforme**

## Risques

| Risque | Cause | Conséquence | Criticité |
|--------|-------|-------------|-----------|
| Échec CI e2e en permanence | Tests auth dépendent d'un backend Supabase réel | Le badge CI sera rouge, masquant les vraies régressions | **Haute** |
| Faux positif test auth error | `.catch(() => {})` vide | L'équipe pense que le test d'erreur passe ; couverture réelle = 0 | **Haute** |
| Credentials exposés | Hardcodés dans `e2e/auth.spec.ts` | Compte de test compromis si dépôt public | **Moyenne** |
| PWA non installable | Icônes PNG manquantes dans le manifest | Les utilisateurs sur certains navigateurs ne peuvent pas installer la PWA | **Moyenne** |

## Non-conformités

1. **NC-601** — Icônes PNG (`icon-192.png`, `icon-512.png`) manquantes dans `public/icons/` mais référencées dans `public/manifest.json`.
2. **NC-602** — `public/manifest.json` statique en conflit potentiel avec le manifeste généré par `VitePWA` (deux sources de vérité).
3. **NC-603** — Credentials hardcodés dans `e2e/auth.spec.ts` (lignes 28-29).
4. **NC-604** — `.catch(() => {})` vide dans `e2e/auth.spec.ts` ligne 21 — test inutile.
5. **NC-605** — Tests e2e auth dépendent d'un backend Supabase réel sans mock — échoueront en CI.
6. **NC-606** — Aucun test e2e pour les routes admin CRUD (gallery, standings, push).

## Recommandations

1. **Critique** — Remplacer les credentials hardcodés par des variables d'environnement (`process.env.TEST_EMAIL`, `process.env.TEST_PASSWORD`) et documenter leur configuration dans un fichier `.env.test`.
2. **Critique** — Ajouter un mock Supabase pour les tests e2e (via `page.route()` ou un worker MSW) ou configurer un projet Supabase de test dédié avec seed data.
3. **Haute** — Remplacer `.catch(() => {})` par une assertion explicite : utiliser `await expect(page.locator(...)).toBeVisible({ timeout: 10000 })` sans catch, ou gérer les alternatives avec un `or()`.
4. **Haute** — Générer les icônes PNG (192x192, 512x512) à partir de l'icône SVG et les placer dans `public/icons/`. Harmoniser `public/manifest.json` avec la config `VitePWA` dans `vite.config.ts`.
5. **Moyenne** — Ajouter des tests e2e pour au moins un CRUD admin complet (création joueur → modification → suppression).
6. **Moyenne** — Ajouter un test e2e pour l'endpoint `/api/health`.

## Score détaillé

| Domaine | Score |
|----------|------:|
| Architecture | 7/10 |
| Qualité | 6/10 |
| Sécurité | 6/10 |
| Documentation | 9/10 |
| Maintenabilité | 7/10 |
| Dette technique | 6/10 |
| **Score global** | **74/100** |

## Verdict

**GO avec réserves**

## Conclusion

Sprint 6 finalise le projet avec une PWA complète, des tests e2e multi-navigateur, une CI/CD automatisée, et une documentation exhaustive. Cependant, les tests e2e contiennent des credentials hardcodés et un test qui ne peut pas échouer (`.catch(() => {})` vide), ce qui compromet la fiabilité du pipeline CI. L'installation PWA sera incomplète sans les icônes PNG manquantes. Le projet est prêt pour la mise en production **après correction des 2 recommandations critiques** (credentials → variables d'env, mock Supabase ou fixture de test).
