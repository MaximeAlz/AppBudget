import { show } from '../app.js';
import { S } from '../core/storage.js';
import { $, esc, eur, todayISO } from '../core/utils.js';
import { TCATS } from './config.js';
import { addDays, fmtC, fmtRate, newTrip, shortDate, trip, tripStats } from './model.js';

export function renderTripBar(){
  const t=trip(), bar=$('#tripbar');
  $('#brandT').textContent = S.mode==='travel' ? 'Mode voyage' : 'Mon Budget';
  if(!t){ bar.innerHTML=''; return; }
  const st=tripStats(t);
  const when = st.hasDates ? `${shortDate(t.start)} → ${shortDate(t.end)}${st.inTrip?` · jour ${st.dayIdx}/${st.nDays}`:''}` : 'Dates non définies';
  bar.innerHTML = `<div class="tn">✈️ ${esc(t.name)}</div><div class="td">${when} · 1 € = ${fmtRate(t.rate)} ${t.cur}</div>`;
}

/* ---------- Suivi du voyage ---------- */
export function renderTDash(){
  const t=trip();
  if(!t){
    $('#v-tdash').innerHTML = `<div class="card hero" style="text-align:center"><div style="font-size:40px">✈️</div>
      <div class="big" style="font-size:26px">Aucun voyage</div>
      <div class="hint">Crée un voyage, choisis la devise et ton taux de change. Tout marche ensuite sans internet.</div>
      <button class="btn" id="mkTrip">Créer mon voyage</button></div>`;
    $('#mkTrip').onclick=()=>{ newTrip(); show('tset'); };
    return;
  }
  const st=tripStats(t), left=t.budget-st.total;
  const avg = st.elapsed>0 ? st.total/st.elapsed : 0;
  const today = todayISO(), spentToday = st.byDay[today]||0;

  // Alertes
  let alerts='';
  if(t.budget>0){
    const p=st.total/t.budget*100;
    if(p>100) alerts+=`<div class="alert over"><span class="ic">⛔</span><div><b>Budget voyage dépassé</b><small>${eur(st.total)} sur ${eur(t.budget,0)} · +${eur(st.total-t.budget)}</small></div></div>`;
    else if(p>=S.warnAt) alerts+=`<div class="alert warn"><span class="ic">⚠️</span><div><b>${Math.round(p)} % du budget voyage utilisé</b><small>Il reste ${eur(left)}${st.daysLeft?` pour ${st.daysLeft} jour${st.daysLeft>1?'s':''}`:''}</small></div></div>`;
  }
  if(st.inTrip && st.daily>0 && spentToday>st.daily)
    alerts+=`<div class="alert warn"><span class="ic">⚠️</span><div><b>Aujourd’hui : ${eur(spentToday)}</b><small>Au-dessus de ton budget par jour (${eur(st.daily)})</small></div></div>`;

  const perDayLeft = t.budget>0 && st.daysLeft>0 ? Math.max(0,left)/st.daysLeft : null;

  // Catégories
  const cats = TCATS.filter(c=>st.by[c.id]>0).sort((a,b)=>st.by[b.id]-st.by[a.id]);
  const maxC = Math.max(...cats.map(c=>st.by[c.id]),1);
  const catRows = cats.map(c=>`<div class="brow"><div class="btop"><div class="bname">${c.icon} ${c.name}</div>
      <div class="bnum"><b>${eur(st.by[c.id])}</b> · ${Math.round(st.by[c.id]/(st.total||1)*100)} %</div></div>
      <div class="track"><div class="fill" style="width:${st.by[c.id]/maxC*100}%"></div></div>
      <div class="sub">${fmtC(st.by[c.id]*t.rate,t.cur)}</div></div>`).join('');

  $('#v-tdash').innerHTML = `
    <div class="card hero">
      <div class="lbl">${t.budget>0?'Reste pour le voyage':'Dépensé pendant le voyage'}</div>
      <div class="big ${t.budget>0&&left<0?'neg':''}">${t.budget>0?eur(left):eur(st.total)}</div>
      <div class="hint" style="margin-top:0">${t.budget>0?`≈ ${fmtC(left*t.rate,t.cur)}`:`≈ ${fmtC(st.total*t.rate,t.cur)}`}</div>
      <div class="grid3">
        <div class="stat"><span class="lbl">Dépensé</span><b>${eur(st.total,0)}</b></div>
        <div class="stat"><span class="lbl">Budget</span><b>${t.budget>0?eur(t.budget,0):'—'}</b></div>
        <div class="stat"><span class="lbl">Moy./jour</span><b>${eur(avg,0)}</b></div>
      </div>
      ${perDayLeft!==null?`<div class="hint" style="margin-top:12px">Pour tenir ton budget : <b style="color:var(--gold-l)">${eur(perDayLeft)} / jour</b> (≈ ${fmtC(perDayLeft*t.rate,t.cur)}) sur les ${st.daysLeft} jour${st.daysLeft>1?'s':''} restant${st.daysLeft>1?'s':''}</div>`:''}
      ${st.inTrip?`<div class="hint">Aujourd’hui : ${eur(spentToday)}${st.daily?` / ${eur(st.daily,0)} prévus`:''}</div>`:''}
    </div>
    ${alerts}
    <div class="card"><h2>Par catégorie</h2>${catRows||'<div class="empty">Pas encore de dépense.<br>Touche ＋ pour commencer.</div>'}</div>
    ${st.hasDates?`<div class="card"><h2>Par jour</h2><div class="chart" id="dayChart"></div>
      <div class="hint">${st.daily?'┄ budget par jour · ':''}touche une barre pour voir le montant</div></div>`:''}`;
  if(st.hasDates) drawDays(t,st);
}

