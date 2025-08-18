const CACHE_NAME = "taskflow-v1"
const urlsToCache = ["/", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
  self.skipWaiting()
})

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Handle offline actions when back online
  console.log("Background sync triggered")
}

// Push notifications for reminders
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Task reminder!",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "snooze",
        title: "Snooze 15min",
        icon: "/icon-192x192.png",
      },
      {
        action: "complete",
        title: "Mark Complete",
        icon: "/icon-192x192.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("TaskFlow Reminder", options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "snooze") {
    // Handle snooze action
    event.waitUntil(clients.openWindow("/?action=snooze&id=" + event.notification.data.primaryKey))
  } else if (event.action === "complete") {
    // Handle complete action
    event.waitUntil(clients.openWindow("/?action=complete&id=" + event.notification.data.primaryKey))
  } else {
    // Default action - open app
    event.waitUntil(clients.openWindow("/"))
  }
})
