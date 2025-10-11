from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order, InstallmentPayment, LipaProgramRegistration, CartItem, Activity
from django.contrib.contenttypes.models import ContentType
import logging
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

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
        # Send order status update email
        try:
            context = {
                'user': instance.user,
                'order_id': instance.id,
                'status': instance.status,
                'total': instance.discounted_total,
                'ordered_at': instance.ordered_at,
                'description': description,
                'site_url': settings.SITE_URL,
            }
            message = render_to_string('emails/order_status_update.html', context)
            send_mail(
                subject='Order Status Update',
                message='',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.user.email],
                html_message=message,
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send order status update email to {instance.user.email}: {str(e)}")

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
    else:
        # Send lipa status update email for APPROVED or REJECTED
        if instance.status in ['APPROVED', 'REJECTED']:
            try:
                template = 'emails/lipa_approved.html' if instance.status == 'APPROVED' else 'emails/lipa_rejected.html'
                subject = 'Lipa Mdogo Mdogo Approved' if instance.status == 'APPROVED' else 'Lipa Mdogo Mdogo Application Update'
                context = {
                    'user': instance.user,
                    'full_name': instance.full_name,
                    'updated_at': instance.updated_at,
                    'site_url': settings.SITE_URL,
                }
                message = render_to_string(template, context)
                send_mail(
                    subject=subject,
                    message='',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.user.email],
                    html_message=message,
                    fail_silently=False,
                )
            except Exception as e:
                logger.error(f"Failed to send lipa status update email to {instance.user.email}: {str(e)}")

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