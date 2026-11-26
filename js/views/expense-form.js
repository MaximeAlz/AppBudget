import { render, show, view } from '../app.js';
import { CAT, CATS } from '../config/categories.js';
import { budgetOf, status, totals } from '../core/budget.js';
import { guessCat } from '../core/categorize.js';
import { S, save } from '../core/storage.js';
import { $, esc, eur, mKey, norm, num, todayISO, uid } from '../core/utils.js';
import { closeSheet, openSheet } from '../ui/sheet.js';
import { toast } from '../ui/toast.js';

/* =========================================================
   Ajout / modification d'une dépense
   ========================================================= */
export function openExpense(exp){
  const editing = !!exp;
  let chosen = exp?exp.cat:null, manual = editing;
  const sh=$('#sheet');
  sh.innerHTML = `<div class="shead"><h3>${editing?'Modifier':'Nouvelle dépense'}</h3>
      <button class="xbtn" id="fClose" aria-label="Fermer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
    <input class="inp amount" id="fAmt" inputmode="decimal" placeholder="0,00 €" value="${exp?String(exp.amount).replace('.',','):''}">
    <div class="field"><label>Description</label><input class="inp" id="fDesc" placeholder="ex : Uber Eats, courses Lidl, manga…" value="${exp?esc(exp.desc):''}" autocomplete="off"></div>
    <div class="field"><label>Catégorie</label><div class="catgrid" id="fCats"></div>
      <div class="hint" id="fHint"></div></div>
    <div class="field"><label>Date</label><input class="inp" type="date" id="fDate" value="${exp?exp.date:todayISO()}"></div>
    <button class="btn" id="fSave">${editing?'Enregistrer':'Ajouter'}</button>
    ${editing?'<button class="btn danger" id="fDel">Supprimer</button>':''}`;
  const drawCats=()=>{
    const g = guessCat($('#fDesc').value);
    if(!manual) chosen = g;
    $('#fCats').innerHTML = CATS.map(c=>`<button class="cat ${chosen===c.id?'on':''}" data-c="${c.id}">${!manual&&g===c.id?'<i class="auto">AUTO</i>':''}<span>${c.icon}</span>${c.name}</button>`).join('');
    $('#fHint').textContent = !manual&&g ? 'Catégorie devinée à partir de la description · touche une autre pour changer' : (!chosen?'Choisis une catégorie':'');
    $('#fCats').querySelectorAll('.cat').forEach(b=>b.onclick=()=>{chosen=b.dataset.c;manual=true;drawCats()});
  };
  drawCats();
  $('#fClose').onclick=closeSheet;
  $('#fDesc').oninput=drawCats;
  $('#fSave').onclick=()=>{
    const amount=num($('#fAmt').value), desc=$('#fDesc').value.trim(), date=$('#fDate').value||todayISO();
    if(amount<=0){ toast('Entre un montant'); $('#fAmt').focus(); return; }
    if(!chosen){ toast('Choisis une catégorie'); return; }
    // retiens ton choix si l'appli s'était trompée (ou n'avait pas deviné)
    if(desc && guessCat(desc)!==chosen) S.rules[norm(desc)] = chosen;
    const m=mKey(date), b=budgetOf(chosen,m), before=status(totals(m).by[chosen],b);
    if(editing) Object.assign(exp,{amount,desc,cat:chosen,date});
    else S.expenses.push({id:uid(),ts:Date.now(),amount,desc,cat:chosen,date});
    save(); closeSheet();
    const after=status(totals(m).by[chosen],b), c=CAT[chosen];
    if(!c.goal && after==='over' && before!=='over') toast(`⛔ ${c.name} : budget dépassé (${eur(totals(m).by[chosen])} / ${eur(b,0)})`,'over',4200);
    else if(!c.goal && after==='warn' && before==='ok') toast(`⚠️ ${c.name} : ${Math.round(totals(m).by[chosen]/b*100)} % du budget atteint`,'warn',4200);
    else if(c.goal && b>0 && totals(m).by[chosen]>=b && totals(m).by[chosen]-amount<b) toast('📈 Objectif d’investissement atteint, bravo !','',3500);
    else toast(editing?'✓ Modifié':`✓ ${eur(amount)} · ${c.name}`);
    if(view!=='dash'&&view!=='hist') show('dash'); else render();
  };
  if(editing) $('#fDel').onclick=()=>{ S.expenses=S.expenses.filter(e=>e.id!==exp.id); save(); closeSheet(); render(); toast('Dépense supprimée'); };
  openSheet();
  if(!editing) setTimeout(()=>$('#fAmt').focus(),300);
}
