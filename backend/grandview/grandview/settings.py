from pathlib import Path
import os
from datetime import timedelta
from storages.backends.s3boto3 import S3Boto3Storage

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-p=ag)#dxywkov=na&&l9%6kp!y%)$%$anw(gxamoih__oxwujl')

# SECURITY WARNING: don't run with debug turned on in production!
#DEBUG = os.getenv('DEBUG', 'True') == 'True'
DEBUG = os.getenv('DEBUG', 'False') == 'False'


#ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,0.0.0.0').split(',')
ALLOWED_HOSTS = ['https://grandview-shop.onrender.com', 'https://grand-v.vercel.app', 'https://grandview.co.ke', 'grandview-shop.onrender.com', 'localhost', '127.0.0.1']


CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,https://grandview-shop.onrender.com,https://grand-v.vercel.app,https://grandview.co.ke').split(',')
# CSRF cookie settings
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_NAME = 'csrftoken'


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
    'rest_framework_simplejwt',
    'corsheaders',
    'channels',
    'accounts',
    'phonenumber_field',
    'packages',
    'wallet',
    'adverts',
    'dashboard',
    'support',
    'storages',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
]

ASGI_APPLICATION = 'grandview.asgi.application'

REDIS_URL = os.getenv('REDIS_URL')
if REDIS_URL:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                'hosts': [REDIS_URL],
            },
        },
    }
else:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer'
        },
    }

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100
}
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}


#SITE_URL = 'http://localhost:8000'
SITE_URL = 'https://gamblegalaxy.onrender.com'

AUTH_USER_MODEL = 'accounts.CustomUser'

CSRF_COOKIE_SECURE = False  # Set to True in production with HTTPS
CSRF_COOKIE_SAMESITE = 'Lax'  # Or 'Strict', but 'Lax' is usually sufficient
CSRF_COOKIE_HTTPONLY = False  # Ensure JavaScript can’t access it, but browser sends it

# Session and CORS settings
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = False

# CORS settings
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,https://grand-v.vercel.app,https://grandview-shop.onrender.com').split(',')


ROOT_URLCONF = 'grandview.urls'

# settings.py
ASGI_APPLICATION = 'grandview.asgi.application'


# Email configuration
#EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
#EMAIL_HOST = 'smtp.gmail.com'
#EMAIL_PORT = 587
#EMAIL_HOST_USER = 'grandviewshopafrica@gmail.com'
#EMAIL_HOST_PASSWORD = 'mrodgyesjnjeugmv'  # App-specific password for Gmail
#EMAIL_USE_TLS = True
#DEFAULT_FROM_EMAIL = 'Grandview <grandviewshopafrica@gmail.com>'  # Must match EMAIL_HOST_USER or a verified alias
#ADMIN_EMAIL = 'steomustadd@gmail.com'  # Admin email for deposit notifications

# Template configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = ['Authorization', 'Content-Type', 'Accept']

# Configure WhiteNoise storage
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


# Allow bypass_commission in Wallet.save
WALLET_BYPASS_COMMISSION = True

# Channels settings
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [(os.getenv('REDIS_URL', 'redis://localhost:6379/0'))],
        },
    },
}


#Database

#DATABASES = {
#    'default': {
#        'ENGINE': 'django.db.backends.sqlite3',
#        'NAME': BASE_DIR / 'db.sqlite3',
#    }
#}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'grandviewdb'),
        'USER': os.getenv('DB_USER', 'grandviewdb_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'bB0zU3KjHm8DRVB8JlOZTFbag1o758VI'),
        'HOST': os.getenv('DB_HOST', 'dpg-d3ha5v33fgac739kuc9g-a.oregon-postgres.render.com'),
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

# Custom storage for S3
class S3MediaStorage(S3Boto3Storage):
    bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME', 'grandview-storage')
    region_name = 'eu-north-1'
    access_key = os.getenv('AWS_ACCESS_KEY_ID')
    secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    file_overwrite = False
    custom_domain = f'{bucket_name}.s3.amazonaws.com'
    querystring_auth = False
    object_parameters = {'CacheControl': 'max-age=86400'}

    def __init__(self, *args, **kwargs):
        self.acl = kwargs.pop('default_acl', 'public-read')
        super().__init__(*args, **kwargs)

# Keep DEFAULT_FILE_STORAGE as local
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Static files
STATIC_URL = 'static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

## Email backend
#EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
#EMAIL_HOST = 'smtp.gmail.com'
#EMAIL_PORT = 587
#EMAIL_USE_TLS = True
#EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'grandviewshopafrica@gmail.com')
#EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
#DEFAULT_FROM_EMAIL = 'Grandview <grandviewshopafrica@gmail.com>'
#SITE_URL = os.getenv('SITE_URL', 'https://grandview-shop.onrender.com')
#SITE_URL = os.getenv('SITE_URL', 'https://localhost:8000')

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False') == 'True'
#CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'False') == 'True'
#SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False
#SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', 0))
#SECURE_HSTS_INCLUDE_SUBDOMAINS = True
#SECURE_HSTS_PRELOAD = True
#SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False') == 'False'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

SECURE_SSL_REDIRECT = False if DEBUG else os.getenv('SECURE_SSL_REDIRECT', 'True') == 'True'
SECURE_HSTS_SECONDS = 0 if DEBUG else int(os.getenv('SECURE_HSTS_SECONDS', '31536000'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = False if DEBUG else True
SECURE_HSTS_PRELOAD = False if DEBUG else True
SESSION_COOKIE_SECURE = False if DEBUG else os.getenv('SESSION_COOKIE_SECURE', 'True') == 'True'
CSRF_COOKIE_SECURE = False if DEBUG else os.getenv('CSRF_COOKIE_SECURE', 'True') == 'True'

# Login/Redirect Settings
LOGIN_URL = '/api/accounts/login/'
LOGOUT_REDIRECT_URL = '/'
LOGIN_REDIRECT_URL = '/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'