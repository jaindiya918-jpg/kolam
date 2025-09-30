"""
Django settings for kolam project.
"""

import os
from pathlib import Path
import firebase_admin
from firebase_admin import credentials
from decouple import config

API_KEY = config("AIzaSyBvp2E8q221qU6qgTKBVD-ak68OOQ1yyTs")
FIREBASE_KEY = config("-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCZ2KIXKSxgDybv\n2+HWsuLlVerO6bCtZ2RYcR0v/3AJJR1bPqfJ12e/UNUWUtUEfzO66YX8v+h0NoKS\naZgU8rGJheXuGDARJ7URNZ9gdRvlbzmXRFSZ40N7aLld+25a0G7BY3z6B8TysLlN\n87ocQoZyAXNQ/fGk/nfJunhUaApu4J0mQwFXUsZp/KZLpiv5YzXqtEBnA2DSHnG9\n6XZmEUMkLTWOiugcAiQBV5TD8V2uyLNmYrOwGStJZ7MQCp734VAPGvpbe1Pv/TwP\nv7BcZ79fuxoT9N8EMCRXwIHqOgEDyIdMWGdZ9FGHiE4GZkOxEdoyr0ydbH+Paahz\nnf2+yeojAgMBAAECggEAQObWjp3EhiuuOe8RaZEiziv+OFb2vViKSRNDBG4m1fzN\n0yHuB+Ty9A9GLbo4+kItURNV/of5KRmb4OdiDKhLxF/z3Ytfr8UICmAMQdV1tMdE\nzO87H4Zz//pwhNjet7oJl1UAsrwXVmi+a8e/wk9AR5UcEFVpHTlq0HP1cmpHyHka\npieLVTRfon1QZnP4+2YdKbx9M3knoCBdmBPN4RWBWbTHx9T/si+Q23AMr3cLhIKJ\np+Qh8S7UK+o+u+7/BUyt0PVa3ceGRoZj4L7RaT+Xij12Y2MYxo2+hoG2fwf5P3LO\n2F0En1XmGbbEMjMPFmlQ/J20k1PsOvG9CDanYg8FpQKBgQDSitvuSMsPX0lSC+9c\ndHkVCHt7CoXsWPbBlgNxD9bqmhXAdi25gGTtYNEWHcWfdm8yBWRYBjh/0jw6I8RL\n7uHJtLTInVvFEa15YaI5RxK3dZ00nQqXpLFi7qe695s7HrWP2anyv3Qw1jgdnxhm\nId4e48YUzKuptnIU7rJF9iHlFQKBgQC7EA0VCmTWE3cL71a9c1uY90fqUhVzwfd0\nJpIbkdrlSj32fW/zXnUyyMukmnXPMl9FwOLb7nbdGTEpMDkOV2L4UR6ia10QNU/F\nR+FEp+d63zH89QKaEB0n4d2DHGT2vl+xLmT7aII3X1+IZDynd1F6gIyMRAdMjfrb\n4v/cY5TQVwKBgEFZpIZDxfORifqThcpWxLaImXtJeuQvgPf5jjvrxLOw/AtvIyYu\n+iTMJloNB6hFZKJMFidUVvkl0lfhfi5riV3IX0zduvxiTkwcx/OrYd3b/d202PLU\nxdKFbT6VWHNzRrvNvfiBAJmgBG79UN9yp7VC0drm5GmbHbHtnRwmF8M5AoGBALCk\n/KWU1hnt8aocjh2C1MmDIa8dalKQpRtS3QAZ4MpLLG4aj+ASn7ugL+W1UnChkaQt\n/ExRSH+LLYhGmGp5jOUOvU4E8rG+liCmuwv5Pjcik3La72UKuG2T9Xi9FH6I0ZZg\nSE28p9KgRndmqHw/yXpT7+T4zKe3H2ALYS/9/WYrAoGBALOo9N2vc+Ucn7wLD2DH\nkyPUU0Zs362bNajG5Q7E9mDFyoiAftjuUbwrsuG3T+b67tQpwsnQray2rwMr5MhK\nl31hl2qwJ/PNYxUanjjFaC1edMjiW7nqXaJRDWX4B5jCnXkZTjyryfSM9XpuHkJo\n1m5CyhCWD1/9IZ/K9OcXUFKQ\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@kolam-b82f4.iam.gserviceaccount.com",
  "client_id": "108734047769851372195",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40kolam-b82f4.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com")


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
