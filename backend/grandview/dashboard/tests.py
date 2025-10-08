from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from .models import Product, Category, Cart, CartItem, Order, LipaProgramRegistration, Activity, InstallmentOrder, InstallmentPayment
from wallet.models import Wallet
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta

User = get_user_model()

class RecentActivityTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user1 = User.objects.create_user(username='user1', password='pass123', email='user1@example.com')
        self.user2 = User.objects.create_user(username='user2', password='pass123', email='user2@example.com')
        self.client.login(username='user1', password='pass123')
        
        # Create wallet
        Wallet.objects.create(user=self.user1, deposit_balance=1000.00)
        Wallet.objects.create(user=self.user2, deposit_balance=1000.00)
        
        # Create category and product
        self.category = Category.objects.create(name='Test Category', slug='test')
        self.product = Product.objects.create(
            name='Test Product', price=100.00, category=self.category,
            main_image='products/test.jpg', description='Test desc', supports_installments=True
        )
        
        # Create activities via events
        self.cart1 = Cart.objects.create(user=self.user1)
        CartItem.objects.create(cart=self.cart1, product=self.product, quantity=1)  # Triggers signal
        
        order_data = {
            'items': [{'product_id': self.product.id, 'quantity': 1}],
            'payment_method': 'FULL',
            'address': '123 Test St',
            'phone': '1234567890',
            'delivery_fee': 10.00
        }
        self.client.post(reverse('checkout'), order_data, content_type='application/json')  # Triggers order signal
        
        self.lipa_reg = LipaProgramRegistration.objects.create(
            user=self.user2, full_name='Test User2', date_of_birth=timezone.now().date(),
            address='456 Test Ave', status='PENDING',
            id_front='lipa_documents/id_front/test.jpg',
            id_back='lipa_documents/id_back/test.jpg',
            passport_photo='lipa_documents/passport/test.jpg'
        )  # Triggers Lipa signal

    def test_activity_creation(self):
        self.assertGreater(Activity.objects.count(), 0)
        cart_activity = Activity.objects.filter(action='CART_ITEM_ADDED').first()
        self.assertIsNotNone(cart_activity)
        self.assertEqual(cart_activity.user, self.user1)

        order_activity = Activity.objects.filter(action='ORDER_PLACED').first()
        self.assertIsNotNone(order_activity)
        self.assertEqual(order_activity.user, self.user1)

        lipa_activity = Activity.objects.filter(action='LIPA_REGISTERED').first()
        self.assertIsNotNone(lipa_activity)
        self.assertEqual(lipa_activity.user, self.user2)

    def test_recent_activity_view(self):
        response = self.client.get(reverse('recent_activity'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.json())
        self.assertGreater(len(response.json()['results']), 0)
        activity = response.json()['results'][0]
        self.assertIn('action_display', activity)
        self.assertIn('description', activity)
        self.assertIn('timestamp', activity)

    def test_pagination(self):
        # Create more activities to test pagination
        for i in range(25):
            Activity.objects.create(
                user=self.user1,
                action='ORDER_STATUS_CHANGED',
                description=f'Test activity {i}'
            )
        
        response = self.client.get(reverse('recent_activity'), {'page': 2, 'page_size': 10})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()['results']), 10)  # page_size=10, page=2