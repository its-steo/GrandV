import os
from pathlib import Path
from datetime import timedelta
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-p=ag)#dxywkov=na&&l9%6kp!y%)$%$anw(gxamoih__oxwujl')  # Fallback for development

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'  # Controlled by Render env var

ALLOWED_HOSTS = [
    'grandview-shop.onrender.com',  # Render domain
    '127.0.0.1',  # For local testing
    '0.0.0.0',  # For local testing
]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',  # Added for JWT authentication
    'corsheaders',  # For CORS support
    'channels',  # Added for Django Channels
    'accounts',
    'phonenumber_field',
    'packages',
    'wallet',
    'adverts',
    'dashboard',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first for CORS
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Custom User model
AUTH_USER_MODEL = 'accounts.CustomUser'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # JWT auth
        'rest_framework.authentication.TokenAuthentication',  # DRF token auth
        'rest_framework.authentication.SessionAuthentication',  # Session auth
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # Secure API by default
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day'
    },
    'UNAUTHENTICATED_USER': None,  # Handle unauthenticated users gracefully
}

# JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# Channels settings
ASGI_APPLICATION = 'grandview.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',  # For development
        # For production, use Redis (uncomment below and set REDIS_URL in Render)
        # 'BACKEND': 'channels_redis.core.RedisChannelLayer',
        # 'CONFIG': {
        #     'hosts': [(os.getenv('REDIS_URL', 'redis://localhost:6379/0'))],
        # },
    },
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://grand-v.vercel.app",  # Production frontend
    "http://localhost:3000",  # Local Next.js dev server
    "http://127.0.0.1:3000",  # Local Next.js dev server
]

CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'False') == 'True'  # False in production
CORS_ALLOW_CREDENTIALS = True  # Allow cookies/sessions

CSRF_TRUSTED_ORIGINS = [
    "https://grandview-shop.onrender.com",  # Render backend
    "https://grand-v.vercel.app",  # Production frontend
    "http://localhost:3000",  # Local testing
    "http://127.0.0.1:3000",  # Local testing
]

ROOT_URLCONF = 'grandview.urls'

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

WSGI_APPLICATION = 'grandview.wsgi.application'
ASGI_APPLICATION = 'grandview.asgi.application'  # Added for Channels

# Database
#DATABASES = {
#    'default': dj_database_url.config(
#        default=os.getenv('DATABASE_URL'),
#        conn_max_age=600
#    )
#}

DATABASES = {
    'default': {
        'ENGINE': os.getenv('DB_ENGINE', 'django.db.backends.postgresql'),
        'NAME': os.getenv('DB_NAME', 'grandview'),
        'USER': os.getenv('DB_USER', 'grandview_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'gsbgVstgELjnfD6KJmSCpkKl7LgIdbXO'),
        'HOST': os.getenv('DB_HOST', 'dpg-d35a1l33fgac73b9mvjg-a.oregon-postgres.render.com'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Password validation
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

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]  # For development
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # For collectstatic in production

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email backend
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'globalgrowthinvest@gmail.com')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')  # Set in Render dashboard

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'True') == 'True'  # True in production
CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'True') == 'True'  # True in production
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False  # For AJAX
SECURE_HSTS_SECONDS = 31536000  # Enable HSTS for 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True') == 'True'  # True in production
SECURE_REDIRECT_EXEMPT = []

# Login/Redirect Settings
LOGIN_URL = '/api/accounts/login/'
LOGOUT_REDIRECT_URL = '/'
LOGIN_REDIRECT_URL = '/'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}