/* =========================================================
   Données de base
   ========================================================= */
export const CATS = [
  {id:'quotidien', name:'Vie quotidienne', icon:'🛒', pct:15},
  {id:'dehors',    name:'Manger dehors',   icon:'🍔', pct:8},
  {id:'fun',       name:'Fun perso',       icon:'🎮', pct:8},
  {id:'abos',      name:'Abonnements',     icon:'📺', pct:4},
  {id:'transport', name:'Transport',       icon:'🚆', pct:8},
  {id:'shopping',  name:'Shopping',        icon:'👕', pct:5},
  {id:'sorties',   name:'Sorties & voyages',icon:'🎉', pct:5},
  {id:'sante',     name:'Santé',           icon:'💊', pct:3},
  {id:'cadeaux',   name:'Cadeaux',         icon:'🎁', pct:3},
  {id:'loyer',     name:'Logement',        icon:'🏠', pct:0},
  {id:'invest',    name:'Investissement',  icon:'📈', pct:25, goal:true},
  {id:'autre',     name:'Autre',           icon:'📦', pct:3},
];
export const CAT = Object.fromEntries(CATS.map(c=>[c.id,c]));

// Mots-clés pour ranger automatiquement une dépense selon sa description
export const KEYWORDS = {
  dehors:['mcdo','mcdonald','burger','bk','kfc','quick','uber eats','ubereats','deliveroo','just eat','sushi','pizza','kebab','tacos','o tacos','resto','restaurant','starbucks','brasserie','subway','five guys','poke','dejeuner','diner','fast food','crous','cafe','boba','bubble tea'],
  quotidien:['carrefour','leclerc','auchan','lidl','aldi','intermarche','monoprix','franprix','casino','super u','courses','supermarche','boulangerie','pain','lessive','menage','hygiene','shampoing','dentifrice','picard','marche','epicerie','grand frais','biocoop','action'],
  fun:['ps5','ps4','playstation','psn','steam','nintendo','switch','xbox','jeu','jeux','game','manga','fnac','micromania','v-bucks','vbucks','fortnite','gemmes','in game','skin','pass de combat','livre','bd','figurine','carte pokemon','lego','eneba','instant gaming'],
  abos:['netflix','spotify','disney','prime video','amazon prime','deezer','youtube premium','canal','abonnement','forfait','free mobile','sfr','orange','bouygues','icloud','chatgpt','claude','basic fit','salle de sport','crunchyroll','game pass','ps plus'],
  invest:['pea','livret','livret a','ldds','assurance vie','bourse','etf','crypto','bitcoin','cto','epargne','per'],
  cadeaux:['cadeau','anniversaire','anniv','noel','fete des','offert'],
  transport:['essence','carburant','sncf','train','tgv','ouigo','navigo','metro','uber','bolt','taxi','peage','parking','bus','blablacar','ratp','tcl','velib','trottinette','lime'],
  sante:['pharmacie','medecin','doctolib','dentiste','mutuelle','ophtalmo','kine','lunettes','lentilles','analyse'],
  shopping:['zara','h&m','hm','vetement','vetements','chaussures','nike','adidas','amazon','uniqlo','decathlon','shein','vinted','pull','jean','tshirt','t-shirt','veste','sneakers','ikea'],
  sorties:['cinema','cine','bar','concert','soiree','voyage','hotel','airbnb','billet','bowling','musee','festival','laser game','escape game','boite','club','biere','verre'],
  loyer:['loyer','apl','charges','edf','electricite','eau','assurance habitation','engie','internet box'],
};
export const SUB_PRESETS = ['Netflix','Spotify','Disney+','Amazon Prime','Deezer','YouTube Premium','Canal+','PS Plus','Xbox Game Pass','Crunchyroll','iCloud','ChatGPT','Forfait mobile','Salle de sport'];
