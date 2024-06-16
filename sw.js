/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/script.js',
  '/data.js',
  '/styles/style.css',
];

self.addEventListener('install', (event) => {
  console.log('Installing service worker and caching static assets');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Activating service worker and cleaning old caches');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
          return null; // Return null to avoid ESLint warning
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  console.log(`Fetching: ${event.request.url}`);
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html').then((response) => {
            if (!response) {
              return new Response('<h1>You are offline</h1>', {
                headers: { 'Content-Type': 'text/html' },
              });
            }
            return response.text().then((html) => {
              const fallbackMessage = `
              <div style="position:fixed;top:0;left:0;width:100%;background:#ffcc00;color:#000;text-align:center;padding:10px;z-index:1000;">
                You are currently offline. Some features may not be available.
              </div>
            `;
              const updatedHTML = html.replace(
                '<body>',
                `<body>${fallbackMessage}`
              );
              return new Response(updatedHTML, {
                headers: { 'Content-Type': 'text/html' },
              });
            });
          });
        }
      })
  );
});
