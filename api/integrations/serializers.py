from rest_framework import serializers
from .models import UserIntegration

class UserIntegrationSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating an integration token"""
    user = serializers.CharField(source="user.username", read_only=True)
    token = serializers.CharField(write_only=True)

    class Meta:
        model = UserIntegration
        fields = [
            "id", "user", "provider", "token", "status",
            "last_validated_at", "error_message",
            "created_at", "updated_at"
        ]
        read_only_fields = [
            "id", "user", "status",
            "last_validated_at", "error_message",
            "created_at", "updated_at"
        ]

    def validate(self, attrs):
        token = attrs.get("token")

        if not token or len(token) < 10:
            raise serializers.ValidationError("Invalid token provided")
        
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        provider = validated_data["provider"]
        token = validated_data["token"]

        obj, _ = UserIntegration.objects.get_or_create(
            user=user,
            provider=provider,
        )
        obj.set_token(token)
        obj.save()
        
        return obj


    