# Generated by Django 4.0.4 on 2022-04-15 15:56

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Lobby',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='New lobby', max_length=50)),
                ('password', models.CharField(default='12345', max_length=50)),
                ('update_id', models.IntegerField(default=0)),
                ('json_data', models.TextField(max_length=4000)),
            ],
        ),
    ]
