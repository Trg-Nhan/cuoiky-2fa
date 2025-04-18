// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD0R6ivLePyTR4j3HlHMyN-NB6QS-qSORk",
  authDomain: "sms-auth-demo-f5b14.firebaseapp.com",
  projectId: "sms-auth-demo-f5b14",
  storageBucket: "sms-auth-demo-f5b14.appspot.com",
  messagingSenderId: "678811841630",
  appId: "1:678811841630:web:4c402376687e955bbcf5f6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let confirmationResult = null;
let timerInterval;

window.sendOtpFirebase = function (phoneNumber) {
  const recaptchaContainer = document.getElementById("recaptcha-container");
  recaptchaContainer.innerHTML = "";

  const recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {
    size: "invisible"
  }, auth);

  signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      alert("✅ Đã gửi mã OTP thành công!");
      startCountdown();
    })
    .catch((error) => {
      console.error("Lỗi gửi OTP:", error);
      alert("❌ Lỗi gửi OTP: " + error.message);
    });
};

window.submitOtpFirebase = function () {
  const otp = document.getElementById("otp").value;
  if (!otp || !confirmationResult) {
    alert("❌ Vui lòng nhập mã OTP hợp lệ.");
    return;
  }
  confirmationResult.confirm(otp)
    .then(() => {
      window.location.href = "/auth/success";
    })
    .catch((error) => {
      console.error("Lỗi xác minh OTP:", error);
      alert("❌ Mã OTP không đúng hoặc đã hết hạn.");
    });
};

window.resendOtp = function () {
  const resendBtn = document.getElementById("resend-btn");
  const phoneNumber = resendBtn.dataset.phone;
  if (!phoneNumber) return;
  sendOtpFirebase(phoneNumber);
};

function startCountdown() {
  const resendBtn = document.getElementById("resend-btn");
  let timeLeft = 30;
  resendBtn.disabled = true;
  resendBtn.innerText = `Gửi lại mã (${timeLeft}s)`;

  timerInterval = setInterval(() => {
    timeLeft--;
    resendBtn.innerText = `Gửi lại mã (${timeLeft}s)`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      resendBtn.innerText = "Gửi lại mã";
      resendBtn.disabled = false;
    }
  }, 1000);
}
