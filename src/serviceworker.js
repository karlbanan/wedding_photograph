const cacheName = 'WeddingPhotograph';
const staticAssets = [
    '/assets/delete.svg',
    '/assets/icon-camera-72.png',
    '/assets/icon-camera-96.png',
    '/assets/icon-camera-120.png',
    '/assets/icon-camera-128.png',
    '/assets/icon-camera-144.png',
    '/assets/icon-camera-152.png',
    '/assets/icon-camera-180.png',
    '/assets/icon-camera-192.png',
    '/assets/icon-camera-384.png',
    '/assets/icon-camera-512.png',
    '/assets/icon-camera.svg',
    '/assets/icon-gallery.svg',
    '/index.html',
    '/manifest.json',
    '/style.css',
    '/app.js'
];

self.addEventListener('install', (e) => {
    console.log('Service workers is installing...');
    e.waitUntil(
        caches
        .open(cacheName)
        .then(cache => cache.addAll(staticAssets))
    );
})

self.addEventListener('activate', () => {
    console.log('Service worker is now activated.')
})

self.addEventListener('fetch', (e) => {
    console.log(e.request.url)
    e.respondWith(
        caches
        .match(e.request)
        .then(resp => resp || fetch(e.request))
    )
})