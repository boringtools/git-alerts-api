import os
from pathlib import Path
from dotenv import load_dotenv
from .logging import LOGGING
from .config import Config, ConfigError
from datetime import timedelta

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

try:
    SECRET_KEY = Config.get_env("SECRET_KEY")
    ENCRYPTION_KEY = Config.get_env("ENCRYPTION_KEY")
    DEBUG = Config.get_bool("DEBUG")
    ALLOWED_HOSTS = Config.get_list("ALLOWED_HOSTS")

    CELERY_BROKER_URL = Config.get_env("CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND = Config.get_env("CELERY_RESULT_BACKEND")

    Config.require_executable("trufflehog")
except ConfigError as e:
    raise RuntimeError(e)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

EXTERNAL_APPS = [
    'rest_framework',
    'corsheaders',
    'django_filters',
    'drf_spectacular'
]

CUSTOM_APPS = [
    'scans',
    'findings',
    'core',
    'integrations'
]

INSTALLED_APPS += EXTERNAL_APPS + CUSTOM_APPS

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

ROOT_URLCONF = 'api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'api.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': Config.get_env('DB_NAME'),
        'USER': Config.get_env('DB_USER'),
        'PASSWORD': Config.get_env('DB_PASSWORD'),
        'HOST': Config.get_env('DB_HOST'),
        'PORT': Config.get_int('DB_PORT'),
    }
}

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

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",

    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),

    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ]
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = Config.get_env('TIME_ZONE')
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Celery Settings
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = Config.get_env('CELERY_TIMEZONE')

CELERY_WORKER_HIJACK_ROOT_LOGGER = False

# CORS Settings
CORS_ALLOWED_ORIGINS = Config.get_list("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_CREDENTIALS = True
