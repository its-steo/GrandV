# premium/management/commands/create_weekly_bonuses.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from premium.models import AgentPurchase, WeeklyBonus
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Creates weekly bonuses for users with active Agent Verification packages'

    def handle(self, *args, **kwargs):
        active_purchases = AgentPurchase.objects.filter(status='ACTIVE')
        created = 0
        for purchase in active_purchases:
            user = purchase.user
            last_bonus = WeeklyBonus.objects.filter(user=user).order_by('-created_at').first()
            if not last_bonus or (timezone.now() - last_bonus.created_at).days >= 7:
                WeeklyBonus.objects.create(user=user)
                logger.info(f"Created weekly bonus for user {user.username}")
                created += 1
        self.stdout.write(self.style.SUCCESS(f'Successfully created {created} weekly bonuses'))