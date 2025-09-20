// Simple Service Worker for CMS Offline Support
const CACHE_NAME = 'warehouse-cms-v1';
const urlsToCache = [
  '/admin/',
  '/admin/index.html',
  '/admin/config.yml',
  '/favicon.svg',
  'https://unpkg.com/netlify-cms@^2.0.0/dist/netlify-cms.js',
  'https://identity.netlify.com/v1/netlify-identity-widget.js'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 CMS Cache opened');
        return cache.addAll(urlsToCache.filter(url => !url.startsWith('http')));
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});