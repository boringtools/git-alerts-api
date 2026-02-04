from logging import getLogger
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserIntegrationSerializer
from .models import UserIntegration
from .tasks import run_validation_task

logger = getLogger(__name__)

class UserIntegrationView(generics.ListCreateAPIView):
    """API view for listing and creating integrations"""
    serializer_class = UserIntegrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return integration creeated by the user"""
        return UserIntegration.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Triggers celery task to validate integration token"""
        integration = serializer.save(user=self.request.user)
        run_validation_task.delay(integration.id)
        logger.info(
            f"integration_created user={self.request.user.username} integration_id={integration.id} provider={integration.provider}"
        )


class UserIntegrationValidateView(APIView):
    """API endpoint to manually trigger integration validation"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Trigger validation for a specific integration"""
        try:
            integration = UserIntegration.objects.get(
                pk=pk,
                user=request.user
            )
        except UserIntegration.DoesNotExist:
            return Response(
                {"error": "Integration not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Trigger validation task
        run_validation_task.delay(integration.id)

        logger.info(
            f"event=manual_validation_triggered user={request.user.username} integration_id={integration.id} provider={integration.provider}"
        )

        return Response(
            {
                "message": "Validation started",
                "integration_id": integration.id,
                "provider": integration.provider,
                "status": "pending"
            },
            status=status.HTTP_202_ACCEPTED
        )



