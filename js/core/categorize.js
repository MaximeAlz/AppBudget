import { KEYWORDS } from '../config/categories.js';
import { S } from './storage.js';
import { norm } from './utils.js';

/* Devine la catégorie à partir de la description */
export function guessCat(desc){ return guessIn(desc,S.rules,KEYWORDS); }
export function guessIn(desc,rules,keywords){
  const d = norm(desc); if(!d) return null;
  if(rules[d]) return rules[d];                        // ce que tu as déjà choisi pour cette description
  let best=null, len=0; const padded=' '+d+' ';
  for(const [cat,words] of Object.entries(keywords)){
    for(const w of words){
      if(w.length>len && padded.includes(' '+w+' ') || (w.length>=5 && w.length>len && d.includes(w))){ best=cat; len=w.length; }
    }
  }
  return best;
}
