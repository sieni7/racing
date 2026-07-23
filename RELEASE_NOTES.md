# Notes de version — v1.0.0

## Fonctionnalités

### Pages publiques
- **Accueil** : Hero carousel avec actualités récentes, matchs à venir
- **Effectif** : Liste des joueurs avec filtres (poste, numéro)
- **Matchs** : Calendrier et résultats, pagination
- **Actualités** : Articles avec détails et slugs SEO-friendly
- **Galerie** : Photos/vidéos avec lightbox, navigation clavier, filtres par catégorie
- **Classement** : Tableau du championnat avec filtre par saison

### Administration
- Dashboard avec statistiques
- CRUD complet : Joueurs, Matchs, Actualités, Staff
- Gestion de la galerie (photos, vidéos, catégories)
- Gestion du classement (équipes, saisons)
- Envoi de notifications push

### Techniques
- Authentification Supabase (Email/Password)
- Mode sombre/clair
- Responsive mobile/tablette/desktop
- PWA : installation, offline partiel
- Notifications push
- Sécurité : CSP, HSTS, en-têtes HTTP renforcés
- Tests unitaires (Vitest, 25 tests)
- Tests e2e (Playwright)

## Stack
Vite 8 · React 19 · TypeScript 6 · Tailwind CSS 3 · Supabase · Netlify

## Installation
```bash
npm install
cp .env.example .env.local
npm run dev
```
