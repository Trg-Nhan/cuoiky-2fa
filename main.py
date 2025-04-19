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

if __name__ == "__main__":
    import os

port = int(os.environ.get("PORT", 8080))  # Lấy PORT từ Railway, fallback 8080 nếu local
app.run(host="0.0.0.0", port=port)

