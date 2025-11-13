from rest_framework import serializers
from .models import Member, Category, Ad


class MessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)


class MemberPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "about",
            "joined_at",
        ]
        read_only_fields = ["id", "joined_at"]


class MemberPrivateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "about",
            "joined_at",
        ]
        read_only_fields = ["id", "username", "joined_at"]

    def validate_email(self, value: str) -> str:
        member = self.instance
        qs = Member.objects.filter(email__iexact=value)
        if member is not None:
            qs = qs.exclude(pk=member.pk)
        if qs.exists():
            raise serializers.ValidationError("Email is already taken.")
        return value


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=50, allow_blank=True, required=False)
    about = serializers.CharField(allow_blank=True, required=False)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value: str) -> str:
        if Member.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value

    def validate_email(self, value: str) -> str:
        if Member.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email is already taken.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        member = Member(**validated_data)
        member.set_password(password)
        member.save()
        return member


class LoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)


class TokenPairSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "slug", "name"]
        read_only_fields = ["id", "slug", "name"]


class AdSerializer(serializers.ModelSerializer):
    author = MemberPublicSerializer(read_only=True)

    # Write helpers
    category_id = serializers.IntegerField(write_only=True, required=False)
    category_slug = serializers.CharField(write_only=True, required=False)

    # Read helpers
    category_name = serializers.SerializerMethodField(read_only=True)
    category_slug_read = serializers.SerializerMethodField()

    class Meta:
        model = Ad
        fields = [
            "id",
            "title",
            "description",
            "price",
            "category",
            "category_id",
            "category_slug",
            "category_name",
            "category_slug_read",
            "contact_info",
            "created_at",
            "updated_at",
            "is_active",
            "author",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "author",
            "category_name",
            "category_slug_read",
        ]

    def get_category_name(self, obj):
        if obj.category_id and obj.category:
            return obj.category.name
        return None

    def get_category_slug_read(self, obj):  # pragma: no cover - alias for clarity
        if obj.category_id and obj.category:
            return obj.category.slug
        return None

    def _resolve_category(self, attrs):
        # Priority: explicit category (pk) -> category_id -> category_slug
        category = attrs.get("category")
        if category:
            return category
        category_id = attrs.pop("category_id", None)
        category_slug = attrs.pop("category_slug", None)

        if category_id is not None:
            try:
                return Category.objects.get(pk=category_id)
            except Category.DoesNotExist:
                raise serializers.ValidationError({"category_id": "Категория не найдена."})
        if category_slug:
            try:
                return Category.objects.get(slug=category_slug)
            except Category.DoesNotExist:
                raise serializers.ValidationError({"category_slug": "Категория не найдена."})
        # Nothing provided
        raise serializers.ValidationError({"category": "Категория обязательна."})

    def validate(self, attrs):
        # Only resolve category on create or when provided on update
        if self.instance is None or any(k in attrs for k in ("category", "category_id", "category_slug")):
            attrs["category"] = self._resolve_category(attrs)
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        if not request or not getattr(request, "user", None):
            raise serializers.ValidationError({"detail": "Требуется аутентификация."})
        author = request.user
        # ensure author is always current user
        validated_data["author"] = author
        return Ad.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # author cannot be changed
        validated_data.pop("author", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
