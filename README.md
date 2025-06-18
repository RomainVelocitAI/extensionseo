# SEO QuickScore - Extension Chrome

Une extension Chrome simple pour analyser le référencement d'une page web et obtenir un score SEO sur 100.

## Fonctionnalités

- Analyse en temps réel de la page active
- Score SEO sur 100 points
- Vérification des éléments essentiels (titre, meta description, H1, etc.)
- Affichage des en-têtes (H1 à H6)
- Vérification du protocole HTTPS
- Vérification du fichier robots.txt
- Calcul de la taille de la page
- Comptage des mots
- Export des résultats en JSON

## Installation

1. Téléchargez ou clonez ce dépôt
2. Ouvrez Chrome et allez à `chrome://extensions/`
3. Activez le mode développeur en haut à droite
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier `seo-quickscore`

## Utilisation

1. Cliquez sur l'icône de l'extension dans la barre d'outils de Chrome
2. L'extension analysera automatiquement la page active
3. Consultez le score SEO et les détails de l'analyse
4. Utilisez le bouton "Exporter en JSON" pour copier les résultats dans le presse-papier

## Critères de notation

- **Titre présent** : 15 points
- **Meta description présente** : 15 points
- **Balise H1 présente** : 15 points
- **HTTPS actif** : 10 points
- **robots.txt présent** : 10 points
- **Balise canonique présente** : 10 points
- **Plus de 300 mots** : 10 points
- **Taille de page < 500 Ko** : 15 points

## Personnalisation

Vous pouvez personnaliser l'apparence en modifiant le fichier `popup/styles.css`.

## Licence

Ce projet est sous licence MIT. N'hésitez pas à le modifier selon vos besoins.
