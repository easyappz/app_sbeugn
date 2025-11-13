from django.contrib import admin
from .models import Member, Category, Ad


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "phone", "joined_at")
    search_fields = ("username", "email", "phone")
    ordering = ("-joined_at",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "slug", "name")
    search_fields = ("slug", "name")
    ordering = ("slug",)


@admin.register(Ad)
class AdAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "category",
        "price",
        "author",
        "is_active",
        "created_at",
    )
    search_fields = ("title", "description", "contact_info")
    list_filter = ("category", "is_active", "created_at")
    ordering = ("-created_at",)
