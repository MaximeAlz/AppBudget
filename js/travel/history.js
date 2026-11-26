import { $, esc, eur } from '../core/utils.js';
import { TCAT, TCATS } from './config.js';
import { openTripExpense } from './expense-form.js';
import { dayDiff, fmtC, trip, tripStats } from './model.js';

/* ---------- Liste des dépenses du voyage ---------- */
export let tFilter='all';
export function renderTHist(){
  const t=trip();
  if(!t){ $('#v-thist').innerHTML='<div class="empty">Aucun voyage sélectionné.</div>'; return; }
  let list=[...t.expenses];
  const used=[...new Set(list.map(e=>e.cat))];
  if(tFilter!=='all') list=list.filter(e=>e.cat===tFilter);
  list.sort((a,b)=>b.date.localeCompare(a.date)||(b.ts||0)-(a.ts||0));
  const total=list.reduce((a,e)=>a+e.eur,0);
  let html=`<div class="chips"><button class="chip ${tFilter==='all'?'on':''}" data-f="all">Tout</button>${
    TCATS.filter(c=>used.includes(c.id)).map(c=>`<button class="chip ${tFilter===c.id?'on':''}" data-f="${c.id}">${c.icon} ${c.name}</button>`).join('')}</div>`;
  if(!list.length) html+='<div class="empty">Pas encore de dépense pour ce voyage.</div>';
  else{
    html+=`<div class="hint" style="margin:4px">${list.length} dépense${list.length>1?'s':''} · total ${eur(total)} · ≈ ${fmtC(total*t.rate,t.cur)}</div>`;
    let day='';
    for(const e of list){
      if(e.date!==day){ day=e.date; const st=tripStats(t);
        html+=`<div class="day">${new Date(day+'T12:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}${st.hasDates&&day>=t.start&&day<=t.end?` · jour ${dayDiff(t.start,day)+1}`:''}</div>`; }
      const c=TCAT[e.cat]||TCAT.autre;
      html+=`<button class="item" data-id="${e.id}"><div class="em">${c.icon}</div>
        <div class="tx"><div>${esc(e.desc||c.name)}</div><small>${c.name}${e.cur!=='EUR'?` · ${fmtC(e.amount,e.cur)}`:''}</small></div>
        <div class="amt">${eur(e.eur)}</div></button>`;
    }
  }
  $('#v-thist').innerHTML=html;
  document.querySelectorAll('#v-thist .chip').forEach(b=>b.onclick=()=>{tFilter=b.dataset.f;renderTHist()});
  document.querySelectorAll('#v-thist .item').forEach(b=>b.onclick=()=>openTripExpense(t.expenses.find(e=>e.id===b.dataset.id)));
}
