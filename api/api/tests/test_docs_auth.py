import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

pytestmark = pytest.mark.django_db


@pytest.fixture
def user():
    return get_user_model().objects.create_user(
        username="docs-user", password="correct-horse-battery"
    )


def docs_cookie(client, user):
    client.cookies[settings.DOCS_AUTH_COOKIE] = str(AccessToken.for_user(user))
    return client


def test_schema_requires_authentication(client):
    assert client.get("/api/schema/").status_code in (401, 403)


def test_swagger_requires_authentication(client):
    assert client.get("/api/docs/").status_code in (401, 403)


def test_schema_accepts_docs_cookie(client, user):
    response = docs_cookie(client, user).get("/api/schema/")
    assert response.status_code == 200
    assert b"openapi" in response.content


def test_swagger_accepts_docs_cookie(client, user):
    assert docs_cookie(client, user).get("/api/docs/").status_code == 200


def test_schema_still_accepts_bearer_token(client, user):
    token = str(AccessToken.for_user(user))
    response = client.get("/api/schema/", HTTP_AUTHORIZATION=f"Bearer {token}")
    assert response.status_code == 200


def test_rejects_invalid_docs_cookie(client):
    client.cookies[settings.DOCS_AUTH_COOKIE] = "not-a-jwt"
    assert client.get("/api/schema/").status_code in (401, 403)


def test_docs_cookie_does_not_unlock_api_data(client, user):
    """The cookie is only honoured by the docs views, never by data endpoints."""
    response = docs_cookie(client, user).get("/scans/")
    assert response.status_code in (401, 403)
