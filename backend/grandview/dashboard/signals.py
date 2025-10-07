from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import LipaProgramRegistration, Order
import logging

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=LipaProgramRegistration)
def capture_previous_lipa_status(sender, instance, **kwargs):
    if instance.pk:
        previous = sender.objects.get(pk=instance.pk)
        instance._previous_status = previous.status
    else:
        instance._previous_status = None

@receiver(pre_save, sender=Order)
def capture_previous_order_status(sender, instance, **kwargs):
    if instance.pk:
        previous = sender.objects.get(pk=instance.pk)
        instance._previous_status = previous.status
    else:
        instance._previous_status = None