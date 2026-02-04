from logging import getLogger
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import FindingSerializer, IgnoreFindingTypeSerializer, IgnoreFindingDomainSerializer
from . models import Finding, IgnoreFindingType, IgnoreFindingDomain

logger = getLogger(__name__)

class FindingView(generics.ListAPIView):
    "API view for listing findings"
    serializer_class = FindingSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ["type", "value", "email", "repository", "scan", "validated", "created_at"]
    search_fields = ["repository", "email", "description", "value", "commit_hash"]
    ordering_fields = ["created_at", "type", "repository", "email"]

    def get_queryset(self):
        return Finding.objects.filter(scan__user=self.request.user)

class FindingDetailsView(generics.RetrieveUpdateDestroyAPIView):
    """API view for retrieving and deleting individual findings"""
    serializer_class = FindingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Returns individual finding belongs to the user"""
        return Finding.objects.filter(scan__user=self.request.user)

class IgnoreFindingTypeView(generics.ListCreateAPIView):
    """API view for the ignored finding types"""
    queryset = IgnoreFindingType.objects.all()
    serializer_class = IgnoreFindingTypeSerializer
    permission_classes = [IsAuthenticated]

class IgnoreFindingTypeDetailsView(generics.RetrieveDestroyAPIView):
    """API view for retrieving and deleting ignored finding types"""
    serializer_class = IgnoreFindingTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Returns the individual ignored finding type """
        return IgnoreFindingType.objects.filter(id=self.kwargs["pk"])
    
class IgnoreFindingDomainView(generics.ListCreateAPIView):
    """API view for the ignored finding domains"""
    queryset = IgnoreFindingDomain.objects.all()
    serializer_class = IgnoreFindingDomainSerializer
    permission_classes = [IsAuthenticated]

class IgnoredFindingDomainDetailView(generics.RetrieveDestroyAPIView):
    """API view for retreving and deleting ignored finding domains"""
    serializer_class = IgnoreFindingDomainSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return IgnoreFindingDomain.objects.filter(id=self.kwargs["pk"])
