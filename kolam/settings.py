"""
Django settings for kolam project.
"""

from pathlib import Path
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv
import os
load_dotenv()

API_KEY = os.getenv("API_KEY")



BASE_DIR = Path(__file__).resolve().parent.parent

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cred_path = os.path.join(BASE_DIR, "firebase-key.json")
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)


# --------------------------
# Base directory
# --------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# --------------------------
# Quick-start development settings
# --------------------------
SECRET_KEY = 'django-insecure-0%j0#^@2kyg3bn8(56sdtluwsj4$81@z0qavn^l8a#63ul3qz3'
DEBUG = True
ALLOWED_HOSTS = []

# --------------------------
# Application definition
# --------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'core',
    'corsheaders',  # if you installed django-cors-headers
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',           # if CORS installed
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# --------------------------
# CORS configuration
# --------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # frontend dev server
]

# --------------------------
# URL configuration
# --------------------------
ROOT_URLCONF = 'kolam.urls'

# --------------------------
# Templates
# --------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'front_end' / 'templates'],  # <-- include your template folder
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# --------------------------
# WSGI
# --------------------------
WSGI_APPLICATION = 'kolam.wsgi.application'

# --------------------------
# Database
# --------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',  # use Path object
    }
}

# --------------------------
# Password validation
# --------------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# --------------------------
# Internationalization
# --------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# --------------------------
# Static files
# --------------------------
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'front_end' /'static',  # your static folder
]

# --------------------------
# Default primary key field type
# --------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --------------------------
# Django REST Framework & JWT
# --------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
