import os
from pathlib import Path
from datetime import timedelta
import dj_database_url
from dotenv import load_dotenv
from storages.backends.s3boto3 import S3Boto3Storage

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-p=ag)#dxywkov=na&&l9%6kp!y%)$%$anw(gxamoih__oxwujl')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,0.0.0.0').split(',')
ALLOWED_HOSTS.append('grandview-shop.onrender.com')

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
    'session_security',  # Added for inactivity expiration
]

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
    'session_security.middleware.SessionSecurityMiddleware',  # Added after SessionMiddleware
]

# Root URL configuration
ROOT_URLCONF = 'grandview.urls'

# Configure WhiteNoise storage
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Custom User model
AUTH_USER_MODEL = 'accounts.CustomUser'

# Allow bypass_commission in Wallet.save
WALLET_BYPASS_COMMISSION = True

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
    },
    'UNAUTHENTICATED_USER': None,
}

# JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,  # Issue new refresh token on each refresh (prevents reuse of stolen tokens)
    'BLACKLIST_AFTER_ROTATION': True,
}

# Channels settings
ASGI_APPLICATION = 'grandview.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [(os.getenv('REDIS_URL', 'redis://localhost:6379/0'))],
        },
    },
}


# Email configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'grandviewshopafrica@gmail.com'
EMAIL_HOST_PASSWORD = 'jcsajscciezckcjr'  # App-specific password for Gmail
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = 'Grandview <grandviewshopafrica@gmail.com>'  # Must match EMAIL_HOST_USER or a verified alias
ADMIN_EMAIL = 'grandviewshopafrica@gmail.com'  # Admin email for deposit notifications


# CORS settings
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,https://grand-v.vercel.app,https://grandview-shop.onrender.com').split(',')

# Database
#DATABASES = {
#    'default': {
#        'ENGINE': 'django.db.backends.sqlite3',
#        'NAME': BASE_DIR / 'db.sqlite3',
#    }
#}

# Render Postgres (uncomment for production)
DATABASE_URL = os.getenv('DATABASE_URL')
DATABASE_SSL = os.getenv('DATABASE_SSL', 'True') == 'True'
database_config = dj_database_url.config(
    default=DATABASE_URL,
    conn_max_age=600,
    conn_health_checks=True,
    ssl_require=DATABASE_SSL,
    engine='django.db.backends.postgresql',
)
database_config['OPTIONS'] = {
    'sslmode': 'require',
    'connect_timeout': 10,
}
DATABASES = {
    'default': database_config
}

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME', 'grandview-storage')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'eu-north-1')

# Custom storage for S3
class S3MediaStorage(S3Boto3Storage):
    bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME', 'grandview-storage')
    region_name = 'eu-north-1'
    access_key = os.getenv('AWS_ACCESS_KEY_ID')
    secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    file_overwrite = False
    custom_domain = f'{bucket_name}.s3.amazonaws.com'
    querystring_auth = False
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

# Site urls
SITE_URL = os.getenv('SITE_URL', 'https://grandview-shop.onrender.com')
SITE_URL = os.getenv('SITE_URL', 'https://localhost:8000')

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False') == 'True'
CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'False') == 'True'
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False
SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', 0))
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False') == 'True'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


# Session settings for inactivity expiration
#SESSION_EXPIRE_AT_BROWSER_CLOSE = True  # Expire session when browser is closed
#SESSION_SAVE_EVERY_REQUEST = True  # Update session on every request (enables sliding expiration)
#SESSION_COOKIE_AGE = 1800  # 30 minutes total session lifetime
#SESSION_SECURITY_WARN_AFTER = 300  # Warn after 5 minutes of inactivity
#SESSION_SECURITY_EXPIRE_AFTER = 600  # Expire after 10 minutes of inactivity

# Login/Redirect Settings
LOGIN_URL = '/api/accounts/login/'
LOGOUT_REDIRECT_URL = '/'
LOGIN_REDIRECT_URL = '/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'