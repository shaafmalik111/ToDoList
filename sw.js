/* sw.js - service worker: makes the app work offline and shows notifications */

// Change this number whenever you update the app files, so phones fetch the new version
const CACHE_NAME = "focuslist-v1";

const APP_FILES = [
  "./",
  "index.html",
  "manifest.json",
  "js/utils.js",
  "js/store.js",
  "js/reminders.js",
  "js/tasks.js",
  "js/notes.js",
  "js/projects.js",
  "js/settings.js",
  "icons/icon-512.png"
  "./icon.svg",
"./style.css",
"./main.js"
];

// Save all app files when the service worker is installed
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// Remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Network first (always fresh when online), cache when offline
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("index.html")))
  );
});

// Tapping a notification opens (or focuses) the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow("./index.html");
    })
  );
});
