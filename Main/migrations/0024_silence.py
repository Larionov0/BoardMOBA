# Generated by Django 4.0.4 on 2022-06-11 10:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Main', '0023_toxicity'),
    ]

    operations = [
        migrations.CreateModel(
            name='Silence',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('duration', models.IntegerField()),
            ],
            options={
                'abstract': False,
            },
        ),
    ]