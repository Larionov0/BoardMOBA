# Generated by Django 4.0.4 on 2022-06-04 11:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Main', '0021_solidity_modifier_is_set'),
    ]

    operations = [
        migrations.CreateModel(
            name='Stun',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('duration', models.IntegerField()),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
