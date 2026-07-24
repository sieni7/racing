# Prompts Opérationnels — Phases 1-3

Instructions : copiez-collez chaque bloc dans l'agent IA (OpenCode/Continue). Les prompts sont autonomes et contiennent tous les chemins et détails techniques nécessaires.

---

## 📌 Phase 1 — Urgent (avant mise en production)

### Prompt 1.1 : CSP (A-001)

```markdown
Corriger la CSP dans `netlify.toml` pour le projet Racing Club de Bingerville.

Contexte :
- Stack : React 19 + Vite 8 + Tailwind CSS 3
- Tailwind génère des styles inline, Framer Motion aussi
- Le script build Vite génère des bundles hashés externes
- Netlify gère les en-têtes HTTP

Actions :
1. Ouvrir `netlify.toml`
2. Modifier `Content-Security-Policy` :
   - `script-src 'self'` — Vite n'utilise pas d'inline scripts en prod (les bundles sont externalisés)
   - `style-src 'self' 'unsafe-inline'` — conserver unsafe-inline pour les styles Tailwind dynamiques
   - Conserver le reste inchangé (img-src, connect-src, font-src, etc.)
3. Créer un script de test `test-csp.mjs` dans la racine qui :
   - Fait une requête HTTP sur le site déployé (ou localhost:8888 avec netlify dev)
   - Vérifie que l'en-tête Content-Security-Policy est présent
   - Vérifie que 'unsafe-inline' n'apparaît PAS dans script-src
   - Vérifie que 'unsafe-inline' apparaît BIEN dans style-src
4. Ajouter `node test-csp.mjs` comme script npm `test:csp` dans `package.json`

Vérification :
- `npm run build` — doit passer
- Lancer `netlify dev` (si dispo) et vérifier les headers avec curl ou un navigateur
- Ne PAS casser le rendu des composants Tailwind

Fichier cible : `netlify.toml`
```

### Prompt 1.2 : offline.html (A-017)

```markdown
Créer une page hors-ligne basique pour la PWA du projet Racing Club de Bingerville.

Contexte :
- La config VitePWA dans `vite.config.ts` référence `navigateFallback: '/offline.html'`
- Ce fichier n'existe pas dans `public/` — le SW générera une 404 en mode hors-ligne

Actions :
1. Créer `public/offline.html`
2. Contenu : page HTML minimale mais complète :
   - Langue française
   - Meta viewport responsive
   - Theme-color orange (#F97316) pour la barre navigateur
   - Icône SVG de l'application (/icons/icon.svg) en favicon
   - Titre : "Hors ligne — Racing Club de Bingerville"
   - Message centré : "Vous êtes hors ligne" avec l'icône SVG du club
   - Sous-titre : "Revenez quand vous serez connecté·e"
   - Bouton "Réessayer" qui appelle `window.location.reload()`
   - Style inline (pas de CSS externe, on est hors ligne) : fond orange, texte blanc, centré verticalement
3. Ne pas référencer de fichiers externes (JS, CSS, images) — tout en inline

Fichier à créer : `public/offline.html`
```

### Prompt 1.3 : Harmoniser le manifeste (A-018)

```markdown
Harmoniser le manifeste PWA du projet Racing Club de Bingerville pour supprimer la double source de vérité.

Contexte :
- Deux sources définissent le manifeste :
  1. `public/manifest.json` (fichier statique) — référence icon-192.png et icon-512.png
  2. Config `VitePWA` dans `vite.config.ts` — ne référence que icon.svg
- Pendant le build, `npm run prebuild` (scripts/generate-icons.mjs) génère les PNG

Actions :
1. Ouvrir `public/manifest.json`
2. Ajouter les mêmes champs que la config VitePWA dans vite.config.ts :
   - `start_url: "/"`
   - `display: "standalone"`
   - `orientation: "portrait"`
   - `theme_color: "#F97316"`
   - `background_color: "#ffffff"`
   - `categories: ["sports", "football"]`
   - `lang: "fr"`
3. Conserver les icônes PNG (192 et 512) — elles sont générées par le build
4. Ajouter l'icône SVG en complément avec `purpose: "any"`
5. Ouvrir `vite.config.ts` et aligner la config VitePWA sur le même manifeste :
   - Ajouter les mêmes icônes PNG dans la config VitePWA
   - Pour que les deux sources soient identiques, ou
6. Supprimer la section `manifest` de la config VitePWA (elle utilisera le fichier statique)
   - Vérifier que `includeAssets: ['icons/icon.svg', 'manifest.json']` est présent

Vérification :
- `npm run build` — doit passer
- Vérifier que seul un manifeste est servi (pas de conflit)

Fichiers : `public/manifest.json`, `vite.config.ts`
```

