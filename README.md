# Pointeuse de poche

Web app pour calculer ses heures au quotidien, pensée pour l'iPhone.

**Ouvrir l'app : https://adamfast-tech.github.io/pointeuse/**

## Ce qu'elle fait

- **Journée** : saisis ton heure d'arrivée, la durée à faire (8 h 48 par défaut) et ta pause. L'heure de fin s'affiche en grand, avec le temps restant mis à jour en direct.
- **Calcul** : additionne ou soustrait des durées (h + min) sur autant de lignes que nécessaire.
- **Écart** : temps travaillé entre deux heures, pause déduite, et ce qu'il reste par rapport à l'objectif. Gère le passage de minuit.

- **Partage** : suis la journée de quelqu'un en direct (heure de fin, temps restant, départ) avec son code de partage, et partage la tienne.

## Synchro et partage

Dans l'onglet **Partage**, indique ton prénom puis touche **Créer**. Tu obtiens deux codes de 8 caractères (lettres, chiffres, symboles) :

- **Code de partage** : à envoyer aux personnes qui doivent te suivre. Accès en lecture seule à ton arrivée, ta pause, ta fin prévue, ton temps restant et ton départ. **Envoyer le lien** ouvre directement l'app sur ta journée. Si la personne a installé l'app sur son écran d'accueil, elle saisit le code dans « Suivre quelqu'un ».
- **Code de synchro** : à garder pour toi. Saisis-le sur ton autre appareil (« J'ai déjà un code de synchro ») pour retrouver ta journée. Il permet de modifier ton pointage.

**Nouveau code de partage** coupe l'accès à ceux qui avaient l'ancien. **Supprimer mon compte** efface tes données du serveur.

Sans compte, tout reste sur l'appareil. Avec un compte, seuls ton prénom, ton objectif, ta pause et tes heures d'arrivée et de départ du jour sont stockés (Supabase, UE).

## L'installer sur iPhone

1. Ouvre le lien ci-dessus dans **Safari**.
2. Touche **Partager** › **Sur l'écran d'accueil**.
3. Lance-la depuis l'icône : elle s'ouvre en plein écran, sans barre Safari, et fonctionne hors ligne.

Sur Android : menu de Chrome › **Installer l'application**.

## Technique

HTML, CSS et JavaScript sans dépendance, un seul fichier `index.html`. Service worker (`sw.js`) pour le hors-ligne, manifeste web pour l'installation. Hébergé sur GitHub Pages.

Synchro via Supabase : la table est dans un schéma non exposé, et l'app n'y accède que par des fonctions RPC qui exigent un code. Les codes sont générés côté serveur, et le code de synchro est stocké haché (SHA-256). Les données sont actualisées toutes les 20 secondes quand l'app est ouverte.
