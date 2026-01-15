const CACHE_NAME = 'm-idea-book-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/data.js',
  '/privacy.html',
  '/news.html',
  '/social.html',
  '/logo.png',
  '/m.idea.book2.png',
  '/m.idea.logo.png',
  '/introduction.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});