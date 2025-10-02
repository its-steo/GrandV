from django.urls import path
from .views import (
    ProductListView, AllProductsView, ProductDetailView,
    CartView, AddToCartView, UpdateCartView, RemoveFromCartView,
    CheckoutView, OrderListView, InstallmentOrderListView,
    InstallmentPaymentView, LipaRegisterView, LipaPresignedUploadView,
    LipaRegistrationView, TrackOrderView, CouponValidateView,
    ConfirmDeliveryView, SubmitRatingView
)

urlpatterns = [
    path('dashboard/products/', ProductListView.as_view(), name='product_list'),
    path('dashboard/all-products/', AllProductsView.as_view(), name='all_products'),
    path('dashboard/products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    path('dashboard/cart/', CartView.as_view(), name='cart'),
    path('dashboard/cart/add/', AddToCartView.as_view(), name='add_to_cart'),
    path('dashboard/cart/update/', UpdateCartView.as_view(), name='update_cart'),
    path('dashboard/cart/remove/', RemoveFromCartView.as_view(), name='remove_from_cart'),
    path('dashboard/checkout/', CheckoutView.as_view(), name='checkout'),
    path('dashboard/orders/', OrderListView.as_view(), name='order_list'),
    path('dashboard/installment/orders/', InstallmentOrderListView.as_view(), name='installment_orders'),
    path('dashboard/installment/pay/', InstallmentPaymentView.as_view(), name='installment_payment'),
    path('dashboard/lipa/register/', LipaRegisterView.as_view(), name='lipa_register'),
    path('dashboard/lipa/registration/', LipaRegistrationView.as_view(), name='lipa_registration'),
    path('dashboard/lipa/presign/', LipaPresignedUploadView.as_view(), name='lipa_presign'),
    path('dashboard/orders/<int:order_id>/track/', TrackOrderView.as_view(), name='track_order'),
    path('dashboard/orders/<int:order_id>/confirm/', ConfirmDeliveryView.as_view(), name='confirm_delivery'),
    path('dashboard/orders/<int:order_id>/rate/', SubmitRatingView.as_view(), name='submit_rating'),
    path('dashboard/coupon/validate/', CouponValidateView.as_view(), name='coupon_validate'),
]