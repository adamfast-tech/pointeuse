# Pointeuse de poche

Web app pour calculer ses heures au quotidien, pensée pour l'iPhone.

**Ouvrir l'app : https://adamfast-tech.github.io/pointeuse/**

## Ce qu'elle fait

- **Journée** : saisis ton heure d'arrivée, la durée à faire (8 h 48 par défaut) et ta pause. L'heure de fin s'affiche en grand, avec le temps restant mis à jour en direct.
- **Calcul** : additionne ou soustrait des durées (h + min) sur autant de lignes que nécessaire.
- **Écart** : temps travaillé entre deux heures, pause déduite, et ce qu'il reste par rapport à l'objectif. Gère le passage de minuit.

Les réglages (objectif, pause, arrivée du jour) restent enregistrés sur l'appareil. Rien n'est envoyé à un serveur.

## L'installer sur iPhone

1. Ouvre le lien ci-dessus dans **Safari**.
2. Touche **Partager** › **Sur l'écran d'accueil**.
3. Lance-la depuis l'icône : elle s'ouvre en plein écran, sans barre Safari, et fonctionne hors ligne.

Sur Android : menu de Chrome › **Installer l'application**.

## Technique

HTML, CSS et JavaScript sans dépendance, un seul fichier `index.html`. Service worker (`sw.js`) pour le hors-ligne, manifeste web pour l'installation. Hébergé sur GitHub Pages.
