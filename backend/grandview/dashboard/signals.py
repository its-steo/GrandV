from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order, InstallmentPayment, LipaProgramRegistration, CartItem, Activity
from django.contrib.contenttypes.models import ContentType
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Order)
def track_order_activity(sender, instance, created, **kwargs):
    if created:
        description = f"A user placed an order for {', '.join([item.product.name for item in instance.items.all()])}"
        Activity.objects.create(
            user=instance.user,
            action='ORDER_PLACED',
            description=description,
            content_type=ContentType.objects.get_for_model(Order),
            object_id=instance.id
        )
        logger.info(f"Activity created for order {instance.id}")
    else:
        # For status changes
        description = f"Order status updated to {instance.status}"
        Activity.objects.create(
            user=instance.user,
            action='ORDER_STATUS_CHANGED',
            description=description,
            content_type=ContentType.objects.get_for_model(Order),
            object_id=instance.id
        )

@receiver(post_save, sender=InstallmentPayment)
def track_payment_activity(sender, instance, created, **kwargs):
    if created:
        description = f"A user made a payment of KSh {instance.amount} for installment order {instance.installment_order.order.id}"
        Activity.objects.create(
            user=instance.installment_order.order.user,
            action='PAYMENT_MADE',
            description=description,
            content_type=ContentType.objects.get_for_model(InstallmentPayment),
            object_id=instance.id
        )
        logger.info(f"Activity created for payment {instance.id}")

@receiver(post_save, sender=LipaProgramRegistration)
def track_lipa_activity(sender, instance, created, **kwargs):
    if created:
        description = f"A user registered for Lipa Mdogo Mdogo program"
        Activity.objects.create(
            user=instance.user,
            action='LIPA_REGISTERED',
            description=description,
            content_type=ContentType.objects.get_for_model(LipaProgramRegistration),
            object_id=instance.id
        )
        logger.info(f"Activity created for Lipa registration {instance.id}")

@receiver(post_save, sender=CartItem)
def track_cart_activity(sender, instance, created, **kwargs):
    if created:
        description = f"A user added {instance.product.name} to cart"
        Activity.objects.create(
            user=instance.cart.user,
            action='CART_ITEM_ADDED',
            description=description,
            content_type=ContentType.objects.get_for_model(CartItem),
            object_id=instance.id
        )
        logger.info(f"Activity created for cart item {instance.id}")