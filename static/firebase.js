// firebase.js

// Sử dụng Firebase SDK dạng compat (không cần import module)
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

// Tạo invisible reCAPTCHA
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
  size: 'invisible',
  callback: function(response) {
    console.log("reCAPTCHA passed", response);
  }
});

// Hàm gửi OTP
function sendOtpFirebase(phoneNumber) {
  auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      alert("Mã OTP đã được gửi đến số điện thoại của bạn!");
    })
    .catch((error) => {
      console.error("Lỗi gửi OTP:", error);
      alert("Lỗi gửi OTP: " + error.message);
    });
}

// Hàm xác minh OTP và submit
function submitOtpFirebase() {
  const code = document.getElementById("otp").value;
  if (!window.confirmationResult) {
    alert("Chưa có mã xác nhận từ Firebase. Hãy thử lại.");
    return;
  }
  window.confirmationResult.confirm(code)
    .then((result) => {
      alert("✅ Xác thực thành công!");
      document.getElementById("otp-form").submit();
    })
    .catch((error) => {
      console.error("Lỗi xác minh OTP:", error);
      alert("❌ Mã OTP không đúng hoặc đã hết hạn.");
    });
}
