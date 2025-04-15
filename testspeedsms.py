import requests
import os
from dotenv import load_dotenv

# Load biến môi trường từ .env
load_dotenv()

# Lấy API key và App ID từ file .env
API_KEY = os.getenv("SPEEDSMS_API_KEY")
APP_ID = os.getenv("SPEEDSMS_APP_ID")  # dùng cho xác thực 2FA

def send_sms_otp(phone_number: str, otp_code: str):
    print(f"[TEST] Gửi OTP tới {phone_number}")
    
    url = "https://api.speedsms.vn/index.php/verify/request"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "app_id": APP_ID,
        "phone": phone_number,
        "pin_code": otp_code
    }

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            auth=(API_KEY, '')
        )

        print(f"[TEST] Trạng thái: {response.status_code}")
        print(f"[TEST] Nội dung phản hồi: {response.text}")
    
    except Exception as e:
        print(f"[ERROR] Lỗi khi gửi OTP: {e}")

if __name__ == "__main__":
    phone = input("Nhập số điện thoại (dạng +84xxxxxxxxx): ").strip()
    otp = input("Nhập mã OTP bạn muốn gửi: ").strip()
    send_sms_otp(phone, otp)
