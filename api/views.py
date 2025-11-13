from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema

from .models import Member
from .serializers import (
    MessageSerializer,
    MemberPublicSerializer,
    MemberPrivateSerializer,
    RegisterSerializer,
    LoginSerializer,
    TokenPairSerializer,
)
from .utils import create_jwt, create_refresh_jwt, decode_jwt


class HelloView(APIView):
    """
    A simple API endpoint that returns a greeting message.
    """

    @extend_schema(
        responses={200: MessageSerializer}, description="Get a hello world message"
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
        return Response(serializer.data)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=RegisterSerializer, responses={201: MemberPublicSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member = serializer.save()
        return Response(MemberPublicSerializer(member).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=LoginSerializer, responses={200: MemberPublicSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data.get("username_or_email")
        password = serializer.validated_data.get("password")

        member = (
            Member.objects.filter(username__iexact=identifier).first()
            or Member.objects.filter(email__iexact=identifier).first()
        )
        if member is None or not member.check_password(password):
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        access = create_jwt(member)
        refresh = create_refresh_jwt(member)
        return Response(
            {
                "access": access,
                "refresh": refresh,
                "member": MemberPublicSerializer(member).data,
            },
            status=status.HTTP_200_OK,
        )


class RefreshView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=TokenPairSerializer, responses={200: dict})
    def post(self, request):
        serializer = TokenPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data.get("refresh")
        try:
            payload = decode_jwt(token)
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)

        if payload.get("type") != "refresh":
            return Response({"detail": "Invalid token type."}, status=status.HTTP_401_UNAUTHORIZED)

        sub = payload.get("sub")
        try:
            member = Member.objects.get(pk=sub)
        except Member.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_401_UNAUTHORIZED)

        access = create_jwt(member)
        return Response({"access": access}, status=status.HTTP_200_OK)


class ProfileMeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: MemberPrivateSerializer})
    def get(self, request):
        return Response(MemberPrivateSerializer(request.user).data)

    @extend_schema(request=MemberPrivateSerializer, responses={200: MemberPrivateSerializer})
    def put(self, request):
        serializer = MemberPrivateSerializer(instance=request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
