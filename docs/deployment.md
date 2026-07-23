# Guide de déploiement

## Prérequis

- Compte Netlify
- Compte Supabase
- Node.js 22

## 1. Supabase

1. Créer un projet Supabase
2. Exécuter les migrations dans `supabase/migrations/` (001 à 007) via l'éditeur SQL
3. Configurer l'authentification (Email/Password)
4. Créer un bucket Storage `gallery` (lecture publique)
5. Récupérer l'URL et la clé anon depuis Settings → API

## 2. Netlify

### 2.1 Connecter le dépôt

1. Aller sur app.netlify.com → Add new site → Import from Git
2. Sélectionner le dépôt GitHub
3. Les paramètres de build sont déjà dans `netlify.toml`

### 2.2 Variables d'environnement

Configurer dans Netlify → Site settings → Environment variables :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
VITE_VAPID_PUBLIC_KEY=clé-publique-vapid
VAPID_PRIVATE_KEY=clé-privée-vapid
```

### 2.3 Domaine personnalisé (optionnel)

1. Netlify → Site settings → Domain management → Add custom domain
2. Configurer les enregistrements DNS chez votre registrar

## 3. Notifications push

### Générer les clés VAPID

```bash
npx web-push generate-vapid-keys --json
```

Ajouter les clés dans les variables d'environnement Netlify :
- `VITE_VAPID_PUBLIC_KEY` : exposée côté client
- `VAPID_PRIVATE_KEY` : utilisée par l'Edge Function `send-push`

## 4. Déploiement manuel

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

Ou simplement push sur `main` (déploiement automatique).

## 5. Vérification

- `https://votre-site.netlify.app/` — site public
- `https://votre-site.netlify.app/admin` — interface admin
- `https://votre-site.netlify.app/api/health` — health check
