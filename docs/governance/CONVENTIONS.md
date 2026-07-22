# Conventions du projet

## Git

- **Branches** : `main` (production), `develop` (intégration), `feature/<nom>`, `fix/<nom>`, `chore/<nom>`
- **Commits** : Conventional Commits — `type(scope): message`
  - Types : `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`
- **PRs** : Squash merge vers `develop`, merge commit vers `main`

## TypeScript

- Strict mode activé
- Types explicites pour les props des composants
- `interface` pour les objets, `type` pour les unions/primitives

## React

- Composants fonctionnels + hooks
- Pages dans `src/pages/`, composants réutilisables dans `src/components/`
- Contexte React pour l'état global (auth, thème)
- Lazy loading pour toutes les pages (`React.lazy` + `Suspense`)

## Nommage

- Fichiers : `PascalCase` pour les composants, `camelCase` pour les hooks/services
- Variables : `camelCase`
- Constantes : `UPPER_SNAKE_CASE`
- Dossiers : `kebab-case`
