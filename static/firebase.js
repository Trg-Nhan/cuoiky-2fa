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

let recaptchaVerifier = null;
let confirmationResult = null;

window.renderRecaptcha = function () {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear(); // ⚠️ CLEAR TRƯỚC KHI RESET
  }

  recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible',
    callback: function () {
      console.log("reCAPTCHA solved");
    }
  });

  recaptchaVerifier.render().then(function (widgetId) {
    window.recaptchaWidgetId = widgetId;
  });
};

window.sendOtpFirebase = function (phoneNumber) {
  renderRecaptcha(); // ✅ GỌI TRƯỚC MỖI LẦN GỬI
  auth.signInWithPhoneNumber(phoneNumber, recaptchaVerifier)
    .then(result => {
      confirmationResult = result;
      console.log("OTP sent!");
    })
    .catch(error => {
      console.error("❌ Lỗi gửi OTP: ", error);
      alert("Lỗi gửi OTP: " + error.message);
    });
};

window.verifyOtpFirebase = function (otpCode) {
  if (!confirmationResult) {
    alert("Bạn chưa gửi OTP");
    return;
  }

  confirmationResult.confirm(otpCode)
    .then(result => {
      const user = result.user;
      console.log("✅ Đăng nhập thành công", user);
    })
    .catch(error => {
      console.error("❌ Lỗi xác minh OTP:", error);
      alert("Lỗi xác minh: " + error.message);
    });
};