/* =========================================================
   MODE VOYAGE
   ========================================================= */
export const TCATS = [
  {id:'logement',  name:'Hébergement',   icon:'🏨'},
  {id:'resto',     name:'Restaurants',   icon:'🍜'},
  {id:'courses',   name:'Courses & snacks', icon:'🥤'},
  {id:'transport', name:'Transport',     icon:'🚕'},
  {id:'activites', name:'Activités',     icon:'🎟️'},
  {id:'souvenirs', name:'Shopping',     icon:'🛍️'},
  {id:'autre',     name:'Autre',         icon:'📦'},
];
export const TCAT = Object.fromEntries(TCATS.map(c=>[c.id,c]));
export const TKEYWORDS = {
  logement:['hotel','hostel','auberge','airbnb','booking','ryokan','guesthouse','logement','nuit','chambre','camping'],
  resto:['restaurant','resto','ramen','sushi','pizza','burger','cafe','bar','diner','dejeuner','petit dej','brunch','street food','izakaya','tapas','biere','verre','mcdo','kfc','tacos','kebab'],
  courses:['supermarche','7 eleven','7-eleven','family mart','familymart','lawson','konbini','snack','eau','boisson','courses','epicerie','glace','carrefour','lidl','spar'],
  transport:['taxi','uber','grab','bolt','metro','train','bus','shinkansen','ferry','essence','location voiture','avion','vol','tuk tuk','tuktuk','scooter','jr pass','navette','parking','peage','tram','velo'],
  activites:['musee','visite','entree','billet','tour','excursion','parc','temple','plongee','surf','spa','massage','concert','spectacle','guide','activite','randonnee','safari','croisiere','onsen'],
  souvenirs:['souvenir','cadeau','magnet','tshirt','t-shirt','vetement','vetements','shopping','artisanat','duty free','carte postale','uniqlo','zara','h&m','don quijote','daiso','muji','chaussures','sac'],
  autre:['sim','esim','pharmacie','laverie','pourboire','visa','assurance','retrait','frais','bagage'],
};
export const CURRENCIES = [
  ['USD','Dollar américain'],['GBP','Livre sterling'],['CHF','Franc suisse'],['JPY','Yen japonais'],['CAD','Dollar canadien'],
  ['AUD','Dollar australien'],['NZD','Dollar néo-zélandais'],['MAD','Dirham marocain'],['TND','Dinar tunisien'],['EGP','Livre égyptienne'],
  ['TRY','Livre turque'],['AED','Dirham des Émirats'],['THB','Baht thaïlandais'],['VND','Dong vietnamien'],['IDR','Roupie indonésienne'],
  ['INR','Roupie indienne'],['CNY','Yuan chinois'],['KRW','Won sud-coréen'],['SGD','Dollar de Singapour'],['MXN','Peso mexicain'],
  ['BRL','Réal brésilien'],['ZAR','Rand sud-africain'],['SEK','Couronne suédoise'],['NOK','Couronne norvégienne'],['DKK','Couronne danoise'],
  ['ISK','Couronne islandaise'],['PLN','Zloty polonais'],['CZK','Couronne tchèque'],['HUF','Forint hongrois'],['EUR','Euro (zone euro)'],
];
