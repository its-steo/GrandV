from django.db import migrations, models
import django.db.models.deletion
from decimal import Decimal

class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0006_remove_order_address_remove_order_delivery_fee_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='Order',
            name='address',
            field=models.TextField(default='', blank=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='Order',
            name='delivery_fee',
            field=models.DecimalField(decimal_places=2, max_digits=10, default=Decimal('0.00')),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='Order',
            name='phone',
            field=models.CharField(default='', max_length=20, blank=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='InstallmentOrder',
            name='months',
            field=models.IntegerField(default=3),
        ),
        migrations.AlterField(
            model_name='InstallmentOrder',
            name='order',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='dashboard.order'),
        ),
        migrations.AlterField(
            model_name='Order',
            name='discounted_total',
            field=models.DecimalField(decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AlterField(
            model_name='Order',
            name='payment_method',
            field=models.CharField(choices=[('FULL', 'Full Payment'), ('INSTALLMENT', 'Installment')], max_length=20),
        ),
        migrations.AlterField(
            model_name='Order',
            name='rating',
            field=models.PositiveIntegerField(blank=True, choices=[(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)], null=True),
        ),
    ]