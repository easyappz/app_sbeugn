from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAuthorOrReadOnly(BasePermission):
    message = "У вас нет прав для изменения этого объекта."

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        author = getattr(obj, "author", None)
        return author == getattr(request, "user", None)
