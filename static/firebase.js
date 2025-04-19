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

// Gửi OTP
window.sendOtpFirebase = function (phoneNumber) {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }

  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible',
    callback: function (response) {
      console.log("✅ reCAPTCHA passed:", response);
    },
    'expired-callback': function () {
      console.warn("⚠️ reCAPTCHA expired. Need to reset.");
    }
  });

  recaptchaVerifier.render().then(() => {
    auth.signInWithPhoneNumber(phoneNumber, recaptchaVerifier)
      .then((result) => {
        confirmationResult = result;
        window.confirmationResult = result;
        alert("✅ Mã OTP mới đã được gửi về điện thoại.");
      })
      .catch((error) => {
        console.error("❌ Lỗi gửi OTP:", error);
        alert("❌ Không thể gửi OTP: " + error.message);
      });
  });
};

// Xác minh OTP
window.verifyOtpFirebase = function (otpCode) {
  if (!window.confirmationResult) {
    alert("⚠️ Chưa gửi mã OTP hoặc phiên đã hết hạn.");
    return;
  }

  confirmationResult.confirm(otpCode)
    .then((result) => {
      alert("✅ OTP chính xác! Đang chuyển đến trang chủ...");
      window.location.href = "/home";
    })
    .catch((error) => {
      alert("❌ Mã OTP không đúng. Vui lòng thử lại.");
    });
};

// Gửi lại mã OTP
window.resendOtp = function () {
  sendOtpFirebase(window.phone);
  startResendCountdown();
};

// Nút xác minh
window.submitOtpFirebase = function () {
  const otpCode = document.getElementById("otp").value;
  if (!otpCode) {
    alert("⚠️ Vui lòng nhập mã OTP.");
    return;
  }
  verifyOtpFirebase(otpCode);
};

// Đếm ngược nút gửi lại
window.startResendCountdown = function () {
  const resendBtn = document.getElementById("resend-btn");
  let countdown = 60;
  resendBtn.disabled = true;
  resendBtn.innerText = `Gửi lại mã (${countdown}s)`;

  const timer = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(timer);
      resendBtn.disabled = false;
      resendBtn.innerText = "Gửi lại mã";
    } else {
      resendBtn.innerText = `Gửi lại mã (${countdown}s)`;
    }
  }, 1000);
};
