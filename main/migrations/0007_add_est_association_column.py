# Generated manually to add missing est_association column

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0006_add_est_association_field'),
    ]

    operations = [
        migrations.AddField(
            model_name='eglise',
            name='est_association',
            field=models.BooleanField(default=False, verbose_name='Est une association enregistrée'),
        ),
    ]
