const firebaseConfig = {
  apiKey: "AIzaSyDOR6ivLePyTR4j3HlHMyN-NB6QS-qSORk",
  authDomain: "sms-auth-demo-f5b14.firebaseapp.com",
  projectId: "sms-auth-demo-f5b14",
  storageBucket: "sms-auth-demo-f5b14.appspot.com",
  messagingSenderId: "194704028483",
  appId: "1:194704028483:web:4c402376687e955bcbf5f6",
  measurementId: "G-DEV70ZFQLW"
};

// Khởi tạo Firebase App
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
let confirmationResult = null;

// Hàm gửi OTP
window.sendOtpFirebase = function (phoneNumber) {
  // Xóa recaptcha cũ nếu có
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }

  // Tạo mới reCAPTCHA mỗi lần gửi
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
        window.confirmationResult = result;  // Lưu toàn cục
        alert("✅ Mã OTP đã được gửi thành công!");
      })
      .catch((error) => {
        console.error("❌ Lỗi gửi OTP:", error);
        alert("❌ Lỗi gửi OTP: " + error.message);
      });
  });
};

// Hàm xác minh OTP
window.verifyOtpFirebase = function (otpCode) {
  if (!window.confirmationResult) {
    alert("⚠️ Chưa gửi OTP hoặc session đã hết hạn.");
    return;
  }

  confirmationResult.confirm(otpCode)
    .then((result) => {
      const user = result.user;
      alert("✅ Xác thực OTP thành công!");
      console.log("Người dùng:", user);

      // ✅ CHUYỂN TRANG về backend xử lý
      window.location.href = "/auth/sms/verify";  // hoặc /home nếu bạn muốn vào thẳng trang chính
    })
    .catch((error) => {
      console.error("❌ Lỗi xác minh OTP:", error);
      alert("❌ Lỗi xác minh OTP: " + error.message);
    });
};


window.submitOtpFirebase = function () {
  const otpCode = document.getElementById("otp").value;
  if (!otpCode) {
    alert("⚠️ Bạn chưa nhập mã OTP.");
    return;
  }
  verifyOtpFirebase(otpCode);  // Gọi đúng hàm đã viết sẵn
};

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

window.resendOtp = function () {
  sendOtpFirebase(phone);  // dùng biến toàn cục được khai báo từ verify.html
  startResendCountdown();
};

