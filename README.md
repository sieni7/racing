# Racing Club de Bingerville

Site officiel du Racing Club de Bingerville — Ligue 1 Côte d'Ivoire.

## Stack technique

- **Frontend** : Vite 8 + React 19 + TypeScript 6
- **Styling** : Tailwind CSS 3
- **Backend** : Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Déploiement** : Netlify (site + Edge Functions)
- **PWA** : vite-plugin-pwa + Workbox
- **Tests** : Vitest (unitaires) + Playwright (e2e)

## Installation

```bash
git clone https://github.com/sieni7/racing.git
cd racing
npm install
cp .env.example .env.local
# Remplir .env.local avec vos clés Supabase
npm run dev
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run preview` | Preview du build |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:e2e` | Tests e2e (Playwright) |
| `npm run lint` | Linting (oxlint) |

## Variables d'environnement

Voir `.env.example` pour la liste complète.

## Structure

```
src/
├── pages/          Pages publiques + admin
├── components/     Composants UI + admin
├── contexts/       React Contexts (Auth, Admin, Theme)
├── lib/            Services Supabase
├── types/          Types TypeScript
└── __tests__/      Tests Vitest
netlify/functions/  Edge Functions Netlify
e2e/                Tests Playwright
```

## Déploiement

Le déploiement est automatisé via Netlify. Voir `docs/deployment.md`.
