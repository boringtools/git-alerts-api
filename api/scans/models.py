from django.contrib.auth.models import User
from django.db import models

class Scan(models.Model):
    """Scan model for user initiated scans"""

    class ScanTypes(models.TextChoices):
        ORG_REPOS = "org_repos", "Organization Repositories"
        ORG_USERS = "org_users", "Organization Users"
        SEARCH_CODE = "search_code", "Search Code"
        SEARCH_COMMITS = "search_commits", "Search Commits"
        SEARCH_ISSUES = "search_issues", "Search Issues"
        SEARCH_REPOS = "search_repos", "Search Repositories"
        SEARCH_USERS = "search_users", "Search Users"

    class ScanStatus(models.TextChoices):
        QUEUED = "queued", "Queued"
        INPROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="scans")
    type = models.CharField(max_length=255,choices=ScanTypes.choices, default=ScanTypes.ORG_REPOS)
    value = models.CharField(max_length=255)
    status = models.CharField(max_length=255, choices=ScanStatus.choices, default=ScanStatus.QUEUED)

    total_repositories = models.IntegerField(default=0)
    total_findings = models.IntegerField(default=0)

    ignored_repositories = models.IntegerField(default=0)
    ignored_findings = models.IntegerField(default=0)

    scanned_repositories = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.type} - {self.value} - {self.status}"
    
    class Meta:
        verbose_name = "Scan"
        verbose_name_plural = "Scans"
        ordering = ["-created_at"]


