from rest_framework import serializers
from .models import SystemSettings


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ["skip_recent_days", "verified_only", "org_repos_only", "updated_at"]
        read_only_fields = ["updated_at"]
