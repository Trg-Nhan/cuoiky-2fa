// static/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyDOR6ivLePyTR4j3HlHMyN-NB6QS-qSORk",
  authDomain: "sms-auth-demo-f5b14.firebaseapp.com",
  projectId: "sms-auth-demo-f5b14",
  storageBucket: "sms-auth-demo-f5b14.firebasestorage.app",
  messagingSenderId: "194704028483",
  appId: "1:194704028483:web:4c402376687e955bcbf5f6"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

Notification.requestPermission().then((permission) => {
  if (permission === "granted") {
    getToken(messaging, { vapidKey: "BCZfklmHxRLiCAi2vZSGA13yTWTcy2Il_HWqueR1RjGVCmwxhPA-NwTNNZoq0KF9C_hFroM8HrL1BXT5Pz8Ppdw" }).then((currentToken) => {
      if (currentToken) {
        console.log("Token:", currentToken);
        fetch("/save_push_token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: currentToken })
        });
      }
    });
  }
});

onMessage(messaging, (payload) => {
  console.log("Push received:", payload);
  alert(payload.notification.title + ": " + payload.notification.body);
});