export function drawDays(t,st){
  const box=$('#dayChart'), n=st.nDays;
  const days=[...Array(n)].map((_,i)=>addDays(t.start,i)), vals=days.map(d=>st.byDay[d]||0);
  const max=Math.max(...vals,st.daily,1)*1.12;
  const W=320,H=140,top=8,bot=22, slot=W/n, bw=Math.max(3,Math.min(26,slot*0.7));
  const y=v=>top+(H-top-bot)*(1-v/max), today=todayISO();
  const every = Math.ceil(n/8);
  let g='';
  days.forEach((d,i)=>{
    const x=i*slot+(slot-bw)/2, h=(H-bot)-y(vals[i]), r=Math.min(3,h/2,bw/2);
    const over = st.daily && vals[i]>st.daily;
    g+=`<g data-i="${i}"><rect x="${i*slot}" y="0" width="${slot}" height="${H}" fill="transparent"/>
      ${h>0?`<path d="M${x},${H-bot} V${y(vals[i])+r} q0,-${r} ${r},-${r} h${bw-2*r} q${r},0 ${r},${r} V${H-bot} Z" fill="${over?'var(--warn)':d===today?'url(#gb2)':'#8a7330'}"/>`:''}
      ${(i%every===0||d===today)?`<text x="${i*slot+slot/2}" y="${H-6}" text-anchor="middle" font-size="9" fill="${d===today?'#f2efe6':'#9a958a'}">${new Date(d+'T12:00').getDate()}</text>`:''}</g>`;
  });
  box.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dépenses par jour du voyage">
    <defs><linearGradient id="gb2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dc7c"/><stop offset="1" stop-color="#a8811f"/></linearGradient></defs>
    <line x1="0" x2="${W}" y1="${H-bot}" y2="${H-bot}" stroke="#2a2a2a"/>${g}
    ${st.daily?`<line x1="0" x2="${W}" y1="${y(st.daily)}" y2="${y(st.daily)}" stroke="#9a958a" stroke-width="1.5" stroke-dasharray="3 3"/>`:''}
  </svg><div class="tip"></div>`;
  const tip=box.querySelector('.tip');
  box.querySelectorAll('g[data-i]').forEach(el=>{
    const sh=()=>{const i=+el.dataset.i, r=el.querySelector('rect').getBoundingClientRect(), b=box.getBoundingClientRect();
      tip.innerHTML=`<b>${new Date(days[i]+'T12:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})}</b><br>${eur(vals[i])} · ${fmtC(vals[i]*t.rate,t.cur)}`;
      tip.style.left=Math.min(Math.max(r.left-b.left+r.width/2,60),b.width-60)+'px'; tip.style.top=(y(vals[i])/H*b.width*H/W)+'px'; tip.style.display='block';};
    el.addEventListener('mouseenter',sh); el.addEventListener('click',sh);
    el.addEventListener('mouseleave',()=>tip.style.display='none');
  });
}
