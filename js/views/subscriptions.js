import { SUB_PRESETS } from '../config/categories.js';
import { budgetOf } from '../core/budget.js';
import { S, save } from '../core/storage.js';
import { $, esc, eur, mName, nowM, num, uid } from '../core/utils.js';
import { confirmDel } from '../ui/confirm.js';
import { toast } from '../ui/toast.js';

/* =========================================================
   Abonnements
   ========================================================= */
export function renderSubs(){
  const active=S.subs.filter(s=>!s.end), total=active.reduce((a,s)=>a+s.price,0);
  const b=budgetOf('abos',nowM());
  $('#v-subs').innerHTML = `
    <div class="card hero"><div class="lbl">Abonnements actifs / mois</div><div class="big">${eur(total)}</div>
      <div class="hint">${eur(total*12,0)} par an · budget abonnements : ${eur(b,0)}/mois${b>0&&total>b?' · <b style="color:var(--over)">⛔ au-dessus du budget</b>':''}</div></div>
    <div class="card"><h2>Mes abonnements</h2>
      ${S.subs.length?S.subs.map(s=>`<div class="srow"><div class="n"><div>${esc(s.name)}</div>
        <div class="sub">${eur(s.price)} · prélevé le ${s.day||1}${s.end?` · arrêté (${mName(s.end)})`:''}</div></div>
        <button class="switch ${s.end?'':'on'}" data-t="${s.id}" aria-label="Activer ou arrêter"></button>
        <button class="chip" data-d="${s.id}" aria-label="Supprimer">✕</button></div>`).join('')
        :'<div class="empty">Aucun abonnement.<br>Ajoute-les ci-dessous : ils seront comptés automatiquement chaque mois.</div>'}
    </div>
    <div class="card"><h2>Ajouter</h2>
      <div class="presets">${SUB_PRESETS.map(p=>`<button class="chip" data-p="${p}">${p}</button>`).join('')}</div>
      <div class="field"><label>Nom</label><input class="inp" id="sName" placeholder="ex : Netflix"></div>
      <div class="row"><div class="field" style="flex:1"><label>Prix / mois</label><input class="inp" id="sPrice" inputmode="decimal" placeholder="0,00"></div>
        <div class="field" style="width:110px"><label>Jour</label><input class="inp" id="sDay" inputmode="numeric" placeholder="1"></div></div>
      <button class="btn" id="sAdd">Ajouter l’abonnement</button>
      <div class="hint">Un abonnement arrêté reste compté pour les mois où tu l’as payé, puis plus du tout.</div>
    </div>`;
  document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{$('#sName').value=b.dataset.p;$('#sPrice').focus()});
  document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{
    const s=S.subs.find(x=>x.id===b.dataset.t);
    if(s.end){ s.end=null; } else { s.end=nowM(); }
    save(); renderSubs();
  });
  document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{
    if(!confirmDel(b)) return;
    S.subs=S.subs.filter(x=>x.id!==b.dataset.d); save(); renderSubs(); toast('Abonnement supprimé de tout l’historique');
  });
  $('#sAdd').onclick=()=>{
    const name=$('#sName').value.trim(), price=num($('#sPrice').value), day=Math.min(31,Math.max(1,parseInt($('#sDay').value)||1));
    if(!name||price<=0){ toast('Indique un nom et un prix'); return; }
    S.subs.push({id:uid(),name,price,day,start:nowM(),end:null}); save(); renderSubs(); toast(`✓ ${name} ajouté`);
  };
}