### Prompt 1.4 : Tests composants UI (A-011)

```markdown
Ajouter des tests de rendu pour les composants UI du projet Racing Club de Bingerville.

Contexte :
- Test runner : Vitest v4
- Bibliothèque : @testing-library/react + @testing-library/jest-dom
- 25 tests existent déjà pour les services (src/__tests__/)
- Les composants UI sont dans src/components/ui/
- Contexte nécessaire : ThemeContext (pour dark mode)

Actions :
1. Créer `src/__tests__/components/Button.test.tsx` :
   - Teste le rendu avec des variantes (primary, secondary, danger)
   - Teste le clic via userEvent
   - Vérifie que le texte children est affiché
   - Vérifie que les attributs aria sont présents
   - Wrapper avec ThemeProvider (importer depuis src/contexts/ThemeContext)

2. Créer `src/__tests__/components/PlayerCard.test.tsx` :
   - Teste le rendu avec un player mock (type Player depuis src/types)
   - Vérifie le nom, le numéro, le poste
   - Vérifie que l'image a loading="lazy" (Sprint 5)

3. Créer `src/__tests__/components/MatchCard.test.tsx` :
   - Teste le rendu avec un match mock (type Match depuis src/types)
   - Vérifie le score, le statut, le nom de l'adversaire

4. Créer `src/__tests__/components/Skeleton.test.tsx` :
   - Teste le rendu des variantes CardSkeleton et ListSkeleton
   - Vérifie la présence de la classe animate-pulse

5. Mocker les imports Supabase dans chaque test (les composants n'utilisent pas Supabase directement, mais les services oui — ne pas les importer)

Vérification :
- `npm test` — les nouveaux tests doivent passer
- `npx tsc --noEmit` — pas d'erreur de type

Fichiers à créer : `src/__tests__/components/Button.test.tsx`, `src/__tests__/components/PlayerCard.test.tsx`, `src/__tests__/components/MatchCard.test.tsx`, `src/__tests__/components/Skeleton.test.tsx`
```

---

## 📌 Phase 2 — Haute priorité

### Prompt 2.1 : Extraire DataTable (A-005)

```markdown
Refactorer DataTable (323 lignes) en sous-composants pour le projet Racing Club de Bingerville.

Contexte :
- DataTable est dans `src/components/admin/data/DataTable.tsx`
- C'est un fichier monolithique de 323 lignes/16,8 KB
- Utilisé par 6 pages admin dans Entities/
- Interface : `DataTable<T extends { id: string }>` avec `Column<T>`

Actions :
1. Créer `src/components/admin/data/DataTableFilters.tsx` :
   - Props : searchValue, onSearchChange, searchPlaceholder
   - Barre de recherche avec icône
   - Exporté (named export)

2. Créer `src/components/admin/data/DataTablePagination.tsx` :
   - Props : currentPage, totalPages, onPageChange, itemsPerPage, totalItems
   - Boutons précédent/suivant + indicateur de page
   - Affiche "X à Y sur Z éléments"

3. Créer `src/components/admin/data/BulkToolbar.tsx` :
   - Props : selectedIds (Set<string>), onBulkDelete, onClearSelection
   - Affiche "N sélectionné(s)"
   - Bouton "Supprimer" + "Annuler"

4. Créer `src/components/admin/data/DataTableSkeleton.tsx` :
   - Props : rows (number, default 5), columns (number, default 4)
   - Grille de skeletons avec classe animate-pulse

5. Refactorer `DataTable.tsx` :
   - Importer et utiliser les 4 sous-composants ci-dessus
   - Garder l'interface DataTableProps et le nom DataTable inchangés
   - Les imports existants (`import { DataTable } from '...'`) ne doivent pas casser
   - Exporter aussi les sous-composants depuis DataTable.tsx

Vérification :
- `npx tsc --noEmit` — 0 erreurs
- `npm run build` — 0 erreurs
- `npm test` — 25/25 pass
- Vérifier qu'aucun import existant n'est cassé

Fichiers :
- Créer : `src/components/admin/data/DataTableFilters.tsx`, `DataTablePagination.tsx`, `BulkToolbar.tsx`, `DataTableSkeleton.tsx`
- Modifier : `src/components/admin/data/DataTable.tsx`
```

