from django.urls import path
from .views import (
    HelloView,
    RegisterView,
    LoginView,
    RefreshView,
    ProfileMeView,
    AdsListCreateView,
    AdDetailView,
    CategoriesListView,
    MyAdsListView,
)

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", RefreshView.as_view(), name="auth-refresh"),
    path("profile/me/", ProfileMeView.as_view(), name="profile-me"),
    # Ads & categories
    path("ads/", AdsListCreateView.as_view(), name="ads-list-create"),
    path("ads/<int:pk>/", AdDetailView.as_view(), name="ad-detail"),
    path("categories/", CategoriesListView.as_view(), name="categories-list"),
    path("my/ads/", MyAdsListView.as_view(), name="my-ads-list"),
]
