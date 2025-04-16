// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDOR6ivLePyTR4j3HlHMyN-NB6QS-qSORk",
  authDomain: "sms-auth-demo-f5b14.firebaseapp.com",
  projectId: "sms-auth-demo-f5b14",
  storageBucket: "sms-auth-demo-f5b14.firebasestorage.app",
  messagingSenderId: "194704028483",
  appId: "1:194704028483:web:4c402376687e955bcbf5f6",
  measurementId: "G-DEV70ZFQLW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
  'size': 'invisible'
}, auth);

// Hàm gửi OTP
window.sendOtpFirebase = function(phoneNumber) {
  signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      alert("Mã OTP đã được gửi!");
    })
    .catch((error) => {
      alert("Lỗi gửi OTP: " + error.message);
    });
};

// Hàm xác minh OTP
window.submitOtpFirebase = function() {
  const code = document.getElementById("otp").value;
  window.confirmationResult.confirm(code)
    .then((result) => {
      document.getElementById("otp-form").submit();
    })
    .catch((error) => {
      alert("Mã OTP không đúng hoặc đã hết hạn");
    });
};
