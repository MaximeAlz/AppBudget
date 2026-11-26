import { month, setMode, show } from '../app.js';
import { CATS } from '../config/categories.js';
import { budgetOf, income, status, totals } from '../core/budget.js';
import { S, save } from '../core/storage.js';
import { $, esc, eur, mName, num, shiftM } from '../core/utils.js';
import { ongoingTrip } from '../travel/model.js';

/* =========================================================
   Tableau de bord
   ========================================================= */
export function renderDash(){
  const t = totals(month), inc = income(month);
  const prev = totals(shiftM(month,-1));
  const left = inc - t.spent - t.invest;

  // Alertes
  const alerts = CATS.filter(c=>!c.goal).map(c=>{
    const b=budgetOf(c.id,month), s=t.by[c.id], st=status(s,b);
    return {c,b,s,st};
  }).filter(a=>a.st==='warn'||a.st==='over').sort((a,b)=>(b.st==='over')-(a.st==='over'));
  const alertHtml = alerts.map(a=> a.st==='over'
    ? `<div class="alert over"><span class="ic">⛔</span><div><b>${a.c.name} : budget dépassé</b><small>${eur(a.s)} sur ${eur(a.b)}${a.b>0?` · +${eur(a.s-a.b)} au-dessus`:' · aucun budget prévu'}</small></div></div>`
    : `<div class="alert warn"><span class="ic">⚠️</span><div><b>${a.c.name} : ${Math.round(a.s/a.b*100)} % du budget</b><small>Il reste ${eur(a.b-a.s)} jusqu’à la fin du mois</small></div></div>`
  ).join('');

  // Lignes de budget
  const rows = CATS.filter(c=>(S.budgets[c.id]||0)>0 || t.by[c.id]>0).map(c=>{
    const b=budgetOf(c.id,month), s=t.by[c.id];
    const pct = b>0?Math.min(100,s/b*100):(s>0?100:0);
    if(c.goal){
      const done = b>0 && s>=b;
      return `<div class="brow"><div class="btop"><div class="bname">${c.icon} ${c.name}${done?'<span class="tag ok">✓ Objectif atteint</span>':''}</div>
        <div class="bnum"><b>${eur(s)}</b> / ${eur(b,0)}</div></div>
        <div class="track"><div class="fill goal" style="width:${pct}%"></div></div>
        <div class="sub">Objectif d’épargne · ${S.budgets[c.id]||0} % du revenu</div></div>`;
    }
    const st=status(s,b);
    const tag = st==='over'?'<span class="tag over">⛔ Dépassé</span>':st==='warn'?'<span class="tag warn">⚠️ Attention</span>':'';
    return `<div class="brow"><div class="btop"><div class="bname">${c.icon} ${c.name}${tag}</div>
      <div class="bnum"><b>${eur(s)}</b> / ${eur(b,0)}</div></div>
      <div class="track"><div class="fill ${st==='ok'?'':st}" style="width:${pct}%"></div></div>
      ${b>0?`<div class="sub">${s<=b?`Reste ${eur(b-s)}`:`${eur(s-b)} de trop`} · ${S.budgets[c.id]} % du revenu</div>`:''}</div>`;
  }).join('');

  // Comparaison avec le mois précédent
  const cmpCats = CATS.filter(c=>t.by[c.id]>0||prev.by[c.id]>0).sort((a,b)=>t.by[b.id]-t.by[a.id]);
  const totAll = t.spent + t.invest || 1;
  const maxShare = Math.max(...cmpCats.map(c=>t.by[c.id]/totAll),0.0001);
  const cmp = cmpCats.map(c=>{
    const d = t.by[c.id]-prev.by[c.id], share=t.by[c.id]/totAll;
    const arrow = Math.abs(d)<0.005?'<span class="ar">=</span>':(d>0?`<span class="ar">▲</span> +${eur(d,0)}`:`<span class="ar">▼</span> −${eur(-d,0)}`);
    return `<tr><td>${c.icon} ${c.name}</td><td>${eur(t.by[c.id],0)}</td>
      <td><span class="sharebar" style="width:${Math.round(share/maxShare*36)}px"></span>${Math.round(share*100)} %</td><td>${arrow}</td></tr>`;
  }).join('');

  $('#v-dash').innerHTML = `
    <div class="card hero">
      <div class="lbl">Reste ce mois-ci</div>
      <div class="big ${left<0?'neg':''}">${eur(left)}</div>
      <div class="grid3">
        <div class="stat"><span class="lbl">Dépensé</span><b>${eur(t.spent,0)}</b></div>
        <div class="stat"><span class="lbl">Investi</span><b>${eur(t.invest,0)}</b></div>
        <div class="stat"><span class="lbl">Utilisé</span><b>${inc>0?Math.round((t.spent+t.invest)/inc*100):0} %</b></div>
      </div>
      <div class="income">Revenu du mois
        <input id="incInp" inputmode="decimal" value="${income(month)}"> €
      </div>
    </div>
    ${ongoingTrip()?`<button class="alert info" id="goTrip" style="width:100%;text-align:left;color:inherit"><span class="ic">✈️</span><div><b>Tu es en voyage : ${esc(ongoingTrip().name)}</b><small>Touche pour passer en mode voyage</small></div></button>`:''}
    ${alertHtml}
    <div class="card"><h2>Budgets</h2>${rows || '<div class="empty">Aucun budget défini</div>'}</div>
    <div class="card"><h2>Évolution des dépenses</h2><div class="chart" id="trend"></div>
      <div class="hint">Dépenses hors investissement · touche une barre pour voir le montant</div></div>
    <div class="card"><h2>Comparaison</h2>
      ${cmp?`<table><thead><tr><th>Catégorie</th><th>Ce mois</th><th>Part</th><th>vs ${mName(shiftM(month,-1),true)}</th></tr></thead><tbody>${cmp}</tbody></table>`
        :'<div class="empty">Pas encore de dépense ce mois-ci.<br>Touche ＋ pour commencer.</div>'}
    </div>`;

  if($('#goTrip')) $('#goTrip').onclick=()=>{S.activeTrip=ongoingTrip().id;setMode('travel')};
  $('#incInp').onchange = e => { S.incomes[month]=num(e.target.value); save(); renderDash(); };
  drawTrend();
}

