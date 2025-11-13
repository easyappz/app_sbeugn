from django.urls import path
from .views import (
    HelloView,
    RegisterView,
    LoginView,
    RefreshView,
    ProfileMeView,
)

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", RefreshView.as_view(), name="auth-refresh"),
    path("profile/me/", ProfileMeView.as_view(), name="profile-me"),
]
