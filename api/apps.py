from django.apps import AppConfig
from django.db import connection


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self) -> None:  # pragma: no cover - startup hook
        # Prepopulate categories safely after migrations
        try:
            from .models import Category
        except Exception:
            return

        try:
            tables = connection.introspection.table_names()
            if Category._meta.db_table not in tables:
                return
        except Exception:
            return

        try:
            Category.objects.get_or_create(slug="cars", defaults={"name": "Автомобили"})
            Category.objects.get_or_create(slug="real_estate", defaults={"name": "Недвижимость"})
        except Exception:
            # Avoid crashing app startup if DB is not ready
            return
