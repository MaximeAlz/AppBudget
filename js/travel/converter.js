import { $, esc, num } from '../core/utils.js';
import { CURRENCIES } from './config.js';
import { fmtC, fmtRate, r2, trip } from './model.js';

/* ---------- Convertisseur (hors ligne) ---------- */
export let convDir='toEur';
export let convVal='';
export function renderTConv(){
  const t=trip();
  if(!t){ $('#v-tconv').innerHTML='<div class="empty">Crée d’abord un voyage.</div>'; return; }
  const from = convDir==='toEur'?t.cur:'EUR', to = convDir==='toEur'?'EUR':t.cur;
  const conv = v => convDir==='toEur' ? v/t.rate : v*t.rate;
  const base = t.rate>=500?[1000,5000,10000,20000,50000,100000,200000,500000]
             : t.rate>=50?[100,500,1000,2000,5000,10000,20000,50000]
             : t.rate>=5?[10,50,100,200,500,1000,2000,5000]
             : [1,5,10,20,50,100,200,500];
  const quick = convDir==='toEur' ? base : [1,5,10,20,50,100,200,500];
  $('#v-tconv').innerHTML=`
    <div class="card hero">
      <div class="lbl" style="text-align:center">${from==='EUR'?'Euros':CURRENCIES.find(c=>c[0]===from)?.[1]||from}</div>
      <input class="inp amount" id="cIn" inputmode="decimal" placeholder="0" value="${esc(convVal)}">
      <button class="swapbtn" id="cSwap" aria-label="Inverser">⇅</button>
      <div class="lbl" style="text-align:center">${to==='EUR'?'Euros':CURRENCIES.find(c=>c[0]===to)?.[1]||to}</div>
      <div class="big" id="cOut" style="text-align:center">—</div>
      <div class="hint" style="text-align:center">Taux : 1 € = ${fmtRate(t.rate)} ${t.cur} · modifiable dans Voyages</div>
    </div>
    <div class="card"><h2>Repères rapides</h2>
      <table class="qtable"><tbody>${quick.map(v=>`<tr><td>${fmtC(v,from)}</td><td>${fmtC(conv(v),to)}</td></tr>`).join('')}</tbody></table>
    </div>`;
  const upd=()=>{ convVal=$('#cIn').value; const v=num(convVal); $('#cOut').textContent = v?fmtC(conv(v),to):'—'; };
  $('#cIn').oninput=upd; upd();
  $('#cSwap').onclick=()=>{ const v=num(convVal); convDir=convDir==='toEur'?'fromEur':'toEur'; convVal=v?String(r2(conv(v))).replace('.',','):''; renderTConv(); };
}
