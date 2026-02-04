from django.contrib import admin
from django.urls import path, include
from .views import HomeView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Home
    path('', HomeView.as_view(), name='home'),

    # Scans
    path('', include('scans.urls')),

    # Findings
    path('', include('findings.urls')),

    # Integrations
    path('', include('integrations.urls')),

    # Core
    path('', include('core.urls')),

    # Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # OpenAPI Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
