# Generated by Django 4.0.4 on 2022-07-16 11:08

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Main', '0027_delayeddamage_end_function_index'),
    ]

    operations = [
        migrations.CreateModel(
            name='Shield',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('duration', models.IntegerField()),
                ('value', models.IntegerField()),
                ('max_value', models.IntegerField()),
                ('armor', models.IntegerField()),
                ('is_alive', models.BooleanField(default=True)),
                ('caster', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='my_shields', to='Main.hero')),
                ('hero', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='shields', to='Main.hero')),
            ],
        ),
    ]
