/* Service worker do PDV Manu Presentes.
   A linha VERSION é trocada automaticamente a cada publicação (GitHub Actions),
   e é isso que faz o navegador perceber que existe uma versão nova. */
const VERSION = '__VERSION__';
const CACHE = 'manu-pdv-' + VERSION;
const ASSETS = [
  './',
  './index.html',
  './pwa.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', event => {
  // Baixa tudo direto da rede (sem cache HTTP). Não ativa sozinho:
  // a página decide a hora certa (nunca no meio de uma venda).
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(ASSETS.map(url =>
        fetch(new Request(url, { cache: 'reload' })).then(res => {
          if (!res.ok) throw new Error('Falha ao baixar ' + url);
          return cache.put(url, res);
        })
      ))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('manu-pdv-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'GET_VERSION' && event.source) event.source.postMessage({ type: 'VERSION', version: VERSION });
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase, etc.: sempre direto na internet

  // Abrir o app: usa sempre a versão guardada (funciona sem internet).
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match('./index.html').then(hit => hit || fetch(req))
      ).catch(() => fetch(req))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req))
    )
  );
});
