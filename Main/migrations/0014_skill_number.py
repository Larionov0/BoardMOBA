# Generated by Django 4.0.4 on 2022-05-21 11:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Main', '0013_marksrule_game_state_marksrule_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='skill',
            name='number',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
    ]