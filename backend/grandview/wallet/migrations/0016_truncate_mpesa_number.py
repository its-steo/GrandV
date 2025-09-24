from django.db import migrations
from django.db.models.functions import Length

def truncate_mpesa_number(apps, schema_editor):
    Withdrawal = apps.get_model('wallet', 'Withdrawal')
    # Use Length function to filter mpesa_number values longer than 30
    long_mpesa_numbers = Withdrawal.objects.annotate(
        mpesa_length=Length('mpesa_number')
    ).filter(mpesa_length__gt=30)
    for withdrawal in long_mpesa_numbers:
        withdrawal.mpesa_number = withdrawal.mpesa_number[:30]
        withdrawal.save()

class Migration(migrations.Migration):
    dependencies = [
        ('wallet', '0014_alter_withdrawal_mpesa_number'),
    ]

    operations = [
        migrations.RunPython(truncate_mpesa_number, reverse_code=migrations.RunPython.noop),
    ]