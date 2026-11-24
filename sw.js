const CACHE_NAME = 'sepa-xml-dokter-v0-9-1';
const APP_FILES = [
  '/Sepa-XML-dokter-0.9.1/index.html',
  '/Sepa-XML-dokter-0.9.1/manifest.webmanifest',
  '/Sepa-XML-dokter-0.9.1/icon-192.png',
  '/Sepa-XML-dokter-0.9.1/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('sepa-bestandsdokter-') && key !== CACHE_NAME)
            .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);
    if (cached) return cached;

    try {
      const response = await fetch(event.request);
      if (response.ok && url.pathname.startsWith('/Sepa-XML-dokter-0.9.1/')) {
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      if (event.request.mode === 'navigate') {
        return (await cache.match('/Sepa-XML-dokter-0.9.1/index.html')) || Response.error();
      }
      return Response.error();
    }
  })());
});
