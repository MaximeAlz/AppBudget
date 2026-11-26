import { S, save } from './core/storage.js';
import { $, mName, nowM, shiftM } from './core/utils.js';
import { renderTConv } from './travel/converter.js';
import { renderTDash, renderTripBar } from './travel/dashboard.js';
import { openTripExpense } from './travel/expense-form.js';
import { renderTHist } from './travel/history.js';
import { trip } from './travel/model.js';
import { renderTSet } from './travel/settings.js';
import { closeSheet } from './ui/sheet.js';
import { toast } from './ui/toast.js';
import { renderDash } from './views/dashboard.js';
import { openExpense } from './views/expense-form.js';
import { renderHist } from './views/history.js';
import { renderSet } from './views/settings.js';
import { renderSubs } from './views/subscriptions.js';

/* =========================================================
   Navigation
   ========================================================= */
export let view=S.mode==='travel'?'tdash':'dash';
export let month=nowM();
export const ICON={
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  swap:'<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
};
export function renderNav(){
  const items = S.mode==='travel'
    ? [['tdash','Voyage','chart'],['thist','Dépenses','list'],['tconv','Convertir','swap'],['tset','Voyages','globe']]
    : [['dash','Suivi','chart'],['hist','Historique','list'],['subs','Abos','card'],['set','Réglages','gear']];
  const b=([v,l,i])=>`<button data-v="${v}" class="${view===v?'on':''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${ICON[i]}</svg>${l}</button>`;
  $('#nav').innerHTML = b(items[0])+b(items[1])+
    '<button class="add" id="addBtn" aria-label="Ajouter une dépense"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg></button>'+
    b(items[2])+b(items[3]);
  $('#nav').querySelectorAll('button[data-v]').forEach(x=>x.onclick=()=>show(x.dataset.v));
  $('#addBtn').onclick=()=>{
    if(S.mode!=='travel') return openExpense();
    if(!trip()){ show('tset'); toast('Crée d’abord ton voyage'); return; }
    openTripExpense();
  };
  document.querySelectorAll('#modeSw button').forEach(x=>{x.classList.toggle('on',x.dataset.m===S.mode); x.onclick=()=>setMode(x.dataset.m);});
}
export function setMode(m){ S.mode=m; save(); view=m==='travel'?'tdash':'dash'; show(view); }
$('#prevM').onclick=()=>{month=shiftM(month,-1);render()};
$('#nextM').onclick=()=>{month=shiftM(month,1);render()};
$('#overlay').onclick=closeSheet;
export function show(v){
  view=v; renderNav();
  document.querySelectorAll('.view').forEach(s=>s.classList.toggle('on',s.id==='v-'+v));
  $('#monthnav').style.display = (v==='dash'||v==='hist')?'flex':'none';
  $('#tripbar').style.display = (S.mode==='travel' && v!=='tset' && trip())?'block':'none';
  render(); window.scrollTo(0,0);
}
export function render(){
  $('#mLabel').textContent = mName(month);
  renderTripBar();
  ({dash:renderDash,hist:renderHist,subs:renderSubs,set:renderSet,tdash:renderTDash,thist:renderTHist,tconv:renderTConv,tset:renderTSet})[view]();
}


show(view);
if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('sw.js').catch(()=>{});
