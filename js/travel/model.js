import { S, save } from '../core/storage.js';
import { pad, todayISO, uid } from '../core/utils.js';
import { TCATS } from './config.js';

export const trip = () => S.trips.find(t=>t.id===S.activeTrip) || null;
export const ongoingTrip = () => { const d=todayISO(); return S.trips.find(t=>t.start && t.end && t.start<=d && d<=t.end) || null; };
export const r2 = n => Math.round(n*100)/100;
export function fmtC(n,code){
  const dec = (Number.isInteger(r2(n)) || Math.abs(n)>=1000) ? 0 : 2;
  try{ return n.toLocaleString('fr-FR',{style:'currency',currency:code,minimumFractionDigits:dec,maximumFractionDigits:dec}); }
  catch(e){ return `${n.toLocaleString('fr-FR',{maximumFractionDigits:dec})} ${code}`; }
}
export const fmtRate = n => n.toLocaleString('fr-FR',{maximumSignificantDigits:4});
export const dayDiff = (a,b) => Math.round((new Date(b+'T12:00')-new Date(a+'T12:00'))/864e5);
export const addDays = (iso,n) => { const d=new Date(iso+'T12:00'); d.setDate(d.getDate()+n); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
export const shortDate = iso => new Date(iso+'T12:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'});

export function tripStats(t){
  const by = Object.fromEntries(TCATS.map(c=>[c.id,0])), byDay={};
  let total=0;
  for(const e of t.expenses){ total+=e.eur; by[e.cat]=(by[e.cat]||0)+e.eur; byDay[e.date]=(byDay[e.date]||0)+e.eur; }
  const hasDates = t.start && t.end && t.end>=t.start;
  const nDays = hasDates ? dayDiff(t.start,t.end)+1 : 0;
  const today = todayISO();
  const inTrip = hasDates && t.start<=today && today<=t.end;
  const dayIdx = inTrip ? dayDiff(t.start,today)+1 : 0;           // jour n° X du voyage
  const daysLeft = !hasDates ? 0 : today<t.start ? nDays : inTrip ? nDays-dayIdx+1 : 0; // aujourd'hui compris
  const elapsed = !hasDates ? Object.keys(byDay).length||1 : today<t.start ? 0 : inTrip ? dayIdx : nDays;
  const daily = t.budget>0 && nDays ? t.budget/nDays : 0;
  return {by, byDay, total, hasDates, nDays, inTrip, dayIdx, daysLeft, elapsed, daily};
}


export function newTrip(){
  const t={id:uid(), name:'Mon voyage', cur:'USD', rate:1.08, budget:0, start:todayISO(), end:addDays(todayISO(),6), countInMonth:false, expenses:[]};
  S.trips.push(t); S.activeTrip=t.id; save(); return t;
}
