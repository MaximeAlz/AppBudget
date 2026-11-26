import { $ } from '../core/utils.js';

// Bloque le défilement de la page derrière la fenêtre (nécessaire sur iPhone)
export let lockY=0;
export function openSheet(){
  lockY=window.scrollY;
  document.body.style.cssText=`position:fixed;top:-${lockY}px;left:0;right:0;overflow:hidden`;
  $('#overlay').classList.add('on'); $('#sheet').classList.add('on'); $('#sheet').scrollTop=0;
}
export function closeSheet(){
  document.activeElement&&document.activeElement.blur();
  $('#overlay').classList.remove('on'); $('#sheet').classList.remove('on');
  if(document.body.style.position==='fixed'){ document.body.style.cssText=''; window.scrollTo(0,lockY); }
}