### Prompt 2.2 : Validation client FormBuilder (A-020)

```markdown
Ajouter la validation côté client dans FormBuilder du projet Racing Club de Bingerville.

Contexte :
- FormBuilder dans `src/components/admin/forms/FormBuilder.tsx`
- Interface Field : name, label, type, options, suggestions, placeholder, required, dependsOn
- Aucune validation n'est appliquée côté client (dépend entièrement de Supabase)

Actions :
1. Ouvrir `src/components/admin/forms/FormBuilder.tsx`
2. Créer un validateur interne sans bibliothèque externe (pour éviter une dépendance) :
   - `validateField(field, value)` retourne string | null
   - Validation selon le type :
     - required=true et value vide → message d'erreur
     - type=email et format non valide → message d'erreur
     - type=number et NaN → message d'erreur
     - type=number et valeur négative (si min spécifié via un nouveau champ optionnel)
     - type=date et date invalide → message d'erreur
   - Ajouter `validate?: (value: any) => string | null` optionnelle dans Field pour validation custom
3. Ajouter `min?: number` et `max?: number` optionnels dans Field interface pour les bornes numériques
4. Dans le FormBuilder :
   - Appeler le validateur sur chaque champ au blur
   - Montrer les erreurs sous chaque champ (texte rouge, petite taille)
   - Bloquer la soumission si des erreurs existent
   - Ne pas valider les champs masqués (dependsOn non rempli)
5. Ne pas ajouter de dépendance externe (Zod, yup) — garder zéro dépendance supplémentaire

Vérification :
- `npx tsc --noEmit` — 0 erreurs
- `npm test` — 25/25 pass
- Tester manuellement : soumettre un formulaire avec un champ vide required doit bloquer

Fichier : `src/components/admin/forms/FormBuilder.tsx`
```

### Prompt 2.3 : Wrapper API centralisé (A-002)

