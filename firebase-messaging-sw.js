
/* =========================================
   ODORBOT FIREBASE MESSAGING SERVICE WORKER
   ========================================= */

// Handle notification clicks before importing Firebase
self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  const url = event.notification.data?.url || "/dashboard.html";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(function(clientList) {

      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      return clients.openWindow(url);
    })
  );
});

// Firebase Messaging libraries
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

// =========================================
// FIREBASE CONFIGURATION
// =========================================

const firebaseConfig = {
  apiKey: "AIzaSyAJKIq3K1ItSIyUlyb-8yRwDVrLkmzeJP0",
  authDomain: "odorbot-ea9bb.firebaseapp.com",
  databaseURL: "https://odorbot-ea9bb-default-rtdb.firebaseio.com",
  projectId: "odorbot-ea9bb",
  storageBucket: "odorbot-ea9bb.firebasestorage.app",
  messagingSenderId: "936358417426",
  appId: "1:936358417426:web:d5af9eaf065cef0e17b4cb",
  measurementId: "G-YJ383GWKN3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// =========================================
// BACKGROUND NOTIFICATIONS
// =========================================

messaging.onBackgroundMessage(function(payload) {

  console.log("OdorBot background notification:", payload);

  const notification = payload.notification || {};
  const data = payload.data || {};

  self.registration.showNotification(
    notification.title || "OdorBot Alert",
    {
      body: notification.body || "New monitoring alert.",
      icon: "/logo.png",
      badge: "/logo.png",
      tag: data.alertType || "odorbot-alert",
      renotify: false,
      data: {
        url: data.url || "/dashboard.html"
      }
    }
  );

});
