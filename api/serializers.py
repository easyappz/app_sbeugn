from rest_framework import serializers
from .models import Member


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
