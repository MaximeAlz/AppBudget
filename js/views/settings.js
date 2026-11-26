import { render } from '../app.js';
import { CATS } from '../config/categories.js';
import { S, defaults, replaceState, save } from '../core/storage.js';
import { $, eur, num, todayISO } from '../core/utils.js';
import { confirmDel } from '../ui/confirm.js';
import { toast } from '../ui/toast.js';

/* =========================================================
   Réglages
   ========================================================= */
export function renderSet(){
  const inc=S.defaultIncome;
  const sumPct = () => CATS.reduce((a,c)=>a+(S.budgets[c.id]||0),0);
  $('#v-set').innerHTML = `
    <div class="card"><h2>Revenu</h2>
      <div class="srow"><div class="n">Revenu mensuel habituel<div class="sub">Modifiable mois par mois depuis le suivi</div></div>
      <input id="dInc" inputmode="decimal" value="${inc}" style="width:90px"> €</div></div>
    <div class="card"><h2>Budget par catégorie</h2><div class="hint" style="margin:-6px 0 6px">En % de ton revenu</div>
      ${CATS.map(c=>`<div class="srow"><div class="n">${c.icon} ${c.name}${c.goal?'<div class="sub">Objectif à atteindre, pas une limite</div>':''}</div>
        <input data-b="${c.id}" inputmode="decimal" value="${S.budgets[c.id]||0}"><span style="color:var(--muted)">%</span>
        <div class="eur" id="e-${c.id}">${eur(inc*(S.budgets[c.id]||0)/100,0)}</div></div>`).join('')}
      <div class="total"><span>Total alloué</span><span id="sumP"></span></div>
      <div class="hint" id="sumH"></div>
      <button class="btn ghost" id="resetPct">Revenir aux % conseillés</button>
    </div>
    <div class="card"><h2>Alertes</h2>
      <div class="srow"><div class="n">Prévenir à partir de<div class="sub">⚠️ au-delà de ce seuil, ⛔ au-delà de 100 %</div></div>
      <input id="warnAt" inputmode="numeric" value="${S.warnAt}"><span style="color:var(--muted)">%</span></div></div>
    <div class="card"><h2>Sauvegarde</h2>
      <div class="hint" style="margin-top:0">Tes données sont uniquement sur ce téléphone. Exporte-les de temps en temps (dans Fichiers ou iCloud Drive) pour ne rien perdre.</div>
      <button class="btn ghost" id="exp">Exporter mes données</button>
      <button class="btn ghost" id="imp">Importer une sauvegarde</button>
      <input type="file" id="impF" accept="application/json,.json" hidden>
      <button class="btn danger" id="wipe">Tout effacer</button>
    </div>`;
  const upd=()=>{ const s=sumPct(); $('#sumP').textContent=s+' %';
    $('#sumH').innerHTML = s>100?`<span style="color:var(--over)">⛔ Tu alloues plus que ton revenu (${s} %)</span>`
      : `Marge non allouée : ${100-s} % (${eur(S.defaultIncome*(100-s)/100,0)}) · ton coussin pour les imprévus`; };
  upd();
  $('#dInc').onchange=e=>{S.defaultIncome=num(e.target.value);save();renderSet()};
  document.querySelectorAll('[data-b]').forEach(i=>i.oninput=()=>{
    S.budgets[i.dataset.b]=Math.max(0,num(i.value)); save();
    $('#e-'+i.dataset.b).textContent=eur(S.defaultIncome*S.budgets[i.dataset.b]/100,0); upd();
  });
  $('#resetPct').onclick=()=>{S.budgets=Object.fromEntries(CATS.map(c=>[c.id,c.pct]));save();renderSet();toast('% conseillés rétablis')};
  $('#warnAt').onchange=e=>{S.warnAt=Math.min(100,Math.max(1,num(e.target.value)||80));save();toast('Seuil enregistré')};
  $('#exp').onclick=exportData;
  $('#imp').onclick=()=>$('#impF').click();
  $('#impF').onchange=e=>{
    const f=e.target.files[0]; if(!f) return;
    f.text().then(t=>{ const d=JSON.parse(t); if(!Array.isArray(d.expenses)) throw 0; replaceState(d); save(); render(); toast('✓ Sauvegarde importée'); })
      .catch(()=>toast('Fichier invalide','over'));
  };
  $('#wipe').onclick=function(){ if(!confirmDel(this)) return; replaceState(defaults()); save(); renderSet(); toast('Tout a été effacé'); };
}
export async function exportData(){
  const name=`budget-${todayISO()}.json`, blob=new Blob([JSON.stringify(S,null,1)],{type:'application/json'});
  try{
    const file=new File([blob],name,{type:'application/json'});
    if(navigator.canShare && navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:'Sauvegarde budget'}); return; }
  }catch(e){ if(e && e.name==='AbortError') return; }
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
