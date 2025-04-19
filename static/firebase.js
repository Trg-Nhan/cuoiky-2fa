const firebaseConfig = {
  apiKey: "AIzaSyDOR6ivLePyTR4j3HlHMyN-NB6QS-qSORk",
  authDomain: "sms-auth-demo-f5b14.firebaseapp.com",
  projectId: "sms-auth-demo-f5b14",
  storageBucket: "sms-auth-demo-f5b14.appspot.com",
  messagingSenderId: "194704028483",
  appId: "1:194704028483:web:4c402376687e955bcbf5f6"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

let confirmationResult = null;
let recaptchaVerifier = null;
let countdownTimer = null;

function resetRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  });
  recaptchaVerifier = window.recaptchaVerifier;
  recaptchaVerifier.render().then(widgetId => {
    grecaptcha.reset(widgetId); // đảm bảo reset khi đổi số điện thoại
  });
}

window.sendOtpFirebase = function (phoneNumber) {
  resetRecaptcha(); // 🔁 Luôn reset reCAPTCHA mỗi lần gửi

  auth.signInWithPhoneNumber(phoneNumber, recaptchaVerifier)
    .then(result => {
      confirmationResult = result;
      alert("✅ Mã OTP đã được gửi!");
      startResendCountdown();
    })
    .catch(error => {
      alert("❌ Lỗi gửi OTP: Firebase: " + error.message);
      console.error(error);
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
      window.location.href = "/home";
    })
    .catch(error => {
      alert("❌ Sai mã OTP: " + error.message);
    });
};

window.resendOtp = function () {
  const phone = document.getElementById("phone").value || "{{ phone }}";
  sendOtpFirebase(phone);
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
