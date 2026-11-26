import { CATS } from '../config/categories.js';
import { S } from './storage.js';
import { mKey } from './utils.js';

/* =========================================================
   Calculs du mois
   ========================================================= */
export const income = m => S.incomes[m] ?? S.defaultIncome;
export const subsFor = m => S.subs.filter(s => s.start<=m && (!s.end || s.end>=m));
export function totals(m){
  const by = Object.fromEntries(CATS.map(c=>[c.id,0]));
  for(const e of S.expenses) if(mKey(e.date)===m) by[e.cat]=(by[e.cat]||0)+e.amount;
  for(const s of subsFor(m)) by.abos += s.price;
  for(const t of S.trips) if(t.countInMonth) for(const e of t.expenses) if(mKey(e.date)===m) by.sorties += e.eur;
  const invest = by.invest;
  const spent = Object.entries(by).reduce((a,[k,v])=>k==='invest'?a:a+v,0);
  return {by, spent, invest};
}
export const budgetOf = (cat,m) => income(m)*(S.budgets[cat]||0)/100;
export function status(spent,budget){
  if(budget<=0) return spent>0?'over':'none';
  const r = spent/budget;
  if(r>1) return 'over';
  if(r*100>=S.warnAt) return 'warn';
  return 'ok';
}
