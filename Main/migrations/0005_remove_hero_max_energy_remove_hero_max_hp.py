# Generated by Django 4.0.4 on 2022-04-23 17:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Main', '0004_hero_max_energy_hero_max_hp'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='hero',
            name='max_energy',
        ),
        migrations.RemoveField(
            model_name='hero',
            name='max_hp',
        ),
    ]