```markdown
Créer un wrapper API centralisé avec gestion d'erreur pour le projet Racing Club de Bingerville.

Contexte :
- Actuellement chaque page gère ses propres erreurs manuellement avec try/catch
- On veut un wrapper qui centralise logs + toasts
- Services dans src/lib/ (players, matches, news, staff, gallery, standings)
- Toast library : react-hot-toast

Actions :
1. Créer `src/lib/api-client.ts` :
   - Exporter `async function apiCall<T>(fn: () => Promise<T>, options?: { silent?: boolean }): Promise<T>`
   - Fonctionnement :
     - Exécute fn() (n'importe quelle fonction async)
     - Si succès : retourne T
     - Si erreur : log l'erreur dans la console, affiche un toast d'erreur (sauf si silent:true)
     - Si l'erreur est une Supabase error, extraire le message
     - Relance l'erreur après log (pour que l'appelant puisse aussi la gérer)
   - Ne pas casser le typage — le retour est Promise<T>

2. Mettre à jour les appels dans `src/lib/players.ts`, `matches.ts`, `news.ts`, `staff.ts`, `gallery.ts`, `standings.ts` :
   - Option A : intégrer apiCall dans chaque fonction service (plus propre)
   - Option B : laisser les services tels quels et utiliser apiCall dans les pages admin (moins intrusif)
   - → Choisir Option A : wrapper chaque fonction service existante

3. Exemple de transformation (players.ts) :
   ```typescript
   // Avant
   export async function getPlayers(): Promise<Player[]> {
     const { data, error } = await supabase.from('players').select('*');
     if (error) throw error;
     return data;
   }
   
   // Après
   export const getPlayers = () => apiCall(async () => {
     const { data, error } = await supabase.from('players').select('*');
     if (error) throw error;
     return data as Player[];
   });
   ```

4. Migrer les 6 services progressivement (un commit par service)

Vérification :
- `npx tsc --noEmit` — 0 erreurs
- `npm test` — les 25 tests mockent Supabase donc ne seront pas impactés
- `npm run build` — 0 erreurs

Fichiers :
- Créer : `src/lib/api-client.ts`
- Modifier : `src/lib/players.ts`, `src/lib/matches.ts`, `src/lib/news.ts`, `src/lib/staff.ts`, `src/lib/gallery.ts`, `src/lib/standings.ts`
```

### Prompt 2.4 : Debounce recherche (A-003)

```markdown
Ajouter un debounce sur la recherche DataTable du projet Racing Club de Bingerville.

Contexte :
- DataTable a un champ de recherche qui filtre les données côté client
- Actuellement le filtre est appliqué à chaque frappe (pas de debounce)
- Le hook useMemo gère déjà la réactivité, mais on veut éviter les recalculs inutiles

Actions :
1. Ouvrir `src/components/admin/data/DataTable.tsx`
2. Créer un hook local `useDebounce` dans le même fichier (ou dans `src/hooks/useDebounce.ts`) :
   ```typescript
   function useDebounce<T>(value: T, delay: number): T {
     const [debouncedValue, setDebouncedValue] = useState(value);
     useEffect(() => {
       const timer = setTimeout(() => setDebouncedValue(value), delay);
       return () => clearTimeout(timer);
     }, [value, delay]);
     return debouncedValue;
   }
   ```
3. Dans DataTable, ajouter :
   - Un state `searchValue` pour la valeur immédiate (ce que l'utilisateur tape)
   - Un state `debouncedSearch` via le hook useDebounce avec 300ms
   - Le filtre utilise `debouncedSearch` au lieu de `searchValue`
   - L'input de recherche utilise `searchValue` (réactif immédiat)

4. Si `useDebounce` est extrait dans un fichier séparé, importer depuis `../../hooks/useDebounce`

Vérification :
- `npx tsc --noEmit` — 0 erreurs
- `npm test` — 25/25 pass
- Comportement : la recherche visuelle est immédiate (input), le filtrage est différé (debounce)

Fichier : `src/components/admin/data/DataTable.tsx` (ou `src/hooks/useDebounce.ts` + DataTable.tsx)
```

### Prompt 2.5 : Mocks Supabase e2e (A-012)

