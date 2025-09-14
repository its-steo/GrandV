from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import PackageSerializer, PurchaseCreateSerializer, PurchaseSerializer
from .models import Package, Purchase

class PackageListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        packages = Package.objects.all()
        serializer = PackageSerializer(packages, many=True)
        return Response(serializer.data)

class PackagePurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PurchaseCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            purchase = serializer.save()
            return Response({'message': 'Package purchased successfully', 'purchase_id': purchase.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPurchasesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        purchases = Purchase.objects.filter(user=request.user).order_by('-purchase_date')
        serializer = PurchaseSerializer(purchases, many=True)
        return Response(serializer.data)