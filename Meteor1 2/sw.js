// Service Worker for WeatherGlass PWA
const CACHE_NAME = 'weatherglass-v1.0.1';
const STATIC_CACHE_NAME = 'weatherglass-static-v1.0.1';
const DATA_CACHE_NAME = 'weatherglass-data-v1.0.1';

// Static assets to cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/history.html',
    '/styles.css',
    '/js/main.js',
    '/js/api.js',
    '/js/state.js',
    '/js/ui.js',
    '/js/charts.js',
    '/js/utils.js',
    '/js/history.js',
    '/manifest.webmanifest',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js',
    'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/relativeTime.js',
    'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/timezone.js',
    'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/utc.js'
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
    /^https:\/\/api\.open-meteo\.com\//,
    /^https:\/\/geocoding-api\.open-meteo\.com\//,
    /^https:\/\/air-quality-api\.open-meteo\.com\//
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Static assets cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache static assets', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DATA_CACHE_NAME && 
                            cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - handle requests with cache strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle different types of requests
    if (request.method === 'GET') {
        // Handle API requests
        if (isApiRequest(url)) {
            event.respondWith(handleApiRequest(request));
        }
        // Handle static assets
        else if (isStaticAsset(url)) {
            event.respondWith(handleStaticAsset(request));
        }
        // Handle app shell (HTML pages)
        else if (request.headers.get('accept')?.includes('text/html')) {
            event.respondWith(handleAppShell(request));
        }
        // Handle other requests (fonts, images, etc.)
        else {
            event.respondWith(handleOtherAssets(request));
        }
    }
});

// Check if request is for an API
function isApiRequest(url) {
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

// Check if request is for a static asset
function isStaticAsset(url) {
    return STATIC_ASSETS.some(asset => {
        if (asset.startsWith('http')) {
            return url.href === asset;
        }
        return url.pathname === asset || url.pathname.endsWith(asset);
    });
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
    const cacheName = DATA_CACHE_NAME;
    
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        // If network fails, try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('Service Worker: Serving API data from cache', request.url);
            return cachedResponse;
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('Service Worker: Network failed, trying cache', request.url);
        
        // Network failed, try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return a custom offline response for API requests
        return new Response(JSON.stringify({
            error: 'Offline',
            message: 'Data not available offline'
        }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // If not in cache, fetch from network and cache
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Failed to fetch static asset', request.url);
        throw error;
    }
}

// Handle app shell (HTML) with cache-first strategy
async function handleAppShell(request) {
    const url = new URL(request.url);
    const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;

    // Try to serve the exact requested HTML from cache
    let cachedResponse = await caches.match(requestedPath);
    if (cachedResponse) {
        return cachedResponse;
    }

    // Fallback to index.html for other HTML navigations if not cached
    if (requestedPath !== '/index.html') {
        cachedResponse = await caches.match('/index.html');
        if (cachedResponse) {
            return cachedResponse;
        }
    }

    // Finally, try network
    try {
        return await fetch(request);
    } catch (error) {
        // Return a simple offline page if we can't serve the app shell
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Meteora - Offline</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif; 
                        padding: 2rem; 
                        color: #fff; 
                        background: #111; 
                    }
                    .box { max-width: 640px; margin: 0 auto; background: #1b1b1b; border-radius: 12px; padding: 1.5rem; border: 1px solid #2a2a2a; }
                    h1 { margin: 0 0 .5rem; font-size: 1.25rem; }
                    p { opacity: .8; line-height: 1.5; }
                </style>
            </head>
            <body>
                <div class="box">
                    <h1>You're offline</h1>
                    <p>The app shell couldn't be loaded. Please check your connection and try again.</p>
                </div>
            </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// Handle other assets (fonts, images, etc.) with cache-first strategy
async function handleOtherAssets(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // If not in cache, fetch from network
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Failed to fetch asset', request.url);
        
        // For fonts and other non-critical assets, we can return a transparent response
        if (request.url.includes('fonts') || request.headers.get('accept')?.includes('font')) {
            return new Response('', { status: 200 });
        }
        
        throw error;
    }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'weather-sync') {
        event.waitUntil(syncWeatherData());
    }
});

// Sync weather data when back online
async function syncWeatherData() {
    try {
        console.log('Service Worker: Syncing weather data');
        
        // Get stored sync requests from IndexedDB or localStorage
        const clients = await self.clients.matchAll();
        
        // Notify all clients to refresh data
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC',
                action: 'refresh-weather'
            });
        });
        
    } catch (error) {
        console.error('Service Worker: Background sync failed', error);
    }
}

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received', event);
    
    const options = {
        body: 'Weather conditions have changed!',
        icon: '/icon-192.png',
        badge: '/icon-96.png',
        tag: 'weather-update',
        requireInteraction: false,
        actions: [
            {
                action: 'view',
                title: 'View Weather'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Meteora', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event);
    
    event.notification.close();
    
    if (event.action === 'view') {
        // Open or focus the app
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then((clients) => {
                // If app is already open, focus it
                for (const client of clients) {
                    if (client.url.includes(self.location.origin)) {
                        return client.focus();
                    }
                }
                
                // Otherwise, open a new window
                return self.clients.openWindow('/');
            })
        );
    }
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

// Cleanup function for old cache entries
async function cleanupOldCacheEntries() {
    const cache = await caches.open(DATA_CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const request of requests) {
        const response = await cache.match(request);
        const dateHeader = response.headers.get('date');
        
        if (dateHeader) {
            const responseDate = new Date(dateHeader).getTime();
            if (now - responseDate > maxAge) {
                await cache.delete(request);
                console.log('Service Worker: Deleted old cache entry', request.url);
            }
        }
    }
}

// Run cleanup periodically
setInterval(cleanupOldCacheEntries, 60 * 60 * 1000); // Every hour