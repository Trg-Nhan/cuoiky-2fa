// firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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
