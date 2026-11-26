/* =========================================================
   Stockage (sur le téléphone uniquement, via localStorage)

   Toutes les données passent par sanitize() : au chargement
   comme à l'import d'une sauvegarde. Un fichier modifié ou
   corrompu ne peut donc pas injecter de HTML ni casser l'appli.
   ========================================================= */
import { CATS } from '../config/categories.js';
import { TCATS } from '../travel/config.js';
import { toast } from '../ui/toast.js';
import { uid, nowM } from './utils.js';

export const KEY = 'mon-budget-v1';

export function defaults(){
  return {
    expenses:[], incomes:{}, defaultIncome:1800,
    budgets:Object.fromEntries(CATS.map(c=>[c.id,c.pct])),
    subs:[], rules:{}, warnAt:80,
    trips:[], activeTrip:null, mode:'normal', trules:{},
  };
}

/* ---------- Validation ---------- */
const CAT_IDS  = new Set(CATS.map(c=>c.id));
const TCAT_IDS = new Set(TCATS.map(c=>c.id));
const arr   = v => Array.isArray(v) ? v : [];
const obj   = v => (v && typeof v==='object' && !Array.isArray(v)) ? v : {};
const str   = (v,max=120) => typeof v==='string' ? v.slice(0,max) : '';
const num   = v => (typeof v==='number' && Number.isFinite(v)) ? v : 0;
const pos   = (v,def) => num(v)>0 ? num(v) : def;
const id    = v => (typeof v==='string' && /^[a-z0-9]{1,40}$/i.test(v)) ? v : uid();
const day   = v => (typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) ? v : null;
const month = v => (typeof v==='string' && /^\d{4}-\d{2}$/.test(v)) ? v : null;
const cur   = v => (typeof v==='string' && /^[A-Z]{3}$/.test(v)) ? v : 'EUR';
const rules = (v,ok) => Object.fromEntries(Object.entries(obj(v)).filter(([k,c])=>typeof k==='string' && k.length<=120 && ok.has(c)));

export function sanitize(raw){
  const d = defaults(), r = obj(raw);
  const trips = arr(r.trips).map(t=>{
    t = obj(t);
    const rate = pos(t.rate,1);
    return {
      id:id(t.id), name:str(t.name,60)||'Mon voyage', cur:cur(t.cur), rate,
      budget:Math.max(0,num(t.budget)), start:day(t.start), end:day(t.end), countInMonth:t.countInMonth===true,
      expenses:arr(t.expenses).map(e=>{
        e = obj(e);
        const c = cur(e.cur), er = c==='EUR' ? 1 : pos(e.rate,rate), amount = Math.abs(num(e.amount));
        return { id:id(e.id), ts:num(e.ts), amount, cur:c, rate:er, eur:amount/er,
                 desc:str(e.desc), cat:TCAT_IDS.has(e.cat)?e.cat:'autre', date:day(e.date) };
      }).filter(e=>e.date && e.amount>0),
    };
  });
  return {
    expenses: arr(r.expenses).map(e=>{
      e = obj(e);
      return { id:id(e.id), ts:num(e.ts), amount:Math.abs(num(e.amount)), desc:str(e.desc),
               cat:CAT_IDS.has(e.cat)?e.cat:'autre', date:day(e.date) };
    }).filter(e=>e.date && e.amount>0),
    incomes: Object.fromEntries(Object.entries(obj(r.incomes)).filter(([k,v])=>month(k) && num(v)>=0 && typeof v==='number')),
    defaultIncome: num(r.defaultIncome)>=0 && 'defaultIncome' in r ? num(r.defaultIncome) : d.defaultIncome,
    budgets: Object.fromEntries(CATS.map(c=>[c.id, typeof obj(r.budgets)[c.id]==='number' ? Math.max(0,num(r.budgets[c.id])) : d.budgets[c.id]])),
    subs: arr(r.subs).map(s=>{
      s = obj(s);
      return { id:id(s.id), name:str(s.name,60)||'Abonnement', price:Math.abs(num(s.price)),
               day:Math.min(31,Math.max(1,Math.round(num(s.day))||1)), start:month(s.start)||nowM(), end:month(s.end) };
    }).filter(s=>s.price>0),
    rules: rules(r.rules, CAT_IDS),
    trules: rules(r.trules, TCAT_IDS),
    warnAt: Math.min(100,Math.max(1,num(r.warnAt)||d.warnAt)),
    trips,
    activeTrip: trips.some(t=>t.id===r.activeTrip) ? r.activeTrip : (trips[0]?.id || null),
    mode: r.mode==='travel' ? 'travel' : 'normal',
  };
}

/* ---------- Lecture / écriture ---------- */
export function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(raw) return sanitize(JSON.parse(raw));
  }catch(e){}
  return defaults();
}

/** L'état de l'appli. Toujours le même objet : on le modifie, on ne le remplace pas. */
export const S = load();

export function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(S)); }
  catch(e){ toast('⚠️ Impossible d’enregistrer sur cet appareil','over'); }
}

/** Remplace tout l'état (import d'une sauvegarde, remise à zéro). */
export function replaceState(raw){
  const clean = sanitize(raw);
  for(const k of Object.keys(S)) delete S[k];
  Object.assign(S, clean);
}
