// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD0R6ivLePyTR4j3HlHMyN-NB6QS-qSORk",
  authDomain: "sms-auth-demo-f5b14.firebaseapp.com",
  projectId: "sms-auth-demo-f5b14",
  storageBucket: "sms-auth-demo-f5b14.appspot.com",
  messagingSenderId: "438147369507",
  appId: "1:438147369507:web:4c402376687e955bcbf5f6"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

let confirmationResult = null;

// Gửi OTP khi trang tải
function sendOtpFirebase(phoneNumber) {
  const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible'
  });

  auth.signInWithPhoneNumber(phoneNumber, appVerifier)
    .then((result) => {
      confirmationResult = result;
      console.log("OTP đã được gửi.");
    })
    .catch((error) => {
      console.error("Lỗi gửi OTP:", error.message);
      alert("Lỗi gửi OTP: " + error.message);
    });
}

// Hàm gửi lại mã OTP
function resendOtp() {
  const phone = "{{ phone }}"; // biến Flask sẽ không hoạt động trong JS file riêng → bạn có thể set nó trong HTML script block
  sendOtpFirebase(phone);

  // Reset countdown
  const resendBtn = document.getElementById("resendBtn");
  const timerEl = document.getElementById("timer");
  resendBtn.disabled = true;
  let countdown = 30;
  timerEl.innerText = `(${countdown}s)`;
  const interval = setInterval(() => {
    countdown--;
    timerEl.innerText = `(${countdown}s)`;
    if (countdown <= 0) {
      clearInterval(interval);
      timerEl.innerText = "";
      resendBtn.disabled = false;
    }
  }, 1000);
}

// Gửi mã OTP người dùng nhập
function submitOtpFirebase() {
  const code = document.getElementById("otp").value;
  if (!confirmationResult) {
    alert("Không có yêu cầu xác thực nào đang chờ.");
    return;
  }

  confirmationResult.confirm(code)
    .then((result) => {
      // Xác thực thành công
      console.log("Xác thực thành công:", result.user.phoneNumber);
      alert("✅ Xác thực thành công!");
      window.location.href = "/auth/success"; // Chuyển trang sau khi xác thực
    })
    .catch((error) => {
      console.error("Lỗi xác thực:", error.message);
      alert("❌ Mã OTP không chính xác hoặc đã hết hạn.");
    });
}