```markdown
Configurer des mocks Supabase pour les tests e2e Playwright du projet Racing Club de Bingerville.

Contexte :
- Tests e2e dans `e2e/auth.spec.ts` et `e2e/navigation.spec.ts`
- Playwright avec configuration chromium/firefox/mobile
- Les tests auth dépendent d'un backend Supabase réel — échouent en CI sans .env.local

Actions :
1. Créer `e2e/fixtures/supabase-mock.json` avec des données de test :
   ```json
   {
     "auth": {
       "signInWithPassword": {
         "success": { "data": { "user": { "id": "test-user-id", "email": "admin@test.ci", "user_metadata": { "role": "admin" } } }, "error": null },
         "failure": { "data": null, "error": { "message": "Invalid login credentials" } }
       },
       "signOut": { "error": null }
     }
   }
   ```

2. Créer `e2e/helpers/mock-supabase.ts` :
   - Fonction `mockSupabaseAuth(page, behavior: 'success' | 'failure')` qui intercepte les appels réseau vers Supabase
   - Utiliser `page.route('**/auth/v1/token**', ...)` pour intercepter les appes auth
   - Retourner les réponses mockées selon le comportement choisi

3. Modifier `e2e/auth.spec.ts` :
   - Ajouter un test avec mock Supabase (sans credentials réels)
   - Tester le comportement en mode déconnecté (vérifier que le formulaire s'affiche)
   - Tester le message d'erreur avec identifiants invalides (utiliser le mock)
   - Conserver le test existant avec credentials réels (mais skipé si env vars absentes)

4. Ne pas modifier `e2e/navigation.spec.ts` (pages publiques, sans Supabase)

Vérification :
- `npx playwright test --project=chromium` — les tests mockés doivent passer sans backend
- Les tests avec skip si credentials absents ne doivent pas bloquer la CI

Fichiers :
- Créer : `e2e/fixtures/supabase-mock.json`, `e2e/helpers/mock-supabase.ts`
- Modifier : `e2e/auth.spec.ts`
```

---

## 📌 Phase 3 — Moyenne/Basse priorité

### Prompt 3.1 : Tests e2e CRUD Players (A-013)

```markdown
Ajouter des tests e2e pour le CRUD Players de l'admin du projet Racing Club de Bingerville.

Contexte :
- Tests e2e dans `e2e/`
- Déjà configuré : Playwright, 2 spec files (navigation, auth), mock Supabase
- L'admin Players est à `/admin/players` et utilise DataTable + FormBuilder
- Les données sont mockées via les helpers e2e existants

Actions :
1. Créer `e2e/players.spec.ts` en se basant sur le mock Supabase existant :
   - Test 1 : "affiche la liste des joueurs" — naviguer vers `/admin/players`, vérifier que DataTable est visible
   - Test 2 : "ouvre le formulaire d'ajout" — cliquer sur "Ajouter", vérifier que FormBuilder s'affiche
   - Test 3 : "filtre les joueurs par recherche" — taper dans la recherche, vérifier le filtre
   - Test 4 : "navigation protégée" — vérifier que `/admin/players` redirige vers login si non connecté
   - Test 5 : "page de création accessible" — vérifier les champs du formulaire visibles

2. Pour les tests nécessitant une connexion :
   - Mock Supabase auth (utiliser le helper existant de A-012)
   - Ou utiliser skip si credentials non définis
   - Prioriser les tests sans auth réelle

3. Structure des tests :
   - `test.describe('Admin CRUD Players')`
   - Chaque test est indépendant (naviguer à l'URL explicitement)

Vérification :
- `npx playwright test --project=chromium e2e/players.spec.ts` — doit passer
- `npm run build` — 0 erreurs

Fichiers : `e2e/players.spec.ts`
```

### Prompt 3.2 : Nettoyage code mort (A-007, A-008, A-010)

```markdown
Nettoyer le code mort dans le projet Racing Club de Bingerville.

Contexte :
- Sprint 7 a restructuré l'admin avec DataTable/FormBuilder
- Les anciens AdminTable.tsx et AdminForm.tsx ne sont plus utilisés
- src/components/admin/AdminLayout.tsx est un ré-export de core/AdminLayout

Actions :
1. Vérifier qu'aucun fichier n'importe `AdminTable` ou `AdminForm` :
   ```bash
   grep -r "from.*AdminTable\|from.*AdminForm" src/ --include="*.tsx" --include="*.ts"
   ```
2. Si aucune référence :
   - Supprimer `src/components/admin/AdminTable.tsx`
   - Supprimer `src/components/admin/AdminForm.tsx`
3. Vérifier qu'aucun fichier n'importe `AdminLayout` depuis `../../components/admin/AdminLayout` (vs depuis `core/AdminLayout`)
4. Si AdminLayout.tsx dans admin/ ne fait que ré-exporter depuis core/ :
   - Remplacer l'import dans `src/App.tsx` de `./components/admin/AdminLayout` vers `./components/admin/core/AdminLayout`
   - Puis supprimer `src/components/admin/AdminLayout.tsx`
5. Renommer le projet dans `package.json` : `"name": "racing"` → `"name": "racing-club-bingerville"`

Vérification :
- `npx tsc --noEmit` — 0 erreurs
- `npm run build` — 0 erreurs
- `npm test` — 25/25 pass
- Vérifier que la page admin se charge toujours dans le navigateur

Fichiers :
- Supprimer : `src/components/admin/AdminTable.tsx`, `AdminForm.tsx`, `AdminLayout.tsx` (sauf si ré-export nécessaire)
- Modifier : `package.json`, `src/App.tsx`
```

