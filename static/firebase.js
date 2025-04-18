// Cấu hình Firebase của bạn
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

// Gửi OTP đến số điện thoại
function sendOtpFirebase(phoneNumber) {
  window.userPhone = phoneNumber; // Lưu để sử dụng lại khi resend

  const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  });

  firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      alert("✅ Đã gửi mã xác thực đến " + phoneNumber);
    })
    .catch((error) => {
      console.error("Lỗi gửi OTP:", error);
      alert("Lỗi gửi OTP: " + error.message);
    });
}

// Xác minh mã OTP
function submitOtpFirebase() {
  const otp = document.getElementById("otp").value;
  if (!window.confirmationResult) {
    alert("❌ Không có mã xác thực được gửi.");
    return;
  }

  window.confirmationResult.confirm(otp)
    .then((result) => {
      const user = result.user;
      alert("✅ Xác thực thành công! UID: " + user.uid);
      window.location.href = "/auth/usb"; // hoặc trang khác tùy bạn
    })
    .catch((error) => {
      console.error("Lỗi xác minh OTP:", error);
      alert("❌ Mã OTP không hợp lệ hoặc đã hết hạn.");
    });
}

// Gửi lại mã OTP
function resendOtp() {
  const phone = window.userPhone;
  if (!phone) {
    alert("Không tìm thấy số điện thoại.");
    return;
  }

  sendOtpFirebase(phone);
}
