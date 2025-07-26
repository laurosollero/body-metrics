// Service Worker for BodyMetrics PWA
// Handles offline caching and push notifications

const CACHE_NAME = 'bodymetrics-v1.0';
const STATIC_CACHE_NAME = 'bodymetrics-static-v1.0';
const DATA_CACHE_NAME = 'bodymetrics-data-v1.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/styles/mobile.css',
    '/js/app.js',
    '/js/data.js',
    '/js/charts.js',
    '/js/utils.js',
    '/manifest.json',
    // External dependencies
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[SW] Installation complete');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle different types of requests
    if (request.method === 'GET') {
        // Static files - cache first strategy
        if (isStaticAsset(request.url)) {
            event.respondWith(
                caches.match(request)
                    .then(response => {
                        if (response) {
                            console.log('[SW] Serving from cache:', request.url);
                            return response;
                        }
                        
                        console.log('[SW] Fetching from network:', request.url);
                        return fetch(request)
                            .then(response => {
                                // Don't cache non-successful responses
                                if (!response || response.status !== 200 || response.type !== 'basic') {
                                    return response;
                                }
                                
                                // Clone response before caching
                                const responseClone = response.clone();
                                caches.open(STATIC_CACHE_NAME)
                                    .then(cache => {
                                        cache.put(request, responseClone);
                                    });
                                
                                return response;
                            })
                            .catch(() => {
                                // Return offline fallback for HTML pages
                                if (request.destination === 'document') {
                                    return caches.match('/index.html');
                                }
                            });
                    })
            );
        }
        // API calls or dynamic content - network first strategy
        else {
            event.respondWith(
                fetch(request)
                    .then(response => {
                        // Cache successful responses
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(DATA_CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Fallback to cache
                        return caches.match(request);
                    })
            );
        }
    }
});

// Push event - handle push notifications
self.addEventListener('push', event => {
    console.log('[SW] Push message received');
    
    let notificationData = {
        title: 'BodyMetrics Reminder',
        body: 'Time for your weekly body measurement! 📊',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        tag: 'measurement-reminder',
        requireInteraction: false,
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/icons/add-icon-96x96.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        data: {
            url: '/#entry',
            timestamp: Date.now()
        }
    };

    // Parse push data if available
    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (error) {
            console.warn('[SW] Invalid push data:', error);
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked:', event.notification.tag);
    
    event.notification.close();
    
    const action = event.action;
    const notificationData = event.notification.data;
    
    if (action === 'dismiss') {
        return;
    }
    
    // Default action or 'open' action
    const urlToOpen = notificationData?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin)) {
                        client.focus();
                        return client.navigate(urlToOpen);
                    }
                }
                
                // Open new window/tab
                return clients.openWindow(urlToOpen);
            })
    );
});

// Background sync event (for offline data sync)
self.addEventListener('sync', event => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'measurement-sync') {
        event.waitUntil(syncMeasurements());
    }
});

// Helper functions
function isStaticAsset(url) {
    return STATIC_FILES.some(file => url.includes(file)) ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('.html') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.svg') ||
           url.includes('.woff') ||
           url.includes('.json');
}

function syncMeasurements() {
    return new Promise((resolve, reject) => {
        // This would sync any pending measurements that were saved offline
        // For now, we'll just resolve as the app uses localStorage
        console.log('[SW] Syncing measurements...');
        
        // In a real implementation, you might:
        // 1. Get pending measurements from IndexedDB
        // 2. Send them to a server
        // 3. Clear pending measurements on success
        
        resolve();
    });
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'weekly-reminder-check') {
        event.waitUntil(checkWeeklyReminder());
    }
});

function checkWeeklyReminder() {
    // Check if it's time for weekly reminder
    // This would normally check user preferences and timing
    console.log('[SW] Checking weekly reminder schedule...');
    return Promise.resolve();
}