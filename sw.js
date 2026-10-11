
/* sw.js - FocusList service worker */

const CACHE_NAME = "focuslist-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./style.css",
  "./utils.js",
  "./store.js",
  "./reminders.js",
  "./tasks.js",
  "./notes.js",
  "./projects.js",
  "./settings.js",
  "./main.js",
  "./icon.svg",
  "./icon-maskable-512.png"
];

// Cache app files during installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// Remove older caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith("focuslist-") && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Network first, cache fallback for offline use
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        return caches.match("./index.html");
      })
  );
});

// Open or focus FocusList when a notification is tapped
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((windows) => {
      for (const client of windows) {
        if ("focus" in client) return client.focus();
      }

      return self.clients.openWindow("./index.html");
    })
  );
});
