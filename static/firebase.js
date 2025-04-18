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

// Gửi OTP
function sendOtpFirebase(phoneNumber) {
  window.userPhone = phoneNumber; // lưu lại để resend

  // Xóa recaptcha cũ nếu đã tồn tại
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }

  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible',
    callback: function(response) {
      console.log("reCAPTCHA passed");
    }
  });

  window.recaptchaVerifier.render().then(function(widgetId) {
    window.recaptchaWidgetId = widgetId;

    firebase.auth().signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        alert("✅ Đã gửi mã xác thực đến " + phoneNumber);
      })
      .catch((error) => {
        console.error("Lỗi gửi OTP:", error);
        alert("❌ Lỗi gửi OTP: " + error.message);
      });
  });
}

// Xác minh OTP
function submitOtpFirebase() {
  const otp = document.getElementById("otp").value;

  if (!window.confirmationResult) {
    alert("❌ Không có mã xác thực đã gửi.");
    return;
  }

  window.confirmationResult.confirm(otp)
    .then((result) => {
      alert("✅ Xác thực thành công!");
      document.getElementById("otp-form").submit();
    })
    .catch((error) => {
      console.error("Lỗi xác minh:", error);
      alert("❌ Mã OTP không đúng hoặc đã hết hạn.");
    });
}

// Gửi lại mã
function resendOtp() {
  const phone = window.userPhone;
  if (!phone) {
    alert("Không tìm thấy số điện thoại đã gửi trước đó.");
    return;
  }
  sendOtpFirebase(phone);
}
