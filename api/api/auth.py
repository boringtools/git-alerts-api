from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import AccessToken


class DocsCookieJWTAuthentication(BaseAuthentication):
    """Authenticate the browser-facing API docs views with the SPA's access token.

    The React app keeps its JWT in localStorage and sends it as a Bearer header. A plain
    browser navigation to /api/docs/ cannot send that header (Swagger UI is server-rendered
    HTML), so the app mirrors the token into a first-party cookie and this class reads it.

    It is wired into the docs and schema views only. Every state-changing endpoint keeps
    header-based auth, so a cookie can never be replayed cross-site to perform a write.
    """

    def authenticate(self, request):
        raw_token = request.COOKIES.get(settings.DOCS_AUTH_COOKIE)
        if not raw_token:
            return None

        try:
            token = AccessToken(raw_token)
        except TokenError as exc:
            raise AuthenticationFailed("Invalid or expired docs token.") from exc

        user_model = get_user_model()
        user_id = token.get(api_settings.USER_ID_CLAIM)
        try:
            user = user_model.objects.get(**{api_settings.USER_ID_FIELD: user_id})
        except (user_model.DoesNotExist, TypeError, ValueError) as exc:
            raise AuthenticationFailed("Unknown user for docs token.") from exc

        if not user.is_active:
            raise AuthenticationFailed("User is inactive.")

        return (user, token)
