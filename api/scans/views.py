from logging import getLogger
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .serializers import ScanSerializer
from .models import Scan
from findings.serializers import FindingSerializer
from .tasks import run_scan_task

logger = getLogger(__name__)


class ScanView(generics.ListCreateAPIView):
    """API view for listing and creating scans"""

    serializer_class = ScanSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ["type", "value", "status", "created_at", "completed_at"]
    search_fields = ["value", "type"]
    ordering_fields = ["created_at", "completed_at", "type", "status"]

    def get_queryset(self):
        """Return scans created by the user"""
        return Scan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Attach the logged-in user automatically"""
        scan = serializer.save(user=self.request.user)
        run_scan_task.delay(scan.id)
        logger.info(
            f"scan_created user={self.request.user.username} scan_id={scan.id} type={scan.type}"
        )


class ScanDetailsView(generics.RetrieveDestroyAPIView):
    """API view for retrieving and deleting individual scans"""

    serializer_class = ScanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Returns scans created by the user"""
        return Scan.objects.filter(user=self.request.user)


class ScanFindingsView(generics.ListAPIView):
    """API view for checking findings based on a scan"""

    serializer_class = FindingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Returns findings related to scan created by the user"""
        scan = get_object_or_404(
            Scan,
            pk=self.kwargs["pk"],
            user=self.request.user,
        )
        return scan.findings.all()

