# main.py
from flask import Flask
from config import SECRET_KEY, DEBUG, SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS
from models import db

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['DEBUG'] = DEBUG
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS

# Khởi tạo SQLAlchemy với ứng dụng Flask
db.init_app(app)

# Tạo bảng trong cơ sở dữ liệu nếu chưa tồn tại
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run()
