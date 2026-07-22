# Architecture

## Structure MVC

```
src/
├── lib/            # Modèles (services Supabase)
├── components/     # Vues (composants réutilisables)
│   └── ui/         #   Composants atomiques
├── contexts/       # Contrôleurs (état global React)
├── hooks/          #   Hooks personnalisés
└── pages/          # Vues (pages routes)
```

## Data flow
```
Pages → Services (lib/) → Supabase API → BDD PostgreSQL
                          ↕
AuthContext ← Supabase Auth
ThemeContext ← localStorage
```

## Routing
- `/` → Accueil
- `/effectif` → Squad
- `/matchs` → Matchs
- `/news` → Actualités
- `/login` → Connexion
- `/admin/*` → Administration (protégé)
