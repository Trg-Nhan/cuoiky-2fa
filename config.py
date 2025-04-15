# config.py
DEBUG = True
SECRET_KEY = 'your_secret_key'  # Thay bằng key bảo mật của bạn

# Kết nối MySQL qua pymysql.
# Hãy thay thế username, password theo thông tin của bạn.
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:1234@localhost/2FA'
SQLALCHEMY_TRACK_MODIFICATIONS = False
