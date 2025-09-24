from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.template.exceptions import TemplateDoesNotExist
import logging
from .models import LipaProgramRegistration, Order

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=LipaProgramRegistration)
def capture_previous_lipa_status(sender, instance, **kwargs):
    if instance.pk:
        previous = sender.objects.get(pk=instance.pk)
        instance._previous_status = previous.status
    else:
        instance._previous_status = None

@receiver(post_save, sender=LipaProgramRegistration)
def send_lipa_status_email(sender, instance, created, **kwargs):
    if created or instance._previous_status == instance.status:
        return  # Confirmation handled in view; no change

    try:
        if instance.status == 'APPROVED':
            template_name = 'emails/lipa_approved.html'
            subject = "Congratulations! Your Lipa Mdogo Mdogo Application is Approved 🎉"
        elif instance.status == 'REJECTED':
            template_name = 'emails/lipa_rejected.html'
            subject = "Update on Your Lipa Mdogo Mdogo Application ❌"
        else:
            return

        html_message = render_to_string(template_name, {
            'user': instance.user,
            'full_name': instance.full_name,
            'status': instance.status,
            'updated_at': instance.updated_at,
        })
        plain_message = strip_tags(html_message)
        from_email = 'yourapp@example.com'  # Replace with your sender email
        to_email = instance.user.email

        send_mail(
            subject,
            plain_message,
            from_email,
            [to_email],
            html_message=html_message,
        )
        logger.info(f"Lipa status email sent to {to_email} for status {instance.status}")
    except TemplateDoesNotExist as e:
        logger.warning(f"Email template not found: {str(e)}. Skipping email notification.")
    except Exception as e:
        logger.error(f"Failed to send Lipa status email: {str(e)}.")

@receiver(pre_save, sender=Order)
def capture_previous_order_status(sender, instance, **kwargs):
    if instance.pk:
        previous = sender.objects.get(pk=instance.pk)
        instance._previous_status = previous.status
    else:
        instance._previous_status = None

@receiver(post_save, sender=Order)
def send_order_status_update_email(sender, instance, created, **kwargs):
    if created or instance._previous_status == instance.status:
        return  # Confirmation handled in view; no change

    try:
        template_name = 'emails/order_status_update.html'
        subject = f"Your Order #{instance.id} Status Update: {instance.status.capitalize()} 📦"

        status_descriptions = {
            'PROCESSING': 'Your order is now being processed. We\'re preparing your items!',
            'SHIPPED': 'Great news! Your order has been shipped and is on its way.',
            'DELIVERED': 'Your order has been delivered. Enjoy your purchase!',
            'CANCELLED': 'Your order has been cancelled. If this was unexpected, please contact support.',
        }
        description = status_descriptions.get(instance.status, f'Your order status has changed to {instance.status}.')

        html_message = render_to_string(template_name, {
            'user': instance.user,
            'order_id': instance.id,
            'status': instance.status,
            'description': description,
            'ordered_at': instance.ordered_at,
            'total': instance.discounted_total,
        })
        plain_message = strip_tags(html_message)
        from_email = 'yourapp@example.com'  # Replace with your sender email
        to_email = instance.user.email

        send_mail(
            subject,
            plain_message,
            from_email,
            [to_email],
            html_message=html_message,
        )
        logger.info(f"Order status update email sent to {to_email} for order {instance.id}, status {instance.status}")
    except TemplateDoesNotExist as e:
        logger.warning(f"Email template not found: {str(e)}. Skipping email notification.")
    except Exception as e:
        logger.error(f"Failed to send order status update email: {str(e)}.")