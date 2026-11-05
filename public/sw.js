const SHELL_CACHE = 'book-tracker-shell-v1'
const ASSET_CACHE = 'book-tracker-assets-v1'
const scopeUrl = self.registration.scope
const shellAssets = [
  new URL('./', scopeUrl).href,
  new URL('index.html', scopeUrl).href,
  new URL('manifest.webmanifest', scopeUrl).href,
  new URL('icons/book-tracker.svg', scopeUrl).href,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(shellAssets))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('book-tracker-') && ![SHELL_CACHE, ASSET_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            void caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(async () => (await caches.match(request)) ?? (await caches.match(shellAssets[0]))),
    )
    return
  }

  if (!['script', 'style', 'image', 'font'].includes(request.destination)) return

  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached
      const response = await fetch(request)
      if (response.ok) {
        await caches.open(ASSET_CACHE).then((cache) => cache.put(request, response.clone()))
      }
      return response
    }),
  )
})