// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
apiKey: "AIzaSyB6Wiy8TwOCcznIc9O1N2bEzFSo5dlnXNQ",
 projectId: "local-delhivery",
  messagingSenderId: "555093562268",
 appId: "1:555093562268:web:8937d8be3fd8c8eb2aae59"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png' // Path to your app icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});