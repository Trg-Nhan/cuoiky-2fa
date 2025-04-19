// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDOR6ivLePyTR4j3HlHMyN-NB6QS-qSORk",
  authDomain: "sms-auth-demo-f5b14.firebaseapp.com",
  projectId: "sms-auth-demo-f5b14",
  storageBucket: "sms-auth-demo-f5b14.appspot.com",
  messagingSenderId: "194704028483",
  appId: "1:194704028483:web:4c402376687e955bcbf5f6",
  measurementId: "G-DEV70ZFQLW"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

let confirmationResult = null;
let resendTimer = null;

function resetRecaptcha() {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear(); // 🔁 Reset lại reCAPTCHA nếu có
    } catch (e) {
      console.warn("Không thể clear reCAPTCHA:", e);
    }
  }

  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  });

  return window.recaptchaVerifier.render(); // Trả về promise
}

window.sendOtpFirebase = function (phoneNumber) {
  resetRecaptcha().then(widgetId => {
    window.recaptchaWidgetId = widgetId;

    auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
      .then((result) => {
        confirmationResult = result;
        alert("✅ Mã OTP đã được gửi tới số " + phoneNumber);
        startResendCountdown();  // nếu bạn có đồng hồ đếm ngược
      })
      .catch((error) => {
        alert("❌ Lỗi gửi OTP: Firebase: " + error.message);
        console.error(error);
      });
  });
};

window.verifyOtpFirebase = function (otpCode) {
  if (!confirmationResult) {
    alert("❗Bạn cần gửi OTP trước khi xác minh.");
    return;
  }

  confirmationResult.confirm(otpCode)
    .then((result) => {
      alert("✅ Xác thực thành công!");
      const user = result.user;
      console.log("Logged in user:", user);
    })
    .catch((error) => {
      alert("❌ Sai mã OTP hoặc đã hết hạn: " + error.message);
    });
};

// ✅ Optional: Countdown để không spam OTP
function startResendCountdown() {
  const resendBtn = document.getElementById("resend-btn");
  if (!resendBtn) return;

  let timeLeft = 60;
  resendBtn.disabled = true;
  resendBtn.innerText = `Gửi lại (${timeLeft}s)`;

  resendTimer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(resendTimer);
      resendBtn.disabled = false;
      resendBtn.innerText = "Gửi lại mã";
    } else {
      resendBtn.innerText = `Gửi lại (${timeLeft}s)`;
    }
  }, 1000);
}
