# Generated by Django 4.0.4 on 2022-08-13 09:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Main', '0028_shield'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='gamestate',
            name='m',
        ),
        migrations.RemoveField(
            model_name='gamestate',
            name='n',
        ),
        migrations.AddField(
            model_name='gamestate',
            name='map_id',
            field=models.IntegerField(default=1),
        ),
    ]