import { month, show } from '../app.js';
import { CAT, CATS } from '../config/categories.js';
import { subsFor } from '../core/budget.js';
import { S } from '../core/storage.js';
import { $, esc, eur, mKey, pad } from '../core/utils.js';
import { TCAT } from '../travel/config.js';
import { toast } from '../ui/toast.js';
import { openExpense } from './expense-form.js';

/* =========================================================
   Historique
   ========================================================= */
export let histFilter='all';
export function renderHist(){
  let list = S.expenses.filter(e=>mKey(e.date)===month).map(e=>({...e}));
  subsFor(month).forEach(s=>list.push({id:'sub-'+s.id, sub:true, date:`${month}-${pad(Math.min(s.day||1,28))}`, amount:s.price, desc:s.name, cat:'abos'}));
  S.trips.filter(t=>t.countInMonth).forEach(t=>t.expenses.filter(e=>mKey(e.date)===month).forEach(e=>list.push({id:'trip-'+e.id, trip:true, date:e.date, ts:e.ts, amount:e.eur, desc:`✈️ ${t.name} · ${e.desc||TCAT[e.cat].name}`, cat:'sorties'})));
  const used = [...new Set(list.map(e=>e.cat))];
  if(histFilter!=='all') list = list.filter(e=>e.cat===histFilter);
  list.sort((a,b)=>b.date.localeCompare(a.date) || (b.ts||0)-(a.ts||0));
  const total = list.reduce((a,e)=>a+e.amount,0);

  let html = `<div class="chips"><button class="chip ${histFilter==='all'?'on':''}" data-f="all">Tout</button>${
    CATS.filter(c=>used.includes(c.id)).map(c=>`<button class="chip ${histFilter===c.id?'on':''}" data-f="${c.id}">${c.icon} ${c.name}</button>`).join('')}</div>`;
  if(!list.length) html += `<div class="empty">Rien pour ce mois-ci.</div>`;
  else{
    html += `<div class="hint" style="margin:4px">${list.length} ligne${list.length>1?'s':''} · total ${eur(total)}</div>`;
    let day='';
    for(const e of list){
      if(e.date!==day){ day=e.date; html += `<div class="day">${new Date(day+'T12:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div>`; }
      const c=CAT[e.cat]||CAT.autre;
      html += `<button class="item" data-id="${e.id}"><div class="em">${c.icon}</div>
        <div class="tx"><div>${esc(e.desc||c.name)}</div><small>${c.name}${e.sub?' · abonnement auto':''}${e.trip?' · voyage':''}</small></div>
        <div class="amt">${eur(e.amount)}</div></button>`;
    }
  }
  $('#v-hist').innerHTML = html;
  document.querySelectorAll('#v-hist .chip').forEach(b=>b.onclick=()=>{histFilter=b.dataset.f;renderHist()});
  document.querySelectorAll('#v-hist .item').forEach(b=>b.onclick=()=>{
    const id=b.dataset.id;
    if(id.startsWith('sub-')){ show('subs'); return; }
    if(id.startsWith('trip-')){ toast('Dépense de voyage : modifiable en mode ✈️ Voyage'); return; }
    openExpense(S.expenses.find(e=>e.id===id));
  });
}