### Prompt 3.3 : Optimisation ExportButton (A-022)

```markdown
Optimiser le bundle ExportButton en allégeant la dépendance jspdf dans le projet Racing Club de Bingerville.

Contexte :
- ExportButton dans `src/components/admin/ExportButton.tsx`
- Utilise `jspdf` pour l'export PDF — 438 KB chunk (142 KB gzip)
- Les formats principaux utilisés sont CSV et JSON (via papaparse)
- Le PDF est rarement utilisé

Actions :
1. Analyser `ExportButton.tsx` pour déterminer si `jspdf` est effectivement utilisé
2. Si `jspdf` n'est pas importé directement (vérifier les imports) :
   - Supprimer `jspdf` des dépendances dans `package.json`
3. Si `jspdf` est utilisé :
   - Transformer l'import en lazy dynamique :
   ```typescript
   const handleExportPDF = async () => {
     const { default: jsPDF } = await import('jspdf');
     // reste du code
   };
   ```
   - Le chunk sera chargé uniquement au clic sur "Export PDF" au lieu d'être inclus dans le bundle initial

4. Dans les deux cas, vérifier que l'export CSV/JSON continue de fonctionner sans jspdf

Vérification :
- `npm run build` — vérifier la taille du chunk ExportButton (doit diminuer)
- `npx tsc --noEmit` — 0 erreurs
- Si jspdf retiré, `npm test` — 25/25 pass

Fichiers : `src/components/admin/ExportButton.tsx`, `package.json`
```

### Prompt 3.4 : Mise à jour documentation (A-024, A-025)

```markdown
Mettre à jour la documentation du projet Racing Club de Bingerville.

Actions :
1. Ouvrir `README.md`
   - Ajouter un lien vers `docs/architecture/ARCHITECTURE.md` dans la section "Documentation" ou "Structure"
   - Si une section "Architecture" existe déjà, y ajouter le lien

2. Ouvrir `docs/admin-guide.md`
   - Ajouter une section "Composants de l'interface d'administration" après l'introduction :
     - DataTable : tableau avancé avec colonnes masquables, tri, recherche persistante, bulk actions
     - FormBuilder : générateur de formulaires avec focus mode, champs conditionnels, validation
     - AuditHistory : historique des modifications avec diff visuel
     - ExportButton et ImportModal : export/import CSV/JSON
   - Mettre à jour la section "Structure des pages" :
     - Les pages sont maintenant dans `src/pages/admin/Entities/{Nom}/`
     - Chaque page utilise DataTable + FormBuilder
   - Mentionner le Dashboard refondu avec widgets redimensionnables

3. Ouvrir `docs/architecture/ARCHITECTURE.md`
   - Ajouter une mention des couches admin : `core/`, `data/`, `forms/`

Vérification : relire les fichiers mis à jour

Fichiers : `README.md`, `docs/admin-guide.md`, `docs/architecture/ARCHITECTURE.md`
```

### Prompt 3.5 : Configuration coverage (A-016)

