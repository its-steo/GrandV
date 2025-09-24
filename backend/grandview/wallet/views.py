# Updated views.py - No change needed, as serializer handles it
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny  # Callback is public
from rest_framework import status
from .models import Wallet, Deposit, Transaction
from .serializers import WalletSerializer, DepositSerializer, TransactionSerializer, WithdrawSerializer
from .payment import PaymentClient
import json
import logging

logger = logging.getLogger('wallet')

class WalletView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)

class DepositView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DepositSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WithdrawMainView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = WithdrawSerializer(data=request.data, context={'request': request, 'balance_type': 'main_balance'})
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WithdrawReferralView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = WithdrawSerializer(data=request.data, context={'request': request, 'balance_type': 'referral_balance'})
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

class CallbackView(APIView):
    permission_classes = [AllowAny]  # M-Pesa callback is public

    def post(self, request):
        try:
            # Handle JSON body
            if isinstance(request.body, bytes):
                data = json.loads(request.body.decode('utf-8'))
            else:
                data = request.data

            body = data.get('Body', {})
            callback = body.get('stkCallback', {})
            merchant_request_id = callback.get('MerchantRequestID')
            checkout_request_id = callback.get('CheckoutRequestID')
            result_code = callback.get('ResultCode')

            logger.info(f"M-Pesa Callback received: CheckoutRequestID={checkout_request_id}, ResultCode={result_code}")

            if result_code == 0:
                # Success
                callback_metadata = callback.get('CallbackMetadata', {})
                items = callback_metadata.get('Item', [])
                amount = None
                receipt_number = None
                phone_number = None
                transaction_date = None

                for item in items:
                    name = item['Name']
                    value = item['Value']
                    if name == 'Amount':
                        amount = value
                    elif name == 'MpesaReceiptNumber':
                        receipt_number = value
                    elif name == 'PhoneNumber':
                        phone_number = value
                    elif name == 'TransactionDate':
                        transaction_date = value

                if amount and receipt_number and checkout_request_id:
                    deposit = Deposit.objects.filter(transaction_id=checkout_request_id, status='PENDING').first()
                    if deposit and float(amount) == float(deposit.amount):
                        deposit.status = 'COMPLETED'
                        deposit.mpesa_receipt_number = str(receipt_number)
                        deposit.phone_number = str(phone_number)
                        deposit.save()  # Triggers wallet update and email
                        logger.info(f"Deposit {deposit.pk} completed via STK Push")
                    else:
                        logger.warning(f"No matching pending deposit for CheckoutRequestID {checkout_request_id}")
            else:
                # Failure
                error_desc = callback.get('ResultDesc', 'Unknown error')
                deposit = Deposit.objects.filter(transaction_id=checkout_request_id).first()
                if deposit:
                    deposit.status = 'FAILED'
                    deposit.save()
                    logger.info(f"Deposit {deposit.pk} marked as FAILED: {error_desc}")

            return Response({
                'ResultCode': 1,
                'ResultDesc': 'Accepted the service request successfully.'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"M-Pesa Callback processing error: {str(e)}")
            return Response({
                'ResultCode': 1,
                'ResultDesc': 'Accepted the service request successfully.'
            }, status=status.HTTP_200_OK)