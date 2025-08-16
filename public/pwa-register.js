// Enregistrement du Service Worker pour PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}