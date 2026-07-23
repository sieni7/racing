# Guide d'administration

## Connexion

1. Aller sur `/login`
2. Se connecter avec les identifiants administrateur
3. Vous êtes redirigé vers `/admin`

## Dashboard

Le dashboard affiche 4 statistiques : joueurs, matchs, actualités, membres du staff.

## Gestion des joueurs

- **Ajouter** : Cliquer "Ajouter un joueur" → remplir le formulaire → Enregistrer
- **Modifier** : Cliquer "Modifier" sur un joueur → modifier les champs → Enregistrer
- **Supprimer** : Cliquer "Supprimer" → Confirmer

## Gestion des matchs

- Mêmes actions que les joueurs
- Les statuts disponibles : `upcoming`, `finished`, `postponed`
- Le score est modifiable uniquement après le match

## Gestion des actualités

- Le slug est généré automatiquement à partir du titre
- Le statut `published` rend l'article visible publiquement

## Gestion du staff

- Identique aux autres CRUD
- Les rôles disponibles : entraîneur, médecin, préparateur physique, etc.

## Galerie

- Ajouter des photos ou vidéos avec titre et catégorie
- Les catégories : match, entrainement, evenement, autre
- L'ordre d'affichage est défini par `sort_order`

## Classement

- Ajouter/modifier les équipes du championnat
- Les champs calculés (goal_diff, points) sont mis à jour automatiquement
- Le filtrage par saison permet de gérer plusieurs saisons

## Notifications push

1. Aller dans Admin → Push
2. Cliquer "Nouvelle notification"
3. Remplir le titre et le message
4. Envoyer

**Prérequis** : Les clés VAPID doivent être configurées dans les variables d'environnement Netlify.
