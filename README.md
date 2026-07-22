# Racing Club de Bingerville

Site officiel du club de football de Bingerville, Côte d'Ivoire.

## Stack

- **Frontend** : Vite 8 + React 18 + TypeScript 5 + Tailwind CSS 3
- **Backend** : Supabase (Auth, PostgreSQL, Storage)
- **Déploiement** : Netlify
- **Tests** : Vitest + Playwright

## Prérequis

- Node.js 22+
- npm

## Installation

```bash
npm install
```

## Démarrage

```bash
npm run dev
```

Ouvrir http://localhost:5173.

## Variables d'environnement

Copier `.env.example` vers `.env.local` et remplir les valeurs :

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run preview` | Prévisualisation du build |

## Structure

```
src/
├── components/     # Composants réutilisables
│   └── ui/         #   Composants atomiques
├── pages/          # Pages (publiques + admin)
├── lib/            # Services Supabase
├── contexts/       # Contextes React
├── hooks/          # Hooks personnalisés
├── types/          # Types TypeScript
├── utils/          # Fonctions utilitaires
└── styles/         # Styles supplémentaires
```
