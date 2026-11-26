# Mon Budget

Appli web perso pour suivre ses dépenses, installable sur iPhone (sans App Store).

## Installer sur l'iPhone
1. Ouvre `https://maximealz.github.io/AppBudget/` dans **Safari**.
2. Touche **Partager** → **Sur l'écran d'accueil**.

## Fonctionnalités
- Saisie rapide d'une dépense (montant, description, date) avec catégorie devinée automatiquement
- L'appli retient tes corrections de catégorie
- Abonnements comptés automatiquement chaque mois
- Budget par catégorie en % du revenu, revenu modifiable mois par mois
- Alertes ⚠️ (seuil réglable) et ⛔ (dépassement)
- Dashboard : reste du mois, budgets, évolution sur 6 mois, comparaison avec le mois précédent
- Export / import d'une sauvegarde JSON

Les données restent uniquement sur le téléphone (localStorage). Pense à exporter régulièrement.

## Mettre à jour
Après une modification du code, change `VERSION` dans `sw.js` pour que le téléphone récupère la nouvelle version.
