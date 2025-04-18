const firebaseConfig = {
  apiKey: "AIzaSyDOR6ivLePyTR4j3HlHMyN-NB6QS-qSORk",
  authDomain: "sms-auth-demo-f5b14.firebaseapp.com",
  projectId: "sms-auth-demo-f5b14",
  storageBucket: "sms-auth-demo-f5b14.firebasestorage.app",
  messagingSenderId: "194704028483",
  appId: "1:194704028483:web:4c402376687e955bcbf5f6",
  measurementId: "G-DEV70ZFQLW"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
let confirmationResult = null;
let countdownTimer = null;

window.sendOtpFirebase = function (phoneNumber) {
  const recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  });

  auth.signInWithPhoneNumber(phoneNumber, recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      alert("✅ Mã OTP đã được gửi!");
      startResendCountdown();
    })
    .catch((error) => {
      alert("❌ Lỗi gửi OTP: " + error.message);
    });
};

window.submitOtpFirebase = function () {
  const code = document.getElementById("otp").value;
  if (!confirmationResult) {
    alert("❗ Mã OTP chưa được gửi.");
    return;
  }

  confirmationResult.confirm(code)
    .then(() => {
      alert("✅ Xác minh OTP thành công!");
      window.location.href = "/home";  // ✅ Sửa lại để chuyển đúng
    })
    .catch((error) => {
      alert("❌ Sai mã OTP: " + error.message);
    });
};

window.resendOtp = function () {
  const phone = "{{ phone }}";
  sendOtpFirebase(phone);
  startResendCountdown();
};

function startResendCountdown() {
  const btn = document.getElementById("resend-btn");
  let countdown = 60;
  btn.disabled = true;
  btn.textContent = `Gửi lại mã (${countdown}s)`;

  countdownTimer = setInterval(() => {
    countdown--;
    btn.textContent = `Gửi lại mã (${countdown}s)`;

    if (countdown === 0) {
      clearInterval(countdownTimer);
      btn.disabled = false;
      btn.textContent = "Gửi lại mã";
    }
  }, 1000);
}
