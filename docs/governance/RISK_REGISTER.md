# Registre des risques

| ID | Risque | Probabilité | Impact | Mitigation |
|----|--------|-------------|--------|------------|
| R-001 | Connexion réseau instable (npm/npx timeout) | Élevée | Bloquant | Réseau local ou hotspot, fallback scripts |
| R-002 | Dépendances non maintenues | Faible | Moyen | Audit régulier, Dependabot |
| R-003 | Fuite de clés API | Faible | Critique | .env jamais commité, service_role limité |
| R-004 | Changement de tarification Supabase | Moyenne | Moyen | Architecture découplée, migration possible |
