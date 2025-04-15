# models.py
from flask_sqlalchemy import SQLAlchemy
import pymysql
pymysql.install_as_MySQLdb()
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'Users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), nullable=False)
    password = db.Column(db.String(128), nullable=False)
    phone = db.Column(db.String(20), default=None)
    totp_secret = db.Column(db.String(32), default=None)       # Secret cho TOTP/HOTP nếu có
    hardware_token_info = db.Column(db.String(100), default=None) # Thông tin của Hardware Token nếu sử dụng
    push_token = db.Column(db.String(255), default=None)         # Token cho Push Notification nếu có
    device_type = db.Column(db.String(20), default=None)         # Loại thiết bị (Android, iOS, v.v.)
    is_verified = db.Column(db.Boolean, nullable=False, default=False)  # False: chưa xác thực, True: đã xác thực
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    updated_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp(),
                           onupdate=db.func.current_timestamp())

class OTP_Logs(db.Model):
    __tablename__ = 'OTP_Logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    otp_code = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    expires_at = db.Column(db.TIMESTAMP, nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'verified', 'expired'
    __table_args__ = (
        db.ForeignKeyConstraint(['user_id'], ['Users.id'], name='fk_user'),
    )
