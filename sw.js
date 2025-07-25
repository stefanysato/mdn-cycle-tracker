// the version of the cache
const VERSION = "v2";

// the name of the cache
const CACHE_NAME = `period-tracker-${VERSION}`;

// the static resources that the app needs to function
const APP_STATIC_RESOURCES = [
    "./",
    "./index.html",
    "./app.js",
    "./style.css",
    "./icons/wheel.svg",
];

// on install, cache the static resources
self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            cache.addAll(APP_STATIC_RESOURCES);
        })(),
    );
});

// delete old caches on activate
self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const names = await caches.keys();
            await Promise.all(
                names.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                    return undefined;
                }),
            );
            await clients.claim();
        })(),
    );
});

// on fetch, intercept server requests
// and respond with cached responses instead of going to network
self.addEventListener("fetch", (event) => {
    // as a single page app, direct app to always go to cached home page
    if (event.request.mode === "navigate") {
        event.respondWith(caches.match("./"));
        return;
    }

    // for all other requests, go to the cache first, and then the network
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request.url);
            if (cachedResponse) {
                // Return the cached response if it's available.
                return cachedResponse;
            }
            // If resource isn't in the cache, return a 404.
            return new Response(null, { status: 404 });
        })(),
    );
});