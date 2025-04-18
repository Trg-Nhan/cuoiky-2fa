// firebase.js

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

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Gửi mã OTP
function sendOtpFirebase(phoneNumber) {
  window.userPhone = phoneNumber;

  // Reset nếu recaptcha đã tồn tại
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }

  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  });

  window.recaptchaVerifier.render().then(function (widgetId) {
    window.recaptchaWidgetId = widgetId;

    firebase.auth().signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        alert("✅ Mã OTP đã được gửi!");
        startResendCountdown(); // Bắt đầu đếm ngược
      })
      .catch((error) => {
        console.error("❌ Lỗi gửi OTP:", error);
        alert("❌ Lỗi gửi OTP: " + error.message);
      });
  });
}

// Gửi lại OTP
function resendOtp() {
  const phone = window.userPhone;
  if (!phone) {
    alert("❌ Không tìm thấy số điện thoại để gửi lại OTP.");
    return;
  }
  sendOtpFirebase(phone);
}

// Đếm ngược gửi lại
function startResendCountdown() {
  const btn = document.getElementById("resend-btn");
  if (!btn) return;

  btn.disabled = true;
  let timeLeft = 60;
  btn.innerText = `Gửi lại mã (${timeLeft}s)`;

  const interval = setInterval(() => {
    timeLeft--;
    btn.innerText = `Gửi lại mã (${timeLeft}s)`;
    if (timeLeft <= 0) {
      clearInterval(interval);
      btn.innerText = "Gửi lại mã";
      btn.disabled = false;
    }
  }, 1000);
}

// Xác minh OTP
function submitOtpFirebase() {
  const otp = document.getElementById("otp").value;
  if (!window.confirmationResult) {
    alert("❌ Chưa gửi mã OTP hoặc mã chưa sẵn sàng.");
    return;
  }

  window.confirmationResult.confirm(otp)
    .then((result) => {
      alert("✅ Xác thực thành công!");
      document.getElementById("otp-form").submit();
    })
    .catch((error) => {
      console.error("❌ Mã OTP không đúng:", error);
      alert("❌ Mã OTP không đúng hoặc đã hết hạn.");
    });
}
