from django.urls import path
from .views import PackageListView, PackagePurchaseView, UserPurchasesView

urlpatterns = [
    path('packages/', PackageListView.as_view(), name='package_list'),
    path('packages/purchase/', PackagePurchaseView.as_view(), name='package_purchase'),
    path('packages/purchases/', UserPurchasesView.as_view(), name='user_purchases'),
]