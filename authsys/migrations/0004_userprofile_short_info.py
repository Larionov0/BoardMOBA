# Generated by Django 4.0.4 on 2022-07-09 11:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authsys', '0003_userprofile_team'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='short_info',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
    ]