from rest_framework import generics
from .models import SystemSettings
from .serializers import SystemSettingsSerializer
from rest_framework.permissions import IsAuthenticated

class SystemSettingsView(generics.RetrieveUpdateAPIView):
    """Get or update system-wide settings"""
    serializer_class = SystemSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return SystemSettings.get_settings()