```markdown
Configurer la couverture de tests Vitest pour le projet Racing Club de Bingerville.

Contexte :
- `@vitest/coverage-v8` est déjà dans les dépendances dev (package.json)
- Tests dans `src/__tests__/` avec Vitest
- Pas de configuration coverage active

Actions :
1. Vérifier s'il existe un `vitest.config.ts` ou une config dans `vite.config.ts`
2. Ajouter la configuration coverage :
   ```typescript
   // Dans vite.config.ts ou vitest.config.ts
   test: {
     // ... config existante
     coverage: {
       provider: 'v8',
       reporter: ['text', 'lcov', 'html'],
       reportsDirectory: './coverage',
       include: ['src/lib/**', 'src/components/**', 'src/contexts/**', 'src/hooks/**'],
       exclude: ['src/**/*.test.*', 'src/**/*.spec.*', 'src/__tests__/**'],
       thresholds: {
         lines: 30,
         functions: 30,
         branches: 20,
         statements: 30,
      },
     },
   }
   ```
3. Ajouter un script npm dans `package.json` :
   ```json
   "test:coverage": "vitest run --coverage"
   ```
4. Ajouter `coverage/` au `.gitignore`

Vérification :
- `npm run test:coverage` — doit générer le rapport dans coverage/
- Ne pas casser `npm test`

Fichiers : `vite.config.ts`, `package.json`, `.gitignore`
```

### Prompt 3.6 : Tests AdminContext (A-014) et DataTable (A-015)

```markdown
Ajouter des tests unitaires pour AdminContext et DataTable du projet Racing Club de Bingerville.

Contexte :
- AdminContext dans `src/contexts/AdminContext.tsx` (306 lignes)
- DataTable dans `src/components/admin/data/DataTable.tsx` (après extraction)
- Vitest + React Testing Library configurés

Actions :
1. Créer `src/__tests__/contexts/AdminContext.test.tsx` :
   - Mocker les services Supabase (players, matches, news, staff)
   - Tester le rendu du provider avec des enfants React
   - Tester `fetchPlayers` via le contexte
   - Tester que `createPlayer` appelle le service avec les bons paramètres
   - Vérifier que l'état est mis à jour après création
   - Utiliser un wrapper component pour accéder au contexte

2. Créer `src/__tests__/components/DataTable.test.tsx` :
   - Tester le rendu avec un tableau vide (8 états skeleton)
   - Tester le rendu avec des données mockées (type Player)
   - Tester la recherche (filtre les lignes)
   - Tester la sélection (bulk actions visibles)
   - Tester la pagination

Vérification :
- `npm test` — les nouveaux tests doivent passer
- `npx tsc --noEmit` — 0 erreurs

Fichiers :
- Créer : `src/__tests__/contexts/AdminContext.test.tsx`, `src/__tests__/components/DataTable.test.tsx`
```

---

## 📋 Ordre d'exécution recommandé (4,5 jours)

### Jour 1 — Phase 1 (1,5 j)
1. Prompt 1.3 (manifeste) — 15 min
2. Prompt 1.2 (offline.html) — 30 min
3. Prompt 1.4 (tests UI) — 3h
4. Prompt 1.1 (CSP) — 5h (avec tests staging)

### Jour 2 — Phase 2 début (1,5 j)
5. Prompt 2.1 (extraire DataTable) — 3h (prioritaire)
6. Prompt 2.2 (validation FormBuilder) — 1,5h
7. Prompt 2.4 (debounce) — 1h

### Jour 3 — Phase 2 fin + Phase 3 début
8. Prompt 2.3 (wrapper api-client) — 1,5h
9. Prompt 2.5 (mocks e2e) — 3h
10. Prompt 3.5 (coverage) — 10 min

### Jour 4 — Phase 3
11. Prompt 3.2 (nettoyage code mort) — 30 min
12. Prompt 3.6 (tests DataTable + AdminContext) — 3,5h
13. Prompt 3.4 (doc) — 1h

### Jour 5 — Phase 3 fin
14. Prompt 3.1 (tests e2e CRUD) — 3h
15. Prompt 3.3 (ExportButton) — 1,5h
16. A-006 (AdminContext split, optionnel si temps) — 2h
