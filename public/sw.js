// Service Worker minimal pour PWA
self.addEventListener('install', () => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  event.waitUntil(self.clients.claim());
});

// Pas de mise en cache pour l'instant, juste le minimum pour la PWA
self.addEventListener('fetch', () => {
  // Laisser passer toutes les requêtes sans intervention
});