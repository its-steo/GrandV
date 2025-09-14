#from rest_framework.views import APIView
#from rest_framework.response import Response
#from rest_framework import status
#from rest_framework.permissions import IsAuthenticated, AllowAny
#from .models import Product, Cart, CartItem, Order
#from .serializers import ProductSerializer, CartSerializer, OrderSerializer, CartItemSerializer
#from django.shortcuts import get_object_or_404
#from decimal import Decimal
#
#class ProductListView(APIView):
#    permission_classes = [AllowAny]
#
#    def get(self, request):
#        # Dashboard: Only 4 featured products
#        products = Product.objects.filter(is_featured=True)[:4]
#        serializer = ProductSerializer(products, many=True)
#        return Response(serializer.data)
#
#class ProductDetailView(APIView):
#    permission_classes = [AllowAny]
#
#    def get(self, request, pk):
#        product = get_object_or_404(Product, pk=pk)
#        serializer = ProductSerializer(product)
#        return Response(serializer.data)
#
#class AddToCartView(APIView):
#    permission_classes = [IsAuthenticated]
#
#    def post(self, request):
#        product_id = request.data.get('product_id')
#        quantity = request.data.get('quantity', 1)
#        if quantity < 1:
#            return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)
#        product = get_object_or_404(Product, pk=product_id)
#        cart, created = Cart.objects.get_or_create(user=request.user)
#        cart_item, created = CartItem.objects.get_or_create(
#            cart=cart,
#            product=product,
#            defaults={'quantity': quantity}
#        )
#        if not created:
#            cart_item.quantity += quantity
#            cart_item.save()
#        return Response({"message": "Added to cart", "cart_item": CartItemSerializer(cart_item).data}, status=status.HTTP_201_CREATED)
#
#class CartView(APIView):
#    permission_classes = [IsAuthenticated]
#
#    def get(self, request):
#        cart, _ = Cart.objects.get_or_create(user=request.user)
#        serializer = CartSerializer(cart)
#        return Response(serializer.data)
#
#class CheckoutView(APIView):
#    permission_classes = [IsAuthenticated]
#
#    def post(self, request):
#        serializer = OrderSerializer(data=request.data, context={'request': request})
#        if serializer.is_valid():
#            order = serializer.save()
#            return Response({"message": "Order placed successfully", "order": OrderSerializer(order).data}, status=status.HTTP_201_CREATED)
#        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Product, Cart, CartItem, Order, Category
from .serializers import ProductSerializer, CartSerializer, OrderSerializer, CartItemSerializer
from django.shortcuts import get_object_or_404
from decimal import Decimal
import logging  # For debugging

logger = logging.getLogger(__name__)

class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Dashboard: Only 4 featured products
        products = Product.objects.filter(is_featured=True)[:4]
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Fixed: Validate request.data is dict before .get()
        if not isinstance(request.data, dict):
            logger.error(f"Invalid request data type: {type(request.data)}, data: {request.data}")
            return Response({"error": "Invalid request data. Expected JSON body with product_id."}, status=status.HTTP_400_BAD_REQUEST)
        
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        if not product_id:
            return Response({"error": "product_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if quantity < 1:
            return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product = get_object_or_404(Product, pk=product_id)
        except ValueError:
            return Response({"error": "Invalid product_id"}, status=status.HTTP_400_BAD_REQUEST)
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        return Response({"message": "Added to cart", "cart_item": CartItemSerializer(cart_item).data}, status=status.HTTP_201_CREATED)

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            return Response({"message": "Order placed successfully", "order": OrderSerializer(order).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart_item_id = request.data.get('cart_item_id')
        quantity = request.data.get('quantity', 1)
        if quantity < 1:
            return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)
        cart_item = get_object_or_404(CartItem, id=cart_item_id, cart__user=request.user)
        cart_item.quantity = quantity
        cart_item.save()
        serializer = CartItemSerializer(cart_item)
        return Response({"message": "Cart updated", "cart_item": serializer.data}, status=status.HTTP_200_OK)

class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart_item_id = request.data.get('cart_item_id')
        cart_item = get_object_or_404(CartItem, id=cart_item_id, cart__user=request.user)
        cart_item.delete()
        return Response({"message": "Item removed from cart"}, status=status.HTTP_200_OK) 

class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Dashboard: Only 4 featured products
        products = Product.objects.filter(is_featured=True)[:4]
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from .serializers import CategorySerializer
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

class AllProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
  