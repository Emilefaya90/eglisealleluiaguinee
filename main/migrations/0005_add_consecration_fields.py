from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0004_update_personnel_pastoral'),
    ]

    operations = [
        migrations.AddField(
            model_name='personnelpastoral',
            name='lieu_consecration',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Lieu de consécration'),
        ),
        migrations.AddField(
            model_name='personnelpastoral',
            name='consacre_par',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Consacré par'),
        ),
    ]
