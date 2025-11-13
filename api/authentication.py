from typing import Optional, Tuple

import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import Member


class MemberJWTAuthentication(BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request) -> Optional[Tuple[Member, str]]:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            raise AuthenticationFailed("Invalid Authorization header format. Use 'Bearer <token>'.")

        token = parts[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token.")

        member_id = payload.get("sub")
        if not member_id:
            raise AuthenticationFailed("Invalid token payload.")

        try:
            member = Member.objects.get(id=member_id)
        except Member.DoesNotExist:
            raise AuthenticationFailed("User not found.")

        return (member, token)
