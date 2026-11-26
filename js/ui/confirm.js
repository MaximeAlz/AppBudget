// Double appui pour confirmer une suppression (pas de fenêtre système)
export function confirmDel(btn){
  if(btn.dataset.armed){ return true; }
  btn.dataset.armed='1'; btn.textContent='Sûr ?'; btn.style.color='var(--over)';
  setTimeout(()=>{ if(btn.isConnected){ delete btn.dataset.armed; btn.textContent='✕'; btn.style.color=''; } },2500);
  return false;
}
