import { defineConfig } from 'vite';
export default defineConfig({
  base: './', server: { port: 5173, strictPort: true }, preview: { port: 4173, strictPort: true },
  build: { target: 'es2022' },
  plugins: [{
    name: 'local-offline-cache',
    generateBundle(_, bundle) {
      const assets = ['index.html', 'favicon.svg', ...Object.keys(bundle)];
      const fingerprint = Object.keys(bundle).filter(k => k.endsWith('.js') || k.endsWith('.css')).join('|');
      const source = `const CACHE = ${JSON.stringify('estas-seguro-' + fingerprint)};
const FILES = ${JSON.stringify([...new Set(assets)])};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))));
self.addEventListener('activate', event => event.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('estas-seguro-') && key !== CACHE).map(key => caches.delete(key)))), self.clients.claim()])));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then(cached => cached || fetch(event.request).catch(() => event.request.mode === 'navigate' ? caches.match(new URL('index.html', self.registration.scope), { ignoreVary: true }) : Response.error())));
});`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    }
  }]
});
