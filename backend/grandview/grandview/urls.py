"""
URL configuration for grandview project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static  # Added: For media serving

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),  # /api/register/, /api/login/
    path('api/', include('adverts.urls')),   # /api/adverts/, etc.
    path('api/', include('dashboard.urls')), # /api/dashboard/products/, etc.
    path('api/', include('packages.urls')),  # /api/packages/, /api/packages/purchase/, /api/packages/purchases/
    path('api/', include('wallet.urls')),    # /api/wallet/, /api/wallet/deposit/, etc.
]

# Serve media files in development - Fixed: Add this
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)  # Bonus: For static too