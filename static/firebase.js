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

window.sendOtpFirebase = function (phoneNumber) {
  const recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible',
    callback: function(response) {
      // recaptcha solved
    }
  });

  auth.signInWithPhoneNumber(phoneNumber, recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      alert("✅ Mã OTP đã được gửi!");
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
    .then((result) => {
      alert("✅ Xác minh OTP thành công!");
      window.location.href = "/auth/sms"; // hoặc redirect tùy bạn
    })
    .catch((error) => {
      alert("❌ Sai mã OTP: " + error.message);
    });
};
