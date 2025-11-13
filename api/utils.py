from datetime import datetime, timedelta, timezone
from typing import Any, Dict

import jwt
from django.conf import settings


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_jwt(member, expires_minutes: int = 60) -> str:
    exp = _now() + timedelta(minutes=expires_minutes)
    payload = {
        "sub": member.id,
        "exp": exp,
        "type": "access",
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token


def create_refresh_jwt(member, expires_days: int = 30) -> str:
    exp = _now() + timedelta(days=expires_days)
    payload = {
        "sub": member.id,
        "exp": exp,
        "type": "refresh",
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token


def decode_jwt(token: str) -> Dict[str, Any]:
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    return payload
