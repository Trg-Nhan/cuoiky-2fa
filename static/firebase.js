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

// Biến toàn cục để lưu đối tượng xác minh
let confirmationResult = null;

// Hàm gửi OTP
function sendOtpFirebase() {
  const phone = document.getElementById("phoneNumber").innerText.trim();
  if (!phone) {
    alert("Không tìm thấy số điện thoại để gửi OTP.");
    return;
  }

  // Khởi tạo recaptcha
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  });

  const appVerifier = window.recaptchaVerifier;

  // Gửi OTP
  firebase.auth().signInWithPhoneNumber(phone, appVerifier)
    .then((result) => {
      confirmationResult = result;
      console.log("Đã gửi OTP đến " + phone);
    })
    .catch((error) => {
      console.error("Lỗi gửi OTP:", error);
      alert("Lỗi gửi OTP: " + error.message);
    });
}

// Hàm xác minh OTP
function submitOtpFirebase() {
  const otp = document.getElementById("otp").value.trim();

  if (!confirmationResult) {
    alert("Chưa gửi OTP hoặc xác thực thất bại.");
    return;
  }

  confirmationResult.confirm(otp)
    .then((result) => {
      alert("✅ Xác thực thành công với Firebase!");
      window.location.href = "/auth/success";  // Có thể đổi URL sau khi xác thực
    })
    .catch((error) => {
      console.error("Lỗi xác minh OTP:", error);
      alert("❌ Mã OTP không đúng hoặc đã hết hạn.");
    });
}
