# config.py
import os

raw_db_url = os.getenv("DATABASE_URL", "")
if raw_db_url.startswith("mysql://"):
    raw_db_url = raw_db_url.replace("mysql://", "mysql+pymysql://")

SQLALCHEMY_DATABASE_URI = raw_db_url
SQLALCHEMY_TRACK_MODIFICATIONS = False
