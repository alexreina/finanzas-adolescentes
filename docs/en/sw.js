const CACHE_NAME = 'finanzas-adolescentes-v3';
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./domina-tu-dinero-desde-el-primer-euro.html",
  "./haz-que-entre-mas-dinero-sin-magia-ni-suerte.html",
  "./tu-dinero-se-esfuma-y-ni-te-das-cuenta.html",
  "./haz-que-tu-dinero-crezca-mientras-haces-otra-cosa.html",
  "./aprende-a-comprar-sin-que-te-vendan-la-moto.html",
  "./lo-barato-sale-caro-cuando-pagas-con-deuda.html",
  "./fuentes.html",
  "./por-que-esta-web.html",
  "./certificado.html",
  "./css/styles.css",
  "./css/tailwind.css",
  "./js/page-helpers.js",
  "./js/progress.js",
  "./js/quiz.js",
  "./js/reto.js",
  "./js/vendor/canvas-confetti.min.js",
  "./js/sw-register.js",
  "./manifest.json",
  "./favicon.svg",
  "./favicon-arrow.svg",
  "./favicon-sparkline.svg",
  "./robots.txt",
  "./img/preview.png",
  "./data/missions.json"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
