# Mon Budget

Appli web perso pour suivre ses dépenses, installable sur téléphone (iPhone et Android), sans App Store, sans serveur et sans compte.

**→ https://maximealz.github.io/AppBudget/**

## Installer
- **iPhone** : ouvrir le lien dans Safari → Partager → *Sur l'écran d'accueil*
- **Android** : ouvrir le lien dans Chrome → menu ⋮ → *Installer l'application*

## Fonctionnalités
**Quotidien**
- Saisie rapide d'une dépense avec catégorie devinée depuis la description (et mémorisation des corrections)
- Abonnements comptés automatiquement chaque mois
- Budget par catégorie en % du revenu, revenu modifiable mois par mois
- Alertes ⚠️ (seuil réglable) et ⛔ (dépassement)
- Suivi : reste du mois, budgets, évolution sur 6 mois, comparaison avec le mois précédent

**Voyage**
- Plusieurs voyages, devise et taux de change saisis à la main (aucune connexion nécessaire)
- Saisie en devise locale ou en euros, conversion en direct
- Budget total et budget par jour, suivi jour par jour et par catégorie
- Convertisseur hors ligne

**Données** : uniquement sur l'appareil (`localStorage`). Export / import d'une sauvegarde JSON dans Réglages.

## Structure du code
Pas de framework ni d'étape de build : du HTML, du CSS et des modules JavaScript natifs.

```
index.html              Squelette de la page
css/styles.css          Styles (thème noir et or)
sw.js                   Service worker : cache des fichiers pour le hors-ligne
manifest.json           Nom, icônes et couleurs de l'appli installée
js/
  app.js                Point d'entrée : navigation, onglets, changement de mode
  config/categories.js  Catégories, % conseillés, mots-clés
  core/
    storage.js          Lecture / écriture et validation des données
    budget.js           Calculs du mois (totaux, budgets, alertes)
    categorize.js       Catégorisation automatique
    utils.js            Formats, dates, petits outils
  views/                Écrans du mode quotidien (suivi, historique, abos, réglages, saisie)
  travel/               Mode voyage (modèle, écrans, saisie, convertisseur)
  ui/                   Composants partagés (fenêtre de saisie, notifications, confirmation)
tests/                  Tests de la logique (node --test)
```

## Sécurité
- Aucune donnée ne quitte l'appareil : pas de serveur, pas de requête réseau.
- Politique de sécurité stricte (`Content-Security-Policy`) : seul le code de l'appli peut s'exécuter.
- Tout texte saisi est échappé avant affichage, et toute donnée chargée ou importée est validée (`sanitize()` dans `core/storage.js`).

## Développer
```bash
npm start      # serveur local sur http://localhost:8000 (les modules JS ne marchent pas en file://)
npm test       # tests de la logique (Node 18+)
```
À chaque mise à jour, changer `VERSION` dans `sw.js` (et ajouter tout nouveau fichier à `FILES`) pour que les téléphones récupèrent la nouvelle version.
