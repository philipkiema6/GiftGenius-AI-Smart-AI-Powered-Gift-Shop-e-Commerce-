"""
Django settings for the GiftGenius AI backend.
"""

import os

from pathlib import Path
from datetime import timedelta

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')

SECRET_KEY = 'django-insecure-6&4$snk584f62g*e@8#-mzf+!1$3k7mr5ep&%(r-%@eaq!0@%)'

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',

    # Local apps
    'users',
    'products',
    'cart',
    'wishlist',
    'orders',
    'reminders',
    'recommendations',
    'vendors',
    'payments',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DATABASE_NAME"),
        "USER": os.environ.get("DATABASE_USER"),
        "PASSWORD": os.environ.get("DATABASE_PASSWORD"),
        "HOST": os.environ.get("DATABASE_HOST"),
        "PORT": os.environ.get("DATABASE_PORT"),
    },
}

# Temporary read-only alias for the legacy SQLite database, used only by
# `manage.py migrate_sqlite_to_postgres` to copy data into Postgres. Safe to
# remove once the migration has been verified.
if (BASE_DIR / 'db.sqlite3').exists():
    DATABASES["sqlite"] = {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

AUTH_USER_MODEL = 'users.User'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATICFILES_DIRS = []
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS - allow the Vite dev server to talk to the API
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5180',
    'http://127.0.0.1:5180',
     "http://172.21.64.1:5180",
    "http://192.168.56.1:5180",
    "http://192.168.1.120:5180",
]
CORS_ALLOW_CREDENTIALS = True

# --- Payments -----------------------------------------------------------
# Percentage of each sale the platform keeps; the rest is owed to the
# supplying vendor (tracked in payments.VendorPayout, settled via the
# admin dashboard's "Pay" action).
PLATFORM_COMMISSION_PERCENT = float(os.environ.get('PLATFORM_COMMISSION_PERCENT', '15'))

# M-Pesa (Safaricom Daraja). Set MPESA_ENV=production and swap every
# MPESA_* value below to go live - the code path is identical.
MPESA_ENV = os.environ.get('MPESA_ENV', 'sandbox')
MPESA_CONSUMER_KEY = os.environ.get('MPESA_CONSUMER_KEY', '')
MPESA_CONSUMER_SECRET = os.environ.get('MPESA_CONSUMER_SECRET', '')
MPESA_SHORTCODE = os.environ.get('MPESA_SHORTCODE', '174379')
MPESA_PASSKEY = os.environ.get('MPESA_PASSKEY', '')
# Must be a publicly reachable HTTPS URL (e.g. an ngrok forwarding URL in
# dev) - Safaricom's servers call this directly, localhost will not work.
MPESA_CALLBACK_URL = os.environ.get('MPESA_CALLBACK_URL', '')
# B2C (vendor payouts) - separate Daraja product, needs its own sandbox
# credentials and the Safaricom-issued certificate for SecurityCredential.
MPESA_INITIATOR_NAME = os.environ.get('MPESA_INITIATOR_NAME', '')
MPESA_INITIATOR_PASSWORD = os.environ.get('MPESA_INITIATOR_PASSWORD', '')
MPESA_CERT_PATH = os.environ.get('MPESA_CERT_PATH', str(BASE_DIR / 'payments' / 'certs' / 'sandbox_cert.cer'))
MPESA_B2C_RESULT_URL = os.environ.get('MPESA_B2C_RESULT_URL', '')
MPESA_B2C_TIMEOUT_URL = os.environ.get('MPESA_B2C_TIMEOUT_URL', '')

# PayPal. Set PAYPAL_ENV=live and swap the client id/secret to go live.
PAYPAL_ENV = os.environ.get('PAYPAL_ENV', 'sandbox')
PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID', '')
PAYPAL_CLIENT_SECRET = os.environ.get('PAYPAL_CLIENT_SECRET', '')
PAYPAL_CURRENCY = os.environ.get('PAYPAL_CURRENCY', 'USD')
# Static approximation for converting KSh prices to PayPal's currency.
# This is NOT a live exchange rate - fine for a sandbox demo, but a real
# deployment should call a live FX rate API instead.
KES_TO_USD_RATE = float(os.environ.get('KES_TO_USD_RATE', '0.0078'))
