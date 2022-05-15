# Generated by Django 4.0.4 on 2022-05-15 10:49

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('Main', '0011_alter_uiaction_target_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='Circle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('color', models.CharField(blank=True, default=None, max_length=30, null=True)),
                ('i', models.IntegerField()),
                ('j', models.IntegerField()),
                ('r', models.FloatField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Line',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('color', models.CharField(blank=True, default=None, max_length=30, null=True)),
                ('i1', models.IntegerField()),
                ('j1', models.IntegerField()),
                ('i2', models.IntegerField()),
                ('j2', models.IntegerField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Rectangle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('color', models.CharField(blank=True, default=None, max_length=30, null=True)),
                ('i', models.IntegerField()),
                ('j', models.IntegerField()),
                ('h', models.IntegerField()),
                ('w', models.IntegerField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='skill',
            name='phase',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.CreateModel(
            name='MarksRule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('form_id', models.PositiveIntegerField()),
                ('marks_form_table', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.contenttype')),
            ],
        ),
    ]
