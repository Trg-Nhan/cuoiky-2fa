# routes.py
from flask import Blueprint, render_template, request, session, redirect, url_for, flash
from datetime import datetime
from models import db, User, OTP_Logs
from utils import generate_otp, get_expiration_time, send_email_otp, send_sms, send_push_notification, generate_hardware_otp, generate_qr_code
import pyotp
from flask import request, jsonify
import requests
from utils import send_email_login_decision
from utils import generate_otp, get_expiration_time, send_email_otp, send_sms, verify_sms_token
import os
from dotenv import load_dotenv
load_dotenv()
from flask import request, jsonify



api_key = os.getenv("SPEEDSMS_API_KEY")
app_id = os.getenv("SPEEDSMS_APP_ID")






push_tokens = set()
bp = Blueprint('main', __name__)

# --- Quy trình đăng ký (sử dụng OTP qua email để xác thực đăng ký) ---
@bp.route('/')
def index():
    return render_template('register.html')

@bp.route('/switch_to_login')
def switch_to_login():
    return redirect(url_for('main.login'))

@bp.route('/register', methods=['POST'])
def register():
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')
    phone = request.form.get('phone')

    if User.query.filter_by(username=username).first():
        flash("Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác.")
        return redirect(url_for('main.index'))

    new_user = User(
        username=username,
        email=email,
        password=password,
        phone=phone,
        is_verified=False
    )
    db.session.add(new_user)
    db.session.commit()

    otp = generate_otp()
    expires_at = get_expiration_time(10)

    otp_record = OTP_Logs(
        user_id=new_user.id,
        otp_code=otp,
        expires_at=expires_at,
        status='pending'
    )
    db.session.add(otp_record)
    db.session.commit()

    session['reg_user_id'] = new_user.id
    send_email_otp(email, otp)

    flash("OTP đã được gửi về email của bạn. Vui lòng kiểm tra và nhập OTP.")
    return render_template('register_verify.html')


#Đăng ký
@bp.route('/register/verify', methods=['POST'])
def register_verify():
    user_input_otp = request.form.get('otp')
    reg_user_id = session.get('reg_user_id')
    if not reg_user_id:
        flash("Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại.")
        return redirect(url_for('main.index'))

    otp_record = OTP_Logs.query.filter_by(user_id=reg_user_id, status='pending') \
                               .order_by(OTP_Logs.created_at.desc()).first()

    if otp_record:
        current_time = datetime.utcnow()
        if current_time > otp_record.expires_at:
            otp_record.status = 'expired'
            db.session.commit()
            flash("Mã OTP đã hết hạn, vui lòng đăng ký lại.")
            return redirect(url_for('main.index'))
        elif user_input_otp == otp_record.otp_code:
            otp_record.status = 'verified'
            db.session.commit()
            user = User.query.get(reg_user_id)
            user.is_verified = True
            db.session.commit()

            flash("Đăng ký thành công! Hãy đăng nhập.")
            session.pop('reg_user_id', None)
            return redirect(url_for('main.login'))
        else:
            flash("OTP không chính xác, vui lòng thử lại.")
            return render_template('register_verify.html')
    else:
        flash("Không tìm thấy OTP cho tài khoản này, vui lòng đăng ký lại.")
        return redirect(url_for('main.index'))


#Đăng nhậpnhập
@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    username = request.form.get('username')
    password = request.form.get('password')
    user = User.query.filter_by(username=username).first()
    if user and user.password == password:
        if not user.is_verified:
            flash("Tài khoản của bạn chưa được xác thực, vui lòng đăng ký lại.")
            return redirect(url_for('main.index'))
        session['username'] = username
        
        # ✅ Thêm dòng này để gửi thông báo đẩy
        send_push_notification("Xác thực thành công", f"Tài khoản {username} vừa đăng nhập.")
        
        flash(" Hãy chọn phương thức xác thực 2FA.")
        return redirect(url_for('main.choose_method'))
    flash("Thông tin đăng nhập không đúng, vui lòng kiểm tra lại.")
    return redirect(url_for('main.login'))


@bp.route('/switch_to_register')
def switch_to_register():
    return redirect(url_for('main.index'))

#Chọn cách xác thựcthực
@bp.route('/choose')
def choose_method():
    if 'username' not in session:
        return redirect(url_for('main.login'))
    return render_template('choose_method.html')


#SMS TOKENTOKEN
@bp.route('/auth/sms')
def auth_sms():
    if 'username' not in session:
        return redirect(url_for('main.login'))

    username = session['username']
    user = User.query.filter_by(username=username).first()
    if not user or not user.phone:
        flash("Không tìm thấy số điện thoại của bạn.")
        return redirect(url_for('main.choose_method'))

    phone = user.phone.strip()
    if phone.startswith("0"):
        phone = "+84" + phone[1:]
    elif not phone.startswith("+"):
        phone = "+84" + phone

    return render_template('verify.html',
                           header="Xác thực SMS Firebase",
                           message=f"Nhập mã OTP được gửi tới: {phone}",
                           verify_url=url_for('main.verify_sms'),
                           phone=phone)  # truyền vào nếu muốn show số


@bp.route('/auth/sms/verify', methods=['POST'])
def verify_sms():
    if 'username' not in session:
        return redirect(url_for('main.login'))

    otp_input = request.form.get('otp')
    # Với Firebase bạn nên kiểm tra qua front-end, nên route này có thể giữ lại hoặc điều chỉnh về sau nếu cần lưu log
    flash("✅ Xác thực bằng Firebase thành công!")
    return redirect(url_for('main.home'))



