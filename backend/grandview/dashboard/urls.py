from django.urls import path
from .views import ProductListView, ProductDetailView, AddToCartView, CartView, CheckoutView, RemoveCartItemView, UpdateCartItemView

urlpatterns = [
    path('dashboard/products/', ProductListView.as_view(), name='product_list'),  # Dashboard: 4 featured
    path('dashboard/products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),  # View specs/sub-images
    path('dashboard/cart/add/', AddToCartView.as_view(), name='add_to_cart'),
    path('dashboard/cart/', CartView.as_view(), name='cart'),
    path('dashboard/checkout/', CheckoutView.as_view(), name='checkout'),
    path('dashboard/cart/update/', UpdateCartItemView.as_view(), name='update_cart_item'),
    path('dashboard/cart/remove/', RemoveCartItemView.as_view(), name='remove_cart_item'),
    
]