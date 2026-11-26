import { S, save } from '../core/storage.js';
import { $, esc, eur, num } from '../core/utils.js';
import { CURRENCIES } from './config.js';
import { renderTripBar } from './dashboard.js';
import { fmtC, fmtRate, newTrip, trip, tripStats } from './model.js';
import { toast } from '../ui/toast.js';

/* ---------- Gestion des voyages ---------- */
export function renderTSet(){
  const t=trip();
  const tripsChips = S.trips.length>1 ? `<div class="card"><h2>Mes voyages</h2><div class="chips" style="flex-wrap:wrap">${
    S.trips.map(x=>`<button class="chip ${x.id===S.activeTrip?'on':''}" data-trip="${x.id}">✈️ ${esc(x.name)}</button>`).join('')}</div></div>` : '';
  if(!t){
    $('#v-tset').innerHTML = tripsChips+`<div class="card" style="text-align:center"><div class="empty" style="padding:20px 0">Aucun voyage pour l’instant.</div><button class="btn" id="tNew">＋ Nouveau voyage</button></div>`;
    bindTripChips(); $('#tNew').onclick=()=>{newTrip();renderTSet();}; return;
  }
  const known = CURRENCIES.some(c=>c[0]===t.cur);
  $('#v-tset').innerHTML = tripsChips + `
    <div class="card"><h2>Voyage</h2>
      <div class="field"><label>Nom</label><input class="inp" id="tName" value="${esc(t.name)}" placeholder="ex : Japon"></div>
      <div class="row"><div class="field" style="flex:1"><label>Départ</label><input class="inp" type="date" id="tStart" value="${t.start||''}"></div>
        <div class="field" style="flex:1"><label>Retour</label><input class="inp" type="date" id="tEnd" value="${t.end||''}"></div></div>
      <div class="field"><label>Budget total (en €)</label><input class="inp" id="tBudget" inputmode="decimal" value="${t.budget||''}" placeholder="ex : 1500 (laisser vide si aucun)"></div>
      <div class="hint" id="tDaily"></div>
    </div>
    <div class="card"><h2>Devise & taux</h2>
      <div class="field"><label>Devise du pays</label>
        <select class="inp" id="tCur">${CURRENCIES.map(([c,n])=>`<option value="${c}" ${c===t.cur?'selected':''}>${c} · ${n}</option>`).join('')}
          <option value="__other" ${known?'':'selected'}>Autre…</option></select></div>
      <div class="field" id="tOtherW" style="display:${known?'none':'block'}"><label>Code de la devise (3 lettres)</label>
        <input class="inp" id="tOther" maxlength="3" value="${known?'':esc(t.cur)}" placeholder="ex : PEN" style="text-transform:uppercase"></div>
      <div class="field"><label>Taux de change</label>
        <div class="ratebox"><span>1 € =</span><input class="inp" id="tRate" inputmode="decimal" value="${String(t.rate).replace('.',',')}"><span id="tCurLbl">${t.cur}</span></div>
        <div class="hint" id="tInv"></div></div>
      <div class="hint">Astuce : regarde le taux avant de partir, ou sur ton ticket de change ou ton relevé bancaire. Les dépenses déjà saisies gardent le taux du moment où tu les as ajoutées.</div>
      ${t.expenses.some(e=>e.cur!=='EUR'&&e.rate!==t.rate)?'<button class="btn ghost" id="tApply">Appliquer ce taux à toutes les dépenses du voyage</button>':''}
    </div>
    <div class="card"><h2>Budget du mois</h2>
      <div class="srow"><div class="n">Compter ce voyage dans mon budget mensuel<div class="sub">Ajouté à « Sorties & voyages » en mode Quotidien</div></div>
      <button class="switch ${t.countInMonth?'on':''}" id="tCount" aria-label="Compter dans le budget mensuel"></button></div>
    </div>
    <button class="btn ghost" id="tNew">＋ Nouveau voyage</button>
    <button class="btn danger" id="tDel">Supprimer ce voyage</button>`;
  const upd=()=>{
    $('#tInv').textContent = t.rate>0 ? `soit 1 ${t.cur} = ${fmtRate(1/t.rate)} €` : '';
    const st=tripStats(t);
    $('#tDaily').textContent = t.budget>0 && st.nDays ? `${st.nDays} jours → ${eur(t.budget/st.nDays)} par jour (≈ ${fmtC(t.budget/st.nDays*t.rate,t.cur)})` : (st.nDays?`${st.nDays} jours`:'');
    $('#tCurLbl').textContent=t.cur; renderTripBar();
  };
  upd();
  $('#tName').oninput=e=>{t.name=e.target.value.trim()||'Mon voyage';save();renderTripBar();};
  $('#tStart').onchange=e=>{t.start=e.target.value; if(t.end&&t.end<t.start) t.end=t.start; save(); renderTSet();};
  $('#tEnd').onchange=e=>{t.end=e.target.value; save(); upd();};
  $('#tBudget').oninput=e=>{t.budget=num(e.target.value);save();upd();};
  $('#tRate').oninput=e=>{const r=num(e.target.value); if(r>0){t.rate=r;save();upd();}};
  $('#tRate').onchange=()=>renderTSet();
  $('#tCur').onchange=e=>{
    if(e.target.value==='__other'){ $('#tOtherW').style.display='block'; $('#tOther').focus(); return; }
    t.cur=e.target.value; if(t.cur==='EUR') t.rate=1; save(); renderTSet(); toast('Pense à mettre à jour le taux');
  };
  $('#tOther').onchange=e=>{const c=e.target.value.trim().toUpperCase(); if(/^[A-Z]{3}$/.test(c)){t.cur=c;save();renderTSet();} else toast('3 lettres, ex : PEN');};
  if($('#tApply')) $('#tApply').onclick=()=>{ t.expenses.forEach(e=>{ if(e.cur!=='EUR'){ e.rate=t.rate; e.eur=e.amount/t.rate; } }); save(); renderTSet(); toast('✓ Taux appliqué à tout le voyage'); };
  $('#tCount').onclick=()=>{t.countInMonth=!t.countInMonth;save();renderTSet();};
  $('#tNew').onclick=()=>{newTrip();renderTSet();toast('Nouveau voyage créé');};
  $('#tDel').onclick=function(){
    if(!this.dataset.armed){ this.dataset.armed='1'; this.textContent=`Supprimer « ${t.name} » et ses ${t.expenses.length} dépenses ?`; setTimeout(()=>{ if(this.isConnected){delete this.dataset.armed; this.textContent='Supprimer ce voyage';} },3000); return; }
    S.trips=S.trips.filter(x=>x.id!==t.id); S.activeTrip=S.trips[0]?.id||null; save(); renderTSet(); toast('Voyage supprimé');
  };
  bindTripChips();
}
export function bindTripChips(){
  document.querySelectorAll('[data-trip]').forEach(b=>b.onclick=()=>{S.activeTrip=b.dataset.trip;save();renderTSet();});
}
