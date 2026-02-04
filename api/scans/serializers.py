from rest_framework import serializers
from .models import Scan
from integrations.models import UserIntegration

class ScanSerializer(serializers.ModelSerializer):
    """Serializer for scan model with user validation"""
    user = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Scan
        fields = "__all__"
        read_only_fields = [
            "user", "status",
            "total_repositories", "total_findings",
            "ignored_repositories", "ignored_findings",
            "scanned_repositories",
            "created_at", "updated_at", "completed_at"
        ]
    
    def validate(self, attrs):
        """Validate that no duplicate active scan exists for the same type and value"""
        user = self.context["request"].user
        type = attrs.get("type")
        value = attrs.get("value")

        github_integration = UserIntegration.objects.filter(
            user=user,
            provider=UserIntegration.Provider.GITHUB
        ).first()

        if not github_integration or github_integration.status != UserIntegration.Status.CONNECTED:
            raise serializers.ValidationError(
                "GitHub integration is not connected. Please connect via /integrations/ first"
            )

        is_scan_exists = Scan.objects.filter(
            user=user,
            type=type,
            value=value,
            status__in=["queued", "in_progress"]
        ).exists()
        
        if is_scan_exists:
            raise serializers.ValidationError(
                "A scan for this target already queued or in progress."
            )
        
        return attrs