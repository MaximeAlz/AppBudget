// Cache de l'appli pour qu'elle marche hors connexion.
// Pense à changer VERSION à chaque mise à jour du code.
const VERSION = 'budget-v7';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './js/app.js',
  './js/config/categories.js',
  './js/core/budget.js',
  './js/core/categorize.js',
  './js/core/storage.js',
  './js/core/utils.js',
  './js/travel/config.js',
  './js/travel/converter.js',
  './js/travel/dashboard.js',
  './js/travel/expense-form.js',
  './js/travel/history.js',
  './js/travel/model.js',
  './js/travel/settings.js',
  './js/ui/confirm.js',
  './js/ui/sheet.js',
  './js/ui/toast.js',
  './js/views/dashboard.js',
  './js/views/expense-form.js',
  './js/views/history.js',
  './js/views/settings.js',
  './js/views/subscriptions.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord (pour recevoir les mises à jour), cache si hors ligne.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
