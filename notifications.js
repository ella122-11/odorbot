
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getMessaging,
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

import {
  getDatabase,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// -----------------------------------------
// FIREBASE CONFIG
// -----------------------------------------

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// -----------------------------------------
// VAPID PUBLIC KEY
// -----------------------------------------

const VAPID_KEY = "YOUR_VAPID_PUBLIC_KEY";

// -----------------------------------------
// INITIALIZE FIREBASE
// -----------------------------------------

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const database = getDatabase(app);

// -----------------------------------------
// REGISTER NOTIFICATIONS
// -----------------------------------------

window.enableOdorBotNotifications = async function() {

  try {

    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      alert("Service workers are not supported.");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Notification permission was not granted.");
      return;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      alert("Unable to obtain the notification token.");
      return;
    }

    // Store this browser's token in Firebase.
    const safeTokenKey = btoa(token).replace(/[.#$/[\]]/g, "_");

    await set(
      ref(database, "notificationTokens/" + safeTokenKey),
      {
        token: token,
        enabled: true,
        platform: "web",
        updatedAt: Date.now()
      }
    );

    localStorage.setItem("odorbot_notifications_enabled", "true");

    updateNotificationButton();

    alert("OdorBot notifications are now enabled!");

  } catch (error) {

    console.error("Notification registration failed:", error);

    alert("Failed to enable notifications: " + error.message);
  }
};

// -----------------------------------------
// FOREGROUND NOTIFICATIONS
// -----------------------------------------

onMessage(messaging, function(payload) {

  console.log("OdorBot notification received:", payload);

  const notification = payload.notification || {};

  // The dashboard is currently open.
  if (Notification.permission === "granted") {

    new Notification(
      notification.title || "OdorBot Alert",
      {
        body: notification.body || "New sensor alert.",
        icon: "/logo.png"
      }
    );

  }
});

// -----------------------------------------
// BUTTON STATUS
// -----------------------------------------

window.updateNotificationButton = function() {

  const button = document.getElementById("notificationButton");

  if (!button) return;

  const enabled =
    localStorage.getItem("odorbot_notifications_enabled") === "true";

  const permissionGranted =
    "Notification" in window &&
    Notification.permission === "granted";

  if (enabled && permissionGranted) {

    button.textContent = "Notifications Enabled";
    button.disabled = true;

  } else {

    button.textContent = "Enable Notifications";
    button.disabled = false;
  }
};

document.addEventListener("DOMContentLoaded", updateNotificationButton);
