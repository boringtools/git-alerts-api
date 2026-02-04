from rest_framework.views import APIView
from rest_framework.response import Response

class HomeView(APIView):
    """Home API endpoint that returns a welcome message"""
    
    def get(self, request):
        """Handle GET request and return welcome message"""
        return Response({
            "name": "GitAlerts API",
            "version": "1.0.0",
            "status" : "healthy",
        })
