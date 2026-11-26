import { render } from '../app.js';
import { guessIn } from '../core/categorize.js';
import { S, save } from '../core/storage.js';
import { $, esc, eur, norm, num, todayISO, uid } from '../core/utils.js';
import { TCATS, TKEYWORDS } from './config.js';
import { fmtC, fmtRate, trip, tripStats } from './model.js';
import { closeSheet, openSheet } from '../ui/sheet.js';
import { toast } from '../ui/toast.js';

/* ---------- Saisie d'une dépense de voyage ---------- */
export function openTripExpense(exp){
  const t=trip(), editing=!!exp;
  let cur = exp?exp.cur:t.cur, chosen=exp?exp.cat:null, manual=editing;
  const sh=$('#sheet');
  sh.innerHTML=`<div class="shead"><h3>${editing?'Modifier':'Dépense voyage'}</h3>
      <button class="xbtn" id="fClose" aria-label="Fermer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
    ${t.cur!=='EUR'?`<div class="curtog" id="fCur"></div>`:''}
    <input class="inp amount" id="fAmt" inputmode="decimal" placeholder="0" value="${exp?String(exp.amount).replace('.',','):''}">
    <div class="conv" id="fConv"></div>
    <div class="field"><label>Description</label><input class="inp" id="fDesc" placeholder="ex : ramen, taxi, musée…" value="${exp?esc(exp.desc):''}" autocomplete="off"></div>
    <div class="field"><label>Catégorie</label><div class="catgrid" id="fCats"></div><div class="hint" id="fHint"></div></div>
    <div class="field"><label>Date</label><input class="inp" type="date" id="fDate" value="${exp?exp.date:todayISO()}"></div>
    <button class="btn" id="fSave">${editing?'Enregistrer':'Ajouter'}</button>
    ${editing?'<button class="btn danger" id="fDel">Supprimer</button>':''}`;
  const rateOf = () => editing && exp.cur!=='EUR' ? exp.rate : t.rate;
  const drawCur=()=>{
    if(!$('#fCur')) return;
    $('#fCur').innerHTML=[t.cur,'EUR'].map(c=>`<button class="chip ${cur===c?'on':''}" data-c="${c}">${c==='EUR'?'€ Euro':c}</button>`).join('');
    $('#fCur').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{cur=b.dataset.c;drawCur();drawConv();});
  };
  const drawConv=()=>{
    const a=num($('#fAmt').value);
    $('#fAmt').placeholder = cur==='EUR' ? '0,00 €' : `0 ${t.cur}`;
    $('#fConv').innerHTML = !a ? (cur==='EUR'?'Montant en euros':`Montant en ${t.cur} · 1 € = ${fmtRate(rateOf())} ${t.cur}`)
      : cur==='EUR' ? `≈ <b>${fmtC(a*rateOf(),t.cur)}</b>` : `≈ <b>${eur(a/rateOf())}</b>`;
  };
  const drawCats=()=>{
    const g=guessIn($('#fDesc').value,S.trules,TKEYWORDS);
    if(!manual) chosen=g;
    $('#fCats').innerHTML=TCATS.map(c=>`<button class="cat ${chosen===c.id?'on':''}" data-c="${c.id}">${!manual&&g===c.id?'<i class="auto">AUTO</i>':''}<span>${c.icon}</span>${c.name}</button>`).join('');
    $('#fHint').textContent = !manual&&g ? 'Catégorie devinée · touche une autre pour changer' : (!chosen?'Choisis une catégorie':'');
    $('#fCats').querySelectorAll('.cat').forEach(b=>b.onclick=()=>{chosen=b.dataset.c;manual=true;drawCats()});
  };
  drawCur(); drawConv(); drawCats();
  $('#fAmt').oninput=drawConv; $('#fDesc').oninput=drawCats; $('#fClose').onclick=closeSheet;
  $('#fSave').onclick=()=>{
    const amount=num($('#fAmt').value), desc=$('#fDesc').value.trim(), date=$('#fDate').value||todayISO();
    if(amount<=0){ toast('Entre un montant'); return; }
    if(!chosen){ toast('Choisis une catégorie'); return; }
    if(desc && guessIn(desc,S.trules,TKEYWORDS)!==chosen) S.trules[norm(desc)]=chosen;
    const rate = cur==='EUR' ? 1 : rateOf();
    const eurAmt = cur==='EUR' ? amount : amount/rate;
    const before = tripStats(t).total;
    const data = {amount, cur, rate, eur:eurAmt, desc, cat:chosen, date};
    if(editing) Object.assign(exp,data); else t.expenses.push({id:uid(), ts:Date.now(), ...data});
    save(); closeSheet();
    const st=tripStats(t), b=t.budget;
    if(b>0 && st.total>b && before<=b) toast(`⛔ Budget voyage dépassé (${eur(st.total)} / ${eur(b,0)})`,'over',4200);
    else if(b>0 && st.total/b*100>=S.warnAt && before/b*100<S.warnAt) toast(`⚠️ ${Math.round(st.total/b*100)} % du budget voyage utilisé`,'warn',4200);
    else if(st.daily && date===todayISO() && (st.byDay[date]||0)>st.daily && (st.byDay[date]-eurAmt)<=st.daily) toast(`⚠️ Budget du jour dépassé (${eur(st.byDay[date])} / ${eur(st.daily,0)})`,'warn',4200);
    else toast(editing?'✓ Modifié':`✓ ${cur==='EUR'?eur(amount):`${fmtC(amount,cur)} ≈ ${eur(eurAmt)}`}`);
    render();
  };
  if(editing) $('#fDel').onclick=()=>{ t.expenses=t.expenses.filter(e=>e.id!==exp.id); save(); closeSheet(); render(); toast('Dépense supprimée'); };
  openSheet();
  if(!editing) setTimeout(()=>$('#fAmt').focus(),300);
}
