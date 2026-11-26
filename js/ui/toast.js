import { $ } from '../core/utils.js';

/* =========================================================
   Petit message en haut de l'écran
   ========================================================= */
let tt;
export function toast(msg,kind='',ms=2200){
  const t=$('#toast'); t.className='toast '+kind; t.textContent=msg;
  requestAnimationFrame(()=>t.classList.add('on'));
  clearTimeout(tt); tt=setTimeout(()=>t.classList.remove('on'),ms);
}
