from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Member',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=150, unique=True)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('phone', models.CharField(blank=True, max_length=50, null=True)),
                ('about', models.TextField(blank=True)),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('password_hash', models.CharField(max_length=128)),
            ],
            options={
                'verbose_name': 'Member',
                'verbose_name_plural': 'Members',
            },
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.CharField(choices=[('cars', 'cars'), ('real_estate', 'real_estate')], max_length=50, unique=True)),
                ('name', models.CharField(max_length=255)),
            ],
            options={
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
            },
        ),
        migrations.CreateModel(
            name='Ad',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('contact_info', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ads', to='api.member')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='ads', to='api.category')),
            ],
            options={
                'verbose_name': 'Ad',
                'verbose_name_plural': 'Ads',
                'ordering': ['-created_at'],
            },
        ),
    ]
