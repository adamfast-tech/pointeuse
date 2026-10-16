# Pointeuse de poche

Web app pour calculer ses heures au quotidien, pensée pour l'iPhone.

**Ouvrir l'app : https://adamfast-tech.github.io/pointeuse/**

## Ce qu'elle fait

Deux pages :

**Pointage** (`index.html`), pour toi :
- **Journée** : badge ton arrivée, ta pause et ton départ. L'heure de fin s'affiche en grand, avec le temps restant en direct.
- **Historique** : jours badgés du mois, heures travaillées et solde cumulé. Touche un jour pour le corriger, ou ajoute un jour oublié.
- **Calcul** : additionne ou soustrait des durées (h + min).
- **Écart** : temps travaillé entre deux heures, pause déduite.
- Icône en haut à droite : compte, synchro et lien de suivi.

**Suivi** (`suivi.html`), pour ceux à qui tu envoies le lien : page en lecture seule et en direct, avec l'heure de badge, la fin prévue, le temps restant, l'heure de départ, l'historique et le solde du mois. Elle ne donne aucun accès au pointage.

Le solde ne compte que les jours terminés : travaillé = départ − arrivée − pause, comparé à l'objectif du jour. Un jour sans départ est signalé et n'entre pas dans le calcul tant qu'il n'est pas corrigé.

## L'installer sur iPhone

1. Ouvre le lien ci-dessus dans **Safari**.
2. Touche **Partager** › **Sur l'écran d'accueil**.
3. Lance-la depuis l'icône : elle s'ouvre en plein écran, sans barre Safari, et fonctionne hors ligne.

Sur Android : menu de Chrome › **Installer l'application**.

## Technique

HTML, CSS et JavaScript sans dépendance, un seul fichier `index.html`. Service worker (`sw.js`) pour le hors-ligne, manifeste web pour l'installation. Hébergé sur GitHub Pages.

Synchro via Supabase : la table est dans un schéma non exposé, et l'app n'y accède que par des fonctions RPC qui exigent un code. Les codes sont générés côté serveur, et le code de synchro est stocké haché (SHA-256). Le pointage se synchronise toutes les 20 secondes, la page Suivi toutes les 15 secondes.
