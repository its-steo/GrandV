from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import ProductListView, ProductDetailView, AddToCartView, CartView, CheckoutView, RemoveCartItemView, UpdateCartItemView, LipaRegisterView, MakeInstallmentPaymentView, CategoryListView, AllProductsView, LipaRegistrationView, InstallmentOrderListView, OrderListView

urlpatterns = [
    path('dashboard/products/', ProductListView.as_view(), name='product_list'),
    path('dashboard/products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    path('dashboard/cart/add/', AddToCartView.as_view(), name='add_to_cart'),
    path('dashboard/cart/', CartView.as_view(), name='cart'),
    path('dashboard/checkout/', CheckoutView.as_view(), name='checkout'),
    path('dashboard/cart/update/', UpdateCartItemView.as_view(), name='update_cart_item'),
    path('dashboard/cart/remove/', RemoveCartItemView.as_view(), name='remove_cart_item'),
    path('dashboard/lipa/register/', LipaRegisterView.as_view(), name='lipa_register'),
    path('dashboard/installment/pay/', MakeInstallmentPaymentView.as_view(), name='installment_pay'),
    path('dashboard/categories/', CategoryListView.as_view(), name='category_list'),
    path('dashboard/all-products/', AllProductsView.as_view(), name='all_products'),
    path('dashboard/lipa/registration/', LipaRegistrationView.as_view(), name='lipa_registration_status'),
    path('dashboard/installment/orders/', InstallmentOrderListView.as_view(), name='installment_orders'),
    path('dashboard/orders/', OrderListView.as_view(), name='order_list'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)