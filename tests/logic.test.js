import './setup.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const { S, replaceState, defaults, sanitize } = await import('../js/core/storage.js');
const { guessCat } = await import('../js/core/categorize.js');
const { totals, status, budgetOf } = await import('../js/core/budget.js');
const { tripStats, fmtC } = await import('../js/travel/model.js');

beforeEach(() => replaceState(defaults()));

test('catégorisation automatique', () => {
  assert.equal(guessCat('Uber Eats'), 'dehors');        // le mot-clé le plus long gagne sur "uber"
  assert.equal(guessCat('Uber'), 'transport');
  assert.equal(guessCat('Courses Lidl'), 'quotidien');
  assert.equal(guessCat('Jeu PS5'), 'fun');
  assert.equal(guessCat('truc inconnu'), null);
});

test('la catégorie choisie à la main est retenue', () => {
  S.rules['pizza maison'] = 'quotidien';
  assert.equal(guessCat('Pizza maison'), 'quotidien');
});

test('totaux du mois : dépenses + abonnements, investissement à part', () => {
  S.expenses.push(
    { id:'a', amount:50, desc:'', cat:'quotidien', date:'2026-11-03' },
    { id:'b', amount:300, desc:'', cat:'invest', date:'2026-11-04' },
    { id:'c', amount:99, desc:'', cat:'fun', date:'2026-10-30' },   // autre mois
  );
  S.subs.push({ id:'s', name:'Netflix', price:13.49, day:5, start:'2026-09', end:null });
  const t = totals('2026-11');
  assert.equal(t.by.abos, 13.49);
  assert.equal(t.invest, 300);
  assert.equal(Math.round(t.spent*100)/100, 63.49);
});

test('un abonnement arrêté ne compte plus après son dernier mois', () => {
  S.subs.push({ id:'s', name:'Spotify', price:10, day:1, start:'2026-01', end:'2026-06' });
  assert.equal(totals('2026-06').by.abos, 10);
  assert.equal(totals('2026-07').by.abos, 0);
});

test('seuils d’alerte', () => {
  S.warnAt = 80;
  assert.equal(status(50, 100), 'ok');
  assert.equal(status(80, 100), 'warn');
  assert.equal(status(101, 100), 'over');
  assert.equal(status(5, 0), 'over');
  assert.equal(budgetOf('quotidien','2026-11'), 1800*0.15);
});

test('un voyage ne compte dans le mois que si l’option est activée', () => {
  const trip = { id:'t', name:'Japon', cur:'JPY', rate:160, budget:0, start:'2026-11-01', end:'2026-11-05', countInMonth:false,
    expenses:[{ id:'e', amount:16000, cur:'JPY', rate:160, eur:100, desc:'', cat:'logement', date:'2026-11-02' }] };
  S.trips.push(trip);
  assert.equal(totals('2026-11').by.sorties, 0);
  trip.countInMonth = true;
  assert.equal(totals('2026-11').by.sorties, 100);
});

test('statistiques de voyage', () => {
  const t = sanitize({ trips:[{ id:'t', name:'Japon', cur:'JPY', rate:160, budget:1000, start:'2020-03-01', end:'2020-03-10',
    expenses:[{ amount:16000, cur:'JPY', rate:160, cat:'logement', date:'2020-03-01' },
              { amount:20, cur:'EUR', cat:'resto', date:'2020-03-02' }] }] }).trips[0];
  const st = tripStats(t);
  assert.equal(st.nDays, 10);
  assert.equal(st.total, 120);
  assert.equal(st.daily, 100);
  assert.equal(st.daysLeft, 0);   // voyage terminé
});

test('format des devises', () => {
  assert.match(fmtC(1000, 'JPY'), /1\s?000/);
  assert.match(fmtC(12.5, 'EUR'), /12,50/);
});

test('les données importées sont nettoyées', () => {
  const s = sanitize({
    expenses:[
      { id:'<img src=x onerror=alert(1)>', amount:12, desc:'<b>x</b>', cat:'hack', date:'2026-11-10' },
      { id:'ok', amount:'9999', cat:'fun', date:'2026-11-10' },          // montant texte → rejeté
      { id:'ok2', amount:5, cat:'fun', date:'pas une date' },            // date invalide → rejetée
    ],
    trips:[{ name:'x', cur:'jpy<', rate:-3, expenses:[] }],
    warnAt:'lol', mode:'pirate',
  });
  assert.equal(s.expenses.length, 1);
  assert.match(s.expenses[0].id, /^[a-z0-9]+$/);
  assert.equal(s.expenses[0].cat, 'autre');
  assert.equal(s.trips[0].cur, 'EUR');
  assert.equal(s.trips[0].rate, 1);
  assert.equal(s.warnAt, 80);
  assert.equal(s.mode, 'normal');
});
