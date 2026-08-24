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

// Notification push. L'abonnement est fait avec userVisibleOnly, donc chaque
// message reçu DOIT afficher une notification : sans ça le navigateur affiche
// lui-même un « ce site a été mis à jour en arrière-plan », et finit par
// retirer la permission.
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    // Un push sans charge utile (ou illisible) doit quand même s'afficher.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Let me count', {
      body: payload.body || '',
      icon: '/img/logo.png',
      // Les notifications d'une même dépense se remplacent au lieu de s'empiler
      tag: payload.url || 'letmecount',
      data: { url: payload.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = (event.notification.data && event.notification.data.url) || '/';

  // Reprendre l'onglet déjà ouvert plutôt que d'en ouvrir un second : sur une
  // PWA installée, c'est la même fenêtre que l'utilisateur a sous les yeux.
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus().then((focused) => focused.navigate(url));
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
