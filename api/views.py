from django.utils import timezone
from django.db.models import Q
from django.utils.dateparse import parse_datetime, parse_date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, SAFE_METHODS
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Member, Category, Ad
from .serializers import (
    MessageSerializer,
    MemberPublicSerializer,
    MemberPrivateSerializer,
    RegisterSerializer,
    LoginSerializer,
    TokenPairSerializer,
    CategorySerializer,
    AdSerializer,
)
from .utils import create_jwt, create_refresh_jwt, decode_jwt
from .permissions import IsAuthorOrReadOnly


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


class AdsListCreateView(APIView):
    """List ads with filters and create new ad (auth required)."""

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    @extend_schema(
        parameters=[
            OpenApiParameter(name="category", required=False, type=str, description="Category slug or id"),
            OpenApiParameter(name="min_price", required=False, type=float, description="Minimum price"),
            OpenApiParameter(name="max_price", required=False, type=float, description="Maximum price"),
            OpenApiParameter(name="date_from", required=False, type=str, description="ISO date or datetime from"),
            OpenApiParameter(name="date_to", required=False, type=str, description="ISO date or datetime to"),
            OpenApiParameter(name="search", required=False, type=str, description="Search in title and description"),
            OpenApiParameter(name="ordering", required=False, type=str, description="ordering: price, -price, created_at, -created_at"),
        ],
        responses={200: AdSerializer},
    )
    def get(self, request):
        qs = Ad.objects.select_related("category", "author").all()

        # category filter: slug or id
        category_param = request.query_params.get("category")
        if category_param:
            if category_param.isdigit():
                qs = qs.filter(category_id=int(category_param))
            else:
                qs = qs.filter(category__slug=category_param)

        # price filters
        min_price = request.query_params.get("min_price")
        max_price = request.query_params.get("max_price")
        try:
            if min_price is not None:
                qs = qs.filter(price__gte=min_price)
        except Exception:
            pass
        try:
            if max_price is not None:
                qs = qs.filter(price__lte=max_price)
        except Exception:
            pass

        # date filters
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        if date_from:
            dt = parse_datetime(date_from) or parse_date(date_from)
            if dt is not None:
                # parse_date returns date; parse_datetime returns datetime
                if hasattr(dt, "year") and not hasattr(dt, "hour"):
                    qs = qs.filter(created_at__date__gte=dt)
                else:
                    qs = qs.filter(created_at__gte=dt)
        if date_to:
            dt = parse_datetime(date_to) or parse_date(date_to)
            if dt is not None:
                if hasattr(dt, "year") and not hasattr(dt, "hour"):
                    qs = qs.filter(created_at__date__lte=dt)
                else:
                    qs = qs.filter(created_at__lte=dt)

        # search
        search = request.query_params.get("search")
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))

        # ordering
        ordering = request.query_params.get("ordering") or "-created_at"
        allowed = {"price", "-price", "created_at", "-created_at"}
        if ordering in allowed:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by("-created_at")

        serializer = AdSerializer(qs, many=True)
        return Response(serializer.data)

    @extend_schema(request=AdSerializer, responses={201: AdSerializer})
    def post(self, request):
        serializer = AdSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        ad = serializer.save()
        out = AdSerializer(ad)
        return Response(out.data, status=status.HTTP_201_CREATED)


class AdDetailView(APIView):
    """Retrieve, update or delete an ad."""

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAuthenticated(), IsAuthorOrReadOnly()]

    @extend_schema(responses={200: AdSerializer})
    def get(self, request, pk: int):
        try:
            ad = Ad.objects.select_related("category", "author").get(pk=pk)
        except Ad.DoesNotExist:
            return Response({"detail": "Объявление не найдено."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdSerializer(ad)
        return Response(serializer.data)

    @extend_schema(request=AdSerializer, responses={200: AdSerializer})
    def put(self, request, pk: int):
        try:
            ad = Ad.objects.select_related("category", "author").get(pk=pk)
        except Ad.DoesNotExist:
            return Response({"detail": "Объявление не найдено."}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, ad)
        serializer = AdSerializer(instance=ad, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        ad = serializer.save()
        return Response(AdSerializer(ad).data)

    @extend_schema(responses={204: None})
    def delete(self, request, pk: int):
        try:
            ad = Ad.objects.select_related("category", "author").get(pk=pk)
        except Ad.DoesNotExist:
            return Response({"detail": "Объявление не найдено."}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, ad)
        ad.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CategoriesListView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses={200: CategorySerializer})
    def get(self, request):
        qs = Category.objects.all().order_by("id")
        serializer = CategorySerializer(qs, many=True)
        return Response(serializer.data)


class MyAdsListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: AdSerializer})
    def get(self, request):
        qs = Ad.objects.select_related("category", "author").filter(author=request.user).order_by("-created_at")
        serializer = AdSerializer(qs, many=True)
        return Response(serializer.data)