#Voice tokentoken
@bp.route('/auth/voice')
def auth_voice():
    if 'username' not in session:
        return redirect(url_for('main.login'))
    otp = generate_otp()
    session['otp_2fa'] = otp
    username = session['username']
    user = User.query.filter_by(username=username).first()
    if not user or not user.phone:
        flash("Không tìm thấy số điện thoại của bạn. Vui lòng cập nhật thông tin.")
        return redirect(url_for('main.choose_method'))

    print(f"[VOICE] Gửi OTP {otp} qua cuộc gọi tới số {user.phone}")

    return render_template('verify_voice.html',
                           header="Xác thực Voice",
                           message="OTP đã được gửi qua cuộc gọi giả lập. Nhấn nút 🔊 để nghe mã.",
                           verify_url=url_for('main.verify_voice'),
                           otp_to_speak=otp)  # truyền vào để giao diện có thể đọc

@bp.route('/auth/voice/verify', methods=['POST'])
def verify_voice():
    if 'username' not in session:
        return redirect(url_for('main.login'))
    otp_input = request.form.get('otp')
    if otp_input == session.get('otp_2fa'):
        session.pop('otp_2fa', None)
        flash("Xác thực 2FA thành công!")
        return redirect(url_for('main.home'))
    flash("OTP Voice không hợp lệ!")
    return redirect(url_for('main.choose_method'))


#APP Token
@bp.route('/auth/totp')
def auth_totp():
    if 'username' not in session:
        return redirect(url_for('main.login'))

    username = session['username']
    user = User.query.filter_by(username=username).first()
    if not user:
        flash("Không tìm thấy thông tin người dùng.")
        return redirect(url_for('main.login'))

    if not user.totp_secret:
        secret = pyotp.random_base32()
        user.totp_secret = secret
        db.session.commit()
    else:
        secret = user.totp_secret

    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(name=username, issuer_name="Xác thực 2FA")
    qr_code_img = generate_qr_code(provisioning_uri)
    message = "Quét mã QR bằng Google Authenticator để thiết lập TOTP, sau đó nhập OTP bên dưới."

    return render_template('verify_soft.html',
                           header="Xác thực Software Token (TOTP)",
                           message=message,
                           qr_code=qr_code_img,
                           verify_url=url_for('main.verify_totp'))

@bp.route('/auth/totp/verify', methods=['POST'])
def verify_totp():
    if 'username' not in session:
        return redirect(url_for('main.login'))

    username = session['username']
    user = User.query.filter_by(username=username).first()
    if not user or not user.totp_secret:
        flash("Không tìm thấy khóa TOTP cho tài khoản của bạn.")
        return redirect(url_for('main.choose_method'))

    otp_input = request.form.get('otp')
    totp = pyotp.TOTP(user.totp_secret)
    if totp.verify(otp_input):
        flash("Xác thực TOTP thành công!")
        return redirect(url_for('main.home'))
    else:
        flash("Mã OTP không hợp lệ, vui lòng thử lại.")
        return redirect(url_for('main.auth_totp'))



#Hardware Token
@bp.route('/auth/usb')
def auth_usb():
    if request.args.get("verified") == "true":
        session['usb_verified'] = True
        flash("✅ Xác thực Hardware Token thành công!", "success")
        return redirect(url_for("main.home"))

    if session.get('usb_verified'):
        session.pop('usb_verified')
        flash("✅ Xác thực Hardware Token thành công!", "success")
        return redirect(url_for("main.home"))

    return render_template("auth_usb.html")





@bp.route('/verify_usb_token', methods=['POST'])
def verify_usb_token():
    token = request.json.get("token")
    if token == "SECRET-TOKEN-1234":
        print("[✅] Token USB hợp lệ.")
        return jsonify({"status": "success", "verified": True})
    else:
        print("[❌] Token USB không hợp lệ.")
        return jsonify({"status": "fail", "message": "Token không hợp lệ!"}), 403



@bp.route('/check_usb_status')
def check_usb_status():
    return jsonify({"verified": session.get("usb_verified", False)})


@bp.route('/home')
def home():
    if 'username' not in session:
        return redirect(url_for('main.login'))
    return render_template('home.html')

@bp.route('/logout')
def logout():
    session.clear()
    flash("Bạn đã đăng xuất.")
    return redirect(url_for('main.login'))

@bp.route('/voice_token_simulation')
def voice_token_simulation():
    otp = generate_otp()
    session['otp_voice'] = otp
    return render_template('verify.html',
                       header="Xác thực Voice",
                       message="OTP đã được gửi qua cuộc gọi giả lập. Nhấn nút 🔊 để nghe mã.",
                       verify_url=url_for('main.verify_voice'),
                       otp_to_speak=otp)



#Push NotificationNotification    
@bp.route('/auth/email')
def auth_email():
    if 'username' not in session:
        return redirect(url_for('main.login'))
    username = session['username']
    user = User.query.filter_by(username=username).first()

    if not user or not user.email:
        flash("Không tìm thấy email tài khoản.")
        return redirect(url_for('main.choose_method'))

    send_email_login_decision(user.email, username)

    return render_template('verify_push.html',
                           header="Xác thực qua Gmail",
                           message="Email xác thực đã được gửi đến hộp thư của bạn. Vui lòng kiểm tra và chọn xác nhận.",
                           verify_url="#")

@bp.route('/verify_email_decision')
def verify_email_decision():
    username = request.args.get('user')
    result = request.args.get('result')

    if result == 'yes':
        session['username'] = username
        flash("✅ Xác thực qua email thành công!")
        return redirect(url_for('main.home'))
    else:
        session.clear()
        flash("❌ Bạn đã từ chối xác thực đăng nhập.")
        return redirect(url_for('main.login'))

    