export function drawTrend(){
  const box=$('#trend'); const months=[...Array(6)].map((_,i)=>shiftM(month,i-5));
  const vals=months.map(m=>totals(m).spent);
  const budgetLine = months.map(m=>CATS.filter(c=>!c.goal).reduce((a,c)=>a+budgetOf(c.id,m),0));
  const max=Math.max(...vals,...budgetLine,1)*1.12;
  const W=320,H=150,top=8,bot=22, bw=30, gap=(W-bw*6)/6;
  const y=v=>top+(H-top-bot)*(1-v/max);
  let bars='';
  months.forEach((m,i)=>{
    const x=gap/2+i*(bw+gap), h=(H-bot)-y(vals[i]);
    const r=Math.min(4,h/2);
    const cur = m===month;
    bars += `<g data-i="${i}">
      <rect x="${x-gap/2}" y="0" width="${bw+gap}" height="${H}" fill="transparent"/>
      ${h>0?`<path d="M${x},${H-bot} V${y(vals[i])+r} q0,-${r} ${r},-${r} h${bw-2*r} q${r},0 ${r},${r} V${H-bot} Z" fill="${cur?'url(#gb)':'#6b5a2a'}"/>`:''}
      <text x="${x+bw/2}" y="${H-6}" text-anchor="middle" font-size="10" fill="${cur?'#f2efe6':'#9a958a'}">${mName(m,true).replace('.','')}</text></g>`;
  });
  // ligne du budget total (même échelle, même unité)
  const bl = budgetLine.map((v,i)=>`${i?'L':'M'}${gap/2+i*(bw+gap)-4},${y(v)} h${bw+8}`).join(' ');
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dépenses des 6 derniers mois">
    <defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dc7c"/><stop offset="1" stop-color="#a8811f"/></linearGradient></defs>
    <line x1="0" x2="${W}" y1="${H-bot}" y2="${H-bot}" stroke="#2a2a2a"/>
    ${bars}
    <path d="${budgetLine.map((v,i)=>`M${gap/2+i*(bw+gap)-4},${y(v)} h${bw+8}`).join(' ')}" stroke="#9a958a" stroke-width="1.5" stroke-dasharray="3 3"/>
  </svg><div class="tip"></div>
  <div class="hint" style="margin-top:4px">┄ budget total prévu (hors investissement)</div>`;
  const tip=box.querySelector('.tip');
  box.querySelectorAll('g[data-i]').forEach(g=>{
    const show=()=>{const i=+g.dataset.i; const r=g.querySelector('rect').getBoundingClientRect(), b=box.getBoundingClientRect();
      tip.innerHTML=`<b>${mName(months[i])}</b><br>Dépensé : ${eur(vals[i])}<br>Budget : ${eur(budgetLine[i],0)}`;
      tip.style.left=(r.left-b.left+r.width/2)+'px'; tip.style.top=(y(vals[i])/H*b.width*H/W)+'px'; tip.style.display='block';};
    g.addEventListener('mouseenter',show); g.addEventListener('click',show);
    g.addEventListener('mouseleave',()=>tip.style.display='none');
  });
}
