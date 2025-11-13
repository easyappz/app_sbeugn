from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Member(models.Model):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    about = models.TextField(blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    password_hash = models.CharField(max_length=128)

    class Meta:
        verbose_name = "Member"
        verbose_name_plural = "Members"

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return self.username

    @property
    def is_authenticated(self) -> bool:
        # For DRF authentication compatibility
        return True

    def set_password(self, raw_password: str) -> None:
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password(raw_password, self.password_hash)


class Category(models.Model):
    SLUG_CARS = "cars"
    SLUG_REAL_ESTATE = "real_estate"

    SLUG_CHOICES = [
        (SLUG_CARS, "cars"),
        (SLUG_REAL_ESTATE, "real_estate"),
    ]

    slug = models.CharField(max_length=50, unique=True, choices=SLUG_CHOICES)
    name = models.CharField(max_length=255)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class Ad(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="ads")
    contact_info = models.CharField(max_length=255)
    author = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="ads")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Ad"
        verbose_name_plural = "Ads"

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.title}"
