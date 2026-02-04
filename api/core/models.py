from django.db import models
from scans.models import Scan

class RepoScanHistory(models.Model):
    """Tracks scan history for each repository"""

    class ScanStatus(models.TextChoices):
        STARTED = "started", "Started"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        SKIPPED = "skipped", "Skipped"

    repository = models.CharField(max_length=512)
    status = models.CharField(max_length=255, choices=ScanStatus.choices, default=ScanStatus.COMPLETED)
    findings_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.repository} - {self.status}"

    class Meta:
        verbose_name = "Repository"
        verbose_name_plural = "Repositories"
        ordering = ["-completed_at"]

class SystemSettings(models.Model):
    """System wide scanning configuration"""

    skip_recent_days = models.IntegerField(
        default=15,
        help_text="Skip repository scanned within this many days"
    )

    verified_only = models.BooleanField(
        default=True,
        help_text="Only scan for verified secrets (faster, fewer false positives)"
    )

    org_repos_only = models.BooleanField(
        default=False,
        help_text="Only scan repositories owned by organizations (not individual users)"
    )

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "System Settings"
    
    class Meta:
        verbose_name = "System Settings",
        verbose_name_plural = "System Settings"

    @classmethod
    def get_settings(cls):
        """Get or create settings instance"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings
    
    def save(self, *args, **kwargs):
        """Ensure only one instance exists"""
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Prevent deletion of instance"""
        pass
