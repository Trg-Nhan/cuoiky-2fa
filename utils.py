# utils.py
import random
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import pyotp
import qrcode
import io
import base64
from markupsafe import Markup
import requests
import os
from dotenv import load_dotenv
import os
import requests
import json
from dotenv import load_dotenv
import os
import requests

load_dotenv()


def generate_otp():
    """Sinh OTP 6 chữ số ngẫu nhiên."""
    return str(random.randint(100000, 999999))

def get_expiration_time(minutes=10):
    """Tính thời gian OTP hết hạn: hiện tại + số phút (mặc định 10 phút)."""
    return datetime.utcnow() + timedelta(minutes=minutes)

def send_email_otp(recipient_email, otp):
    """
    Gửi OTP qua email sử dụng SMTP của Gmail.
    Dùng tài khoản 2FA@gmail.com với mật khẩu ứng dụng: 'vyaf verk ahsb qdgy'
    """
    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASSWORD")


    subject = 'Mã OTP xác thực đăng nhập'
    body = f'Mã OTP của bạn là: {otp}'

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = recipient_email

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"[EMAIL] Gửi OTP {otp} thành công tới {recipient_email}")
    except Exception as e:
        print(f"[EMAIL] Gửi email thất bại: {e}")
        print(f"[DEMO] OTP: {otp}")


def send_sms(phone, otp):
    api_key = os.getenv("SPEEDSMS_API_KEY")
    app_id = os.getenv("SPEEDSMS_APP_ID")

    url = "https://api.speedsms.vn/index.php/verify/request"
    headers = { "Content-Type": "application/json" }

    payload = {
        "to": phone,
        "pin_code": otp,
        "content": "Mã OTP xác thực của bạn là: {pin_code}",
        "type": "sms",
        "sender": "Verify",
        "app_id": app_id
    }

    response = requests.post(url, json=payload, headers=headers, auth=(api_key, ''))
    print(f"[SpeedSMS] Trạng thái: {response.status_code}")
    print(f"[SpeedSMS] Phản hồi: {response.text}")

def verify_sms_token(phone, otp):
    """
    Xác minh OTP SMS bằng so sánh trực tiếp với session
    """
    import flask
    return otp == flask.session.get('otp_sms')


def send_voice(phone, otp):
    print(f"[VOICE] Gửi OTP {otp} qua cuộc gọi tới số {phone}")

def send_push_notification(device_token, otp):
    print(f"[PUSH] Gửi OTP {otp} đến thiết bị với token {device_token}")

def generate_hardware_otp():
    HARDWARE_SECRET = "HARDWARESECRET1234"
    totp = pyotp.TOTP(HARDWARE_SECRET, interval=30)
    return totp.now()

#Tạo QR code
def generate_qr_code(data):
    """
    Sinh mã QR từ dữ liệu (ví dụ Provisioning URI) và trả về mã HTML dạng img nhúng base64.
    """
    # Tạo QR Code với cấu hình cơ bản
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Lưu hình ảnh vào bộ nhớ đệm
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("ascii")
    
    # Trả về HTML để nhúng hình ảnh QR
    return Markup(f'<img src="data:image/png;base64,{img_str}" alt="QR Code">')


        
def send_email_login_decision(recipient_email, username):
    # Sử dụng biến môi trường BASE_URL, mặc định là localhost nếu chưa có
    base_url = os.getenv("BASE_URL", "http://127.0.0.1:5000")
    
    confirm_url = f"{base_url}/verify_email_decision?user={username}&result=yes"
    deny_url = f"{base_url}/verify_email_decision?user={username}&result=no"

    html_body = f"""
    <p>🚨 Có yêu cầu đăng nhập vào tài khoản <b>{username}</b>.</p>
    <p>Bạn có thực hiện hành động này không?</p>
    <a href="{confirm_url}">✅ Là tôi</a><br>
    <a href="{deny_url}">❌ Không phải tôi</a>
    """

    msg = MIMEText(html_body, "html")
    msg["Subject"] = "Xác thực đăng nhập tài khoản"
    msg["From"] = os.getenv("EMAIL_USER", "no-reply@example.com")
    msg["To"] = recipient_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASSWORD"))
        server.send_message(msg)
        server.quit()
        print(f"[EMAIL] Gửi link xác thực đến {recipient_email}")
    except Exception as e:
        print(f"[ERROR] Gửi email thất bại: {e}")


#Voice-token
# def generate_stringee_signature(api_key_sid, api_key_secret):
#     import hmac, hashlib, base64, time, json

#     headers = {"typ": "JWT", "alg": "HS256"}
#     payload = {
#         "jti": api_key_sid,
#         "iss": api_key_sid,
#         "exp": int(time.time()) + 3600,
#         "userId": api_key_sid,
#         "rest_api": True  # ✅ BẮT BUỘC có dòng này
#     }

#     def encode(obj):
#         return base64.urlsafe_b64encode(json.dumps(obj).encode()).rstrip(b'=')

#     header_enc = encode(headers)
#     payload_enc = encode(payload)
#     message = header_enc + b"." + payload_enc
#     signature = hmac.new(api_key_secret.encode(), message, hashlib.sha256).digest()
#     signature_enc = base64.urlsafe_b64encode(signature).rstrip(b'=')
#     return (message + b"." + signature_enc).decode()


def send_voice_call_stringee(to_phone, otp):
    rest_token = os.getenv("STRINGEE_REST_TOKEN")
    from_number = os.getenv("STRINGEE_FROM")

    payload = {
        "from": {
            "type": "external",
            "number": from_number,
            "alias": "Xac thuc"
        },
        "to": [
            {
                "type": "external",
                "number": to_phone,
                "alias": "Ban"
            }
        ],
        "actions": [
            {
                "action": "talk",
                "text": f"Ma xac thuc cua ban la {' '.join(otp)}",
                "voice": "female",
                "language": "vi-VN"
            }
        ]
    }

    headers = {
        "Content-Type": "application/json",
        "X-STRINGEE-AUTH": rest_token.strip()
    }

    try:
        response = requests.post("https://api.stringee.com/v1/call2/callout", json=payload, headers=headers)
        print(f"[Stringee] Gửi cuộc gọi tới {to_phone}, mã OTP: {otp}")
        print(f"[Stringee] Phản hồi: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"[Stringee] Lỗi gửi cuộc gọi: {str(e)}")