# Racing Club de Bingerville

Site officiel du Racing Club de Bingerville — club de football basé à Bingerville, Côte d'Ivoire (Ligue 1). Plateforme web moderne offrant un site vitrine public et une interface d'administration complète pour la gestion du club.

[![Version](https://img.shields.io/badge/version-0.0.0-blue)]()
[![Netlify Status](https://img.shields.io/badge/deploy-Netlify-00C7B7)]()
[![Licence](https://img.shields.io/badge/licence-À_compléter-lightgrey)]()

---

## 📌 Présentation

Le Racing Club de Bingerville disposait d'une présence en ligne inexistante ou obsolète. Ce projet vise à créer un site web professionnel, rapide et facilement administrable pour :

- **Les supporters** : accès aux informations du club (effectif, matchs, actualités, galerie, classement)
- **Le staff administratif** : gestion autonome des contenus via une interface d'administration sécurisée

### Objectifs

- Fournir une vitrine publique moderne et responsive
- Permettre une gestion complète des contenus (joueurs, matchs, actualités, staff)
- Garantir des performances élevées (Lighthouse ≥ 90, chargement < 2 s)
- Fonctionner avec un budget limité (plans gratuits Supabase + Netlify)

---

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| Pages publiques | Accueil, Effectif, Matchs, Actualités, Galerie, Classement |
| Administration complète | Dashboard, CRUD Joueurs/Matchs/Actualités/Staff |
| Galerie média | Photos et vidéos avec catégories (match, entrainement, evenement, autre) |
| Classement | Gestion des équipes, calcul automatique des points et goal difference, filtrage par saison |
| Authentification | Connexion sécurisée par email/mot de passe via Supabase Auth |
| Notifications push | Alertes navigateur via PWA + Edge Function Netlify |
| Mode sombre | Support du thème sombre via classe CSS `dark:` |
| PWA | Installation sur écran d'accueil, service worker, cache offline |
| Responsive | Adaptation mobile, tablette et desktop |

---

## 🏗️ Stack technique

| Catégorie | Technologie |
|---|---|
| **Frontend** | Vite 8, React 19, TypeScript 6, Tailwind CSS 3 |
| **Backend / Services** | Supabase (Auth, PostgreSQL, Storage) |
| **PWA** | vite-plugin-pwa, Workbox (precaching, routing, strategies) |
| **Tests** | Vitest (unitaires), Playwright (e2e) |
| **Linting** | oxlint |
| **Infrastructure** | GitHub, Netlify (site + Edge Functions) |

---

## 📂 Architecture du projet

```
racing/
├── e2e/                    Tests end-to-end Playwright
├── netlify/
│   └── functions/          Edge Functions Netlify (health, send-push, get-push-count)
├── public/
│   └── icons/              Icônes PWA
├── scripts/                Scripts utilitaires (génération d'icônes)
├── src/
│   ├── __tests__/          Tests unitaires Vitest
│   ├── assets/             Ressources statiques
│   ├── components/         Composants réutilisables
│   │   ├── admin/          Composants d'administration (AdminTable, AdminForm, ConfirmModal)
│   │   └── ui/             Composants atomiques (PlayerCard, MatchCard, NewsCard, Skeleton, etc.)
│   ├── contexts/           Contexte React (AuthContext, AdminContext, ThemeContext)
│   ├── hooks/              Hooks personnalisés
│   ├── lib/                Services Supabase (players, matches, news, staff, gallery, standings, notifications)
│   ├── pages/              Pages routes
│   │   └── admin/          Pages d'administration (Dashboard, Players, Matches, News, Staff)
│   ├── test/               Configuration et helpers de test
│   ├── types/              Types TypeScript centralisés
│   └── utils/              Fonctions utilitaires
├── supabase/
│   └── migrations/         Migrations SQL (001 à 007)
├── docs/                   Documentation du projet
├── .env.example            Modèle de variables d'environnement
├── netlify.toml            Configuration Netlify (build, redirects, headers)
├── vite.config.ts          Configuration Vite
├── vitest.config.ts        Configuration Vitest
├── playwright.config.ts    Configuration Playwright
├── tailwind.config.js      Configuration Tailwind CSS
├── tsconfig.json           Configuration TypeScript
└── package.json
```

### Organisation MVC

Le projet suit une architecture MVC adaptée à React :

- **Model** (`src/lib/`) : services Supabase, logique métier — chaque table a son propre module
- **View** (`src/components/` + `src/pages/`) : composants UI atomiques et pages routes
- **Controller** (`src/contexts/` + `src/hooks/`) : état global React (auth, admin, theme) et hooks personnalisés

---

## ⚙️ Installation locale

### Prérequis

- Node.js 22
- Compte Supabase (gratuit)
- Compte Netlify (gratuit)
- Git

### Installation

```bash
git clone https://github.com/sieni7/racing.git
cd racing
npm install
cp .env.example .env.local
```

Remplir `.env.local` avec les clés de votre projet Supabase, puis lancer le serveur de développement :

```bash
npm run dev
```

---

## 🔐 Configuration environnement

Variables d'environnement (voir `.env.example`) :

| Variable | Description | Obligatoire |
|---|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase | Oui |
| `VITE_SUPABASE_ANON_KEY` | Clé anon Supabase (côté client) | Oui |
| `VITE_VAPID_PUBLIC_KEY` | Clé publique VAPID pour notifications push | Non (notifications) |
| `VAPID_PRIVATE_KEY` | Clé privée VAPID pour Edge Function send-push | Non (notifications) |

---

## 🗄️ Configuration Supabase

1. Créer un projet Supabase
2. Exécuter les migrations dans `supabase/migrations/` (001 à 007) via l'éditeur SQL
3. Configurer l'authentification (Email/Password)
4. Créer un bucket Storage `gallery` en lecture publique

### Tables Supabase

| Table | Migration | Contenu |
|---|---|---|
| `players` | 001 | Joueurs du club |
| `matches` | 002 | Matchs (statuts : upcoming, finished, postponed) |
| `news` | 003 | Actualités (slug auto, statut published) |
| `staff` | 004 | Membres du staff (rôles : entraîneur, médecin, préparateur physique, etc.) |
| `gallery` | 005 | Photos et vidéos (catégories : match, entrainement, evenement, autre) |
| `standings` | 006 | Classement (goal_diff, points calculés automatiquement, filtrage par saison) |
| `push_subscriptions` | 007 | Abonnements aux notifications push |

---

## 🚀 Déploiement

Le déploiement est assuré par **Netlify** avec configuration dans `netlify.toml` :

- **Build command** : `npm run build`
- **Publish directory** : `dist`
- **Functions directory** : `netlify/functions`
- **Node version** : 22
- **Redirects** : SPA → `/*` → `/index.html` (status 200)

### Déploiement automatique

Un push sur la branche `main` déclenche un déploiement automatique.

### Déploiement manuel

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

### Variables d'environnement Netlify

Configurer dans Netlify → Site settings → Environment variables :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

### Génération des clés VAPID (notifications push)

```bash
npx web-push generate-vapid-keys --json
```

### Vérification

- `https://[votre-site].netlify.app/` — site public
- `https://[votre-site].netlify.app/admin` — interface admin
- `https://[votre-site].netlify.app/api/health` — health check

---

## 📜 Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build production (TypeScript + Vite) |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | Linting avec oxlint |
| `npm test` | Tests unitaires Vitest |
| `npm run test:ui` | Tests unitaires avec interface Vitest UI |
| `npm run test:e2e` | Tests end-to-end Playwright |
| `npm run test:e2e:ui` | Tests e2e avec interface Playwright UI |

---

## 🧪 Qualité et tests

- **Tests unitaires** : Vitest avec jsdom, couverture via `@vitest/coverage-v8`, tests dans `src/__tests__/`
- **Tests e2e** : Playwright (Chromium, Firefox, mobile), tests dans `e2e/`
- **Linting** : oxlint (configuration `.oxlintrc.json`)
- **KPIs visés** : Lighthouse Performance ≥ 90, Accessibilité ≥ 90, temps de chargement < 2 s

---

## 🤝 Contribution

### Workflow Git

- **Branches** : `main` (production), `develop` (intégration), `feature/<nom>`, `fix/<nom>`, `chore/<nom>`
- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/) — `type(scope): message`
  - Types : `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`
- **PRs** : Squash merge vers `develop`, merge commit vers `main`

### Conventions de code

- TypeScript strict mode activé
- Composants fonctionnels + hooks (sauf `ErrorBoundary` qui utilise un composant classe)
- Lazy loading pour toutes les pages (`React.lazy` + `Suspense`)
- Fichiers : `PascalCase` pour les composants, `camelCase` pour les hooks/services
- Dossiers : `kebab-case`

---

## 📄 Licence

[À compléter]

---

## 👥 Auteur / Contact

[À compléter]

---

## Informations manquantes

Les informations suivantes n'ont pas été trouvées dans `/docs` et nécessitent d'être renseignées :

- URL de production Netlify
- Licence du projet
- Auteur(s) / contact(s) du projet
- Badge de build (CI/CD)
- Schéma détaillé des politiques RLS Supabase
- Procédure détaillée de contribution (au-delà du workflow Git)

### Conflits détectés

- **Versions de la stack** : `PROJECT_CONTEXT.md` mentionne "React 18 + TypeScript 5" tandis que `ADR-000.md` et `package.json` indiquent React 19 + TypeScript 6 — vérification humaine requise.
- **Pagination des news** : `ADR-005.md` indique 5 par page, `ADR-012.md` indique 9 par page — vérification humaine requise.
- **Version du projet** : `package.json` et `CHANGELOG.md` indiquent `0.0.0`, `RELEASE_NOTES.md` mentionne `v0.1.0` — vérification humaine requise.
