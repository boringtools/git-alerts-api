from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from .auth import DocsCookieJWTAuthentication

class HomeView(APIView):
    """Home API endpoint that returns a welcome message"""
    
    def get(self, request):
        """Handle GET request and return welcome message"""
        return Response({
            "name": "GitAlerts API",
            "version": "1.0.0",
            "status" : "healthy",
        })


from rest_framework.permissions import IsAuthenticated
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

class AuthenticatedSpectacularAPIView(SpectacularAPIView):
    authentication_classes = [SessionAuthentication, JWTAuthentication, DocsCookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

class AuthenticatedSpectacularSwaggerView(SpectacularSwaggerView):
    authentication_classes = [SessionAuthentication, JWTAuthentication, DocsCookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
