from flask import Flask
from models import db
from routes import bp as main_bp
import os
import pymysql
from dotenv import load_dotenv
from config import Config  # ✅ Sửa lại để lấy Config class

pymysql.install_as_MySQLdb()
load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)  # ✅ Load tất cả config từ class

db.init_app(app)
app.register_blueprint(main_bp)

with app.app_context():
    db.create_all()

