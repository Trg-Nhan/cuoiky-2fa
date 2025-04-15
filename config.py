import os

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
DEBUG = os.getenv("DEBUG", "False") == "True"
SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
SQLALCHEMY_TRACK_MODIFICATIONS = False
